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
    PerformanceAnalyzerRealtimeResponse, SequenceGraphPoint, SequenceGraphPointValue
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, NodePosition as string } from "@wso2-enterprise/syntax-tree";
import { Range } from "monaco-editor";

import { mergeAnalysisDetails } from "./mergePerformanceData";
import { PFSession } from "./vscode/Diagram";

const SUCCESS = "Success";
const IGNORE = "IGNORE";
let syntaxTree: any;
let langClient: DiagramEditorLangClientInterface;
let filePath: string;
let pfSession: PFSession;
let graphData: GraphPoint[];
let sequenceDiagramData: SequenceGraphPoint[];
let diagramRedraw: any;
let currentResourcePos: NodePosition;
let showPerformanceGraph: (request: PerformanceGraphRequest) => Promise<boolean>;
let getDataFromChoreo: (data: any, analyzeType: ANALYZE_TYPE) => Promise<PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse | undefined>;

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
 * @param session choreo session
 * @param showPerf Show performance graph function
 * @param getPerfDataFromChoreo Show performance graph errors
 * @param showMsg Show alerts in vscode side
 */
export async function addPerformanceData(st: any, file: string, lc: DiagramEditorLangClientInterface,
                                         session: PFSession, showPerf: (request: PerformanceGraphRequest) => Promise<boolean>,
                                         getPerfDataFromChoreo: (data: any, analyzeType: ANALYZE_TYPE) => Promise<PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse | undefined>): Promise<Map<string, PerformanceData>> {
    if (!st || !file || !lc || !session) {
        return;
    }

    syntaxTree = st;
    langClient = lc;
    filePath = file;
    pfSession = session;
    showPerformanceGraph = showPerf;
    getDataFromChoreo = getPerfDataFromChoreo;

    const members: any[] = syntaxTree.members;
    const performanceBarData = new Map<string, PerformanceData>();
    for (const member of members) {
        if (member.kind === 'ServiceDeclaration') {
            const serviceMembers: any[] = member.members;
            for (let currentResource = 0; currentResource < member.members.length; currentResource++) {
                const serviceMember: any = serviceMembers[currentResource];
                if (serviceMember.kind === 'ResourceAccessorDefinition') {
                    const pos = serviceMember.position;

                    const range: Range = new Range(pos.startLine, pos.startColumn,
                        pos.endLine, pos.endColumn);

                    if (!serviceMember.functionName || !serviceMember.relativeResourcePath) {
                        continue;
                    }

                    const realtimeData = await getRealtimeData(range);

                    if (realtimeData) {
                        const position = `${pos.startLine},${pos.startColumn},${pos.endLine},${pos.endColumn}`;
                        performanceBarData.set(position, { data: realtimeData, type: ANALYZE_TYPE.REALTIME });
                    }
                }
            }
        }
    }
    return performanceBarData;
}

async function getRealtimeData(range: Range): Promise<PerformanceAnalyzerRealtimeResponse | undefined> {
    if (!filePath || !langClient || !pfSession || !pfSession.choreoToken) {
        return;
    }

    return new Promise<PerformanceAnalyzerRealtimeResponse>(async (resolve, reject) => {
        await langClient.getPerfEndpoints({
            documentIdentifier: {
                uri: filePath
            },
            range: {
                start: {
                    line: range.startLineNumber,
                    character: range.startColumn,
                },
                end: {
                    line: range.endLineNumber,
                    character: range.endColumn
                }
            }
        }).then(async (response) => {
            if (!response) {
                return resolve(null);
            }

            if (response.type && response.type !== SUCCESS) {
                return resolve(null);
            }

            const data = await getDataFromChoreo(response, ANALYZE_TYPE.REALTIME);

            if (!data) {
                return resolve(null);
            }

            return resolve(data as PerformanceAnalyzerRealtimeResponse);
        });
    });
}

export async function addAdvancedLabels(name: string, range: NodePosition, diagramRedrawFunc: any) {
    if (!filePath || !langClient || !pfSession || !diagramRedrawFunc) {
        return;
    }
    currentResourcePos = range;

    diagramRedraw = diagramRedrawFunc;
    await langClient.getPerfEndpoints({
        documentIdentifier: {
            uri: filePath
        },
        range: {
            start: {
                line: range.startLine,
                character: range.startColumn,
            },
            end: {
                line: range.endLine,
                character: range.endColumn
            }
        }
    }).then(async (response: PerformanceAnalyzerGraphResponse) => {

        if (response.type && response.type !== SUCCESS) {
            return;
        }

        let data = await getDataFromChoreo(response, ANALYZE_TYPE.ADVANCED);

        if (!data) {
            return;
        }
        data = data as PerformanceAnalyzerGraphResponse;

        sequenceDiagramData = data.sequenceDiagramData;
        graphData = data.graphData;
        updateAdvancedLabels(0);
        showPerformanceChart({ name, graphData })
    });
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
            await addPerformanceData(syntaxTree, filePath, langClient, pfSession, showPerformanceGraph, getDataFromChoreo);
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
