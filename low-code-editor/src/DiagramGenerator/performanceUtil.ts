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
    DiagramEditorLangClientInterface, GraphData, GraphPoint, PerformanceAnalyzerGraphResponse,
    PerformanceAnalyzerRealtimeResponse, PerformanceAnalyzerResponse, SequenceGraphPoint, SequenceGraphPointValue
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { mergeAnalysisDetails } from "./mergePerformanceData";
import { PFSession } from "./vscode/Diagram";

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

export interface PerformanceData {
    data: PerformanceAnalyzerRealtimeResponse,
    type: ANALYZE_TYPE
}

export enum ANALYZE_TYPE {
    ADVANCED = "advanced",
    REALTIME = "realtime",
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
                                         getPerfDataFromChoreo: (data: any, analyzeType: ANALYZE_TYPE) => Promise<PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse | undefined>): Promise<Map<string, PerformanceData>> {
    if (!st || !file || !lc) {
        return;
    }

    syntaxTree = st;
    langClient = lc;
    filePath = file;
    showPerformanceGraph = showPerf;
    getDataFromChoreo = getPerfDataFromChoreo;

    const performanceBarData = new Map<string, PerformanceData>();

    await langClient.getPerfEndpoints({
        documentIdentifier: {
            uri: filePath
        }
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
                performanceBarData.set(position, { data: realtimeData, type: ANALYZE_TYPE.REALTIME });
                endpoints.set(position, resource);
            }
        }

    });
    return performanceBarData;
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

    const analysisData: SequenceGraphPointValue[] = [];
    for (const value of values) {
        const name = value.name.replace("(", "").replace(")", "");
        const latency = value.latency;
        const tps = value.tps;
        file = name.split("/")[0];

        analysisData.push({ name, latency, tps });
    }

    mergeAnalysisDetails(syntaxTree, graphData[concurrency], analysisData, file, currentResourcePos);
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
            mergeAnalysisDetails(syntaxTree, null, null, null, null, true);
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
