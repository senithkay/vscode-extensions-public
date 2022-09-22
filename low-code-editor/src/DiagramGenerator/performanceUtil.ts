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
    ANALYZE_TYPE, DiagramEditorLangClientInterface,
    PerformanceAnalyzerResponse, Range, TopBarData
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { ConnectorLatency, mergeAnalysisDetails } from "./mergePerformanceData";

const SUCCESS = "Success";
const NO_DATA = "NO_DATA";
let syntaxTree: any;
let langClient: DiagramEditorLangClientInterface;
let filePath: string;
let diagramRedraw: any;
let advancedData: PerformanceAnalyzerAdvancedResponse;
let currentResourcePos: NodePosition;
let showPerformanceGraph: (request: PerformanceGraphRequest) => Promise<boolean>;
let getDataFromChoreo: (data: any, analyzeType: ANALYZE_TYPE) => Promise<PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerAdvancedResponse | undefined>;
const endpoints = new Map<string, PerformanceAnalyzerResponse>();

export interface PerformanceGraphRequest {
    file: string;
    name: string;
    data: PerformanceAnalyzerAdvancedResponse;
}

export interface PerformanceAnalyzerRealtimeResponse extends SequenceDiagramData {
    message?: string;
    type?: any;
    positions: Record<string, ConnectorPosition>;
}

export interface PerformanceAnalyzerAdvancedResponse {
    criticalPath: number;
    pathmaps: Record<string, string[]>;
    paths: Record<string, PathData>;
    positions: Record<string, ConnectorPosition>;
}

interface PathData {
    graphData: GraphPoint[];
    sequenceDiagramData: SequenceDiagramData;
}

interface GraphPoint {
    concurrency: number;
    latency: number;
    tps: number;
}

interface ConnectorPosition {
    name: string;
    pkgID: string;
    pos: string;
}

export interface Values {
    min?: number;
    max: number;
}

interface SequenceDiagramData {
    concurrency: Values;
    latency: Values;
    tps: Values;
    connectorLatencies: Record<string, Values>;
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
        Promise<PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerAdvancedResponse
            | undefined>): Promise<void> {
    if (!st || !file || !lc) {
        return;
    }

    syntaxTree = st;
    langClient = lc;
    filePath = file;
    showPerformanceGraph = showPerf;
    getDataFromChoreo = getPerfDataFromChoreo;

    await addRealtimeData();
}

async function addRealtimeData() {
    if (!langClient || !filePath || !getDataFromChoreo || !updateDiagram) {
        return;
    }

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
                if (!realtimeData) continue;
                if (realtimeData.message === NO_DATA) continue;

                const pos = resource.resourcePos;
                const position = `${pos.start.line},${pos.start.character},${pos.end.line},${pos.end.character}`;
                endpoints.set(position, resource);
                currentResourcePos = { startLine: pos.start.line, startColumn: pos.start.character, endLine: pos.end.line, endColumn: pos.end.character };

                // add connector latencies
                updateDiagram(realtimeData, ANALYZE_TYPE.REALTIME);

            }
        }
    });
}

function updateDiagram(realtimeData: PerformanceAnalyzerRealtimeResponse, analyzeType: ANALYZE_TYPE) {
    const analysisData: ConnectorLatency[] = [];
    const concurrency = realtimeData.concurrency;
    const latency = realtimeData.latency;
    const tps = realtimeData.tps;

    const topBarData: TopBarData = {
        concurrency: concurrency.min === concurrency.max ? `${concurrency.max}` : `${concurrency.min} - ${concurrency.max}`,
        latency: getPerfValuesWithUnit(latency),
        tps: tps.min === tps.max ? `${tps.max}` : `${tps.min} - ${tps.max}`,
        analyzeType
    };

    Object.keys(realtimeData.connectorLatencies).forEach((key) => {
        const name = (realtimeData.positions[key]).pos.split("/").pop();
        const latencies = realtimeData.connectorLatencies[key];
        analysisData.push({ name, latency: getPerfValuesWithUnit(latencies) });

    });

    mergeAnalysisDetails(syntaxTree, topBarData, analysisData, currentResourcePos);
}

export async function addAdvancedLabels(name: string, range: NodePosition, diagramRedrawFunc: any) {
    if (!filePath || !langClient || !diagramRedrawFunc) {
        return;
    }

    diagramRedraw = diagramRedrawFunc;

    const position = `${range.startLine},${range.startColumn},${range.endLine},${range.endColumn}`;

    const data = await getDataFromChoreo(endpoints.get(position), ANALYZE_TYPE.ADVANCED);

    if (!data) {
        return;
    }
    currentResourcePos = { startLine: range.startLine, startColumn: range.startColumn, endLine: range.endLine, endColumn: range.endColumn };
    advancedData = data as PerformanceAnalyzerAdvancedResponse;
    showPerformanceChart({ file: filePath, name, data: advancedData });
    updatePerfPath(advancedData.criticalPath.toString());
}

async function showPerformanceChart(data: PerformanceGraphRequest) {
    await showPerformanceGraph({
        file: filePath,
        name: data.name,
        data: data.data
    });
}

export async function updatePerfPath(pathId: string) {
    if (pathId === '-1') {
        await addRealtimeData();
    } else {
        updateDiagram({ ...advancedData.paths[pathId].sequenceDiagramData, positions: advancedData.positions }, ANALYZE_TYPE.ADVANCED);
    }

    diagramRedraw(syntaxTree);
    return true;
}

function getPerfValuesWithUnit(latencies: Values): string {
    const min = `${getResponseTime(latencies.min)} ${getResponseUnit(latencies.min)}`;
    const max = `${getResponseTime(latencies.max)} ${getResponseUnit(latencies.max)}`;
    return min === max ? max : `${min} - ${max}`;
}

function getResponseTime(responseTime: number) {
    return responseTime > 1000 ? (responseTime / 1000).toFixed(2) : responseTime
}

function getResponseUnit(responseTime: number) {
    return responseTime > 1000 ? " s" : " ms";
}
