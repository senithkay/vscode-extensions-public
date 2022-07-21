/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import {
    ANALYZE_TYPE, DiagramEditorLangClientInterface, GraphData, GraphPoint, PerformanceAnalyzerGraphResponse,
    PerformanceAnalyzerResponse, SequenceGraphPoint, TopBarData
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { ConnectorLatency, mergeAnalysisDetails } from "./mergePerformanceData";

const SUCCESS = "Success";
let syntaxTree: any;
let langClient: DiagramEditorLangClientInterface;
let filePath: string;
let graphData: GraphPoint[];
let sequenceDiagramData: SequenceGraphPoint[];
let diagramRedraw: any;
let currentResourcePos: NodePosition;
let showPerformanceGraph: (request: PerformanceGraphRequest) => Promise<boolean>;
let getDataFromChoreo: (data: any, analyzeType: ANALYZE_TYPE) => Promise<PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse | undefined>;
const endpoints = new Map<string, PerformanceAnalyzerResponse>();

export interface PerformanceGraphRequest {
    file: string;
    data: GraphData;
}

export interface PerformanceAnalyzerRealtimeResponse {
    message: string;
    type: any;
    positions: Map<string, string>;
    concurrency: Values;
    latency: Values;
    tps: Values;
    connectorLatencies: Map<string, Values>;
}

export interface Values {
    min?: number;
    max: number;
}

/**
 * Add realtime performance label.
 * @param st syntax tree
 * @param file file name
 * @param lc language client
 * @param showPerf Show performance graph function
 * @param getPerfDataFromChoreo Show performance graph errors
 * @param showMsg Show alerts in vscode side
 */
export async function addPerformanceData(st: any, file: string, lc: DiagramEditorLangClientInterface,
    showPerf: (request: PerformanceGraphRequest) => Promise<boolean>,
    getPerfDataFromChoreo: (data: any, analyzeType: ANALYZE_TYPE) =>
        Promise<PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse
            | undefined>): Promise<void> {
    if (!st || !file || !lc) {
        return;
    }

    syntaxTree = st;
    langClient = lc;
    filePath = file;
    showPerformanceGraph = showPerf;
    getDataFromChoreo = getPerfDataFromChoreo;

    await langClient.getPerfEndpoints({
        documentIdentifier: {
            uri: filePath
        },
        isWorkerSupported: true
    }).then(async (response) => {
        if (!response) {
            return;
        }

        for (const resource of response) {
            if (resource.type === SUCCESS) {

                const realtimeData = await getDataFromChoreo(resource, ANALYZE_TYPE.REALTIME) as PerformanceAnalyzerRealtimeResponse;
                if (!realtimeData) {
                    return;
                }
                const pos = resource.resourcePos;
                const position = `${pos.start.line},${pos.start.character},${pos.end.line},${pos.end.character}`;
                endpoints.set(position, resource);

                // add connector latencies
                const analysisData: ConnectorLatency[] = [];
                const concurrency = realtimeData.concurrency;
                const latency = realtimeData.latency;
                const tps = realtimeData.tps;

                const topBarData: TopBarData = {
                    concurrency: `${concurrency.min} - ${concurrency.max}`,
                    latency: getPerfValuesWithUnit(latency),
                    tps: `${tps.min} - ${tps.max}`,
                    analyzeType: ANALYZE_TYPE.REALTIME
                };

                Object.keys(realtimeData.connectorLatencies).forEach((key) => {
                    const name = (realtimeData.positions[key]).split("/").pop();
                    const latencies = realtimeData.connectorLatencies[key];
                    analysisData.push({ name, latency: getPerfValuesWithUnit(latencies) });

                });

                mergeAnalysisDetails(syntaxTree, topBarData, analysisData,
                    { startLine: pos.start.line, startColumn: pos.start.character, endLine: pos.end.line, endColumn: pos.end.character });

            }
        }
    });
}

export async function addAdvancedLabels(name: string, range: NodePosition, diagramRedrawFunc: any) {
    if (!filePath || !langClient || !diagramRedrawFunc) {
        return;
    }
    currentResourcePos = range;

    diagramRedraw = diagramRedrawFunc;

    const position = `${range.startLine},${range.startColumn},${range.endLine},${range.endColumn}`;

    let data = await getDataFromChoreo(endpoints.get(position), ANALYZE_TYPE.ADVANCED);

    if (!data) {
        return;
    }
    data = data as PerformanceAnalyzerGraphResponse;

    sequenceDiagramData = data.sequenceDiagramData;
    graphData = data.graphData;
    updateAdvancedLabels(0);
    showPerformanceChart({ name, graphData })
}

function updateAdvancedLabels(concurrency: number) {

    if (!syntaxTree || !sequenceDiagramData || !diagramRedraw || !graphData) {
        return;
    }

    if (sequenceDiagramData.length === 0) {
        return;
    }

    const data = sequenceDiagramData[concurrency];
    const values = data.values;
    let file: string;

    const analysisData: ConnectorLatency[] = [];
    for (const value of values) {
        const name = value.name.replace("(", "").replace(")", "");
        const latency = (value.latency).toString();
        const tps = value.tps;
        file = name.split("/")[0];

        analysisData.push({ name, latency });
    }

    mergeAnalysisDetails(syntaxTree, { ...graphData[concurrency], analyzeType: ANALYZE_TYPE.ADVANCED }, analysisData, currentResourcePos);
    diagramRedraw(syntaxTree);
}

async function showPerformanceChart(data: GraphData) {
    await showPerformanceGraph({
        file: filePath,
        data
    });
}

export async function updatePerformanceLabels(concurrency: number) {

    switch (concurrency) {
        case -1: {
            mergeAnalysisDetails(syntaxTree, null, null, null, true);
            await addPerformanceData(syntaxTree, filePath, langClient, showPerformanceGraph, getDataFromChoreo);
            diagramRedraw(syntaxTree);
            return true;
        }
        case 1: {
            concurrency = 0;
            break;
        }
        case 25: {
            concurrency = 1;
            break;
        }
        case 50: {
            concurrency = 2;
            break;
        }
        case 75: {
            concurrency = 3;
            break;
        }
        case 100: {
            concurrency = 4;
            break;
        }
        default: {
            return false;
        }
    }
    updateAdvancedLabels(concurrency);
    return true;
}

function getPerfValuesWithUnit(latencies: Values): string {

    return `${getResponseTime(latencies.min)} - ${getResponseTime(latencies.max)} ${getResponseUnit(latencies.max)}`;
}

function getResponseTime(responseTime: any) {
    return responseTime > 1000 ? responseTime.toFixed(2) / 1000 : responseTime.toFixed(2)
}

function getResponseUnit(responseTime: number) {
    return responseTime > 1000 ? " s" : " ms";
}
