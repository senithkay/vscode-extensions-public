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
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { Range } from "monaco-editor";

import { MESSAGE_TYPE } from "../types";

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
let handlePerfErrors: (response: PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse) => Promise<boolean>;
let showMessage: (message: string, type: MESSAGE_TYPE, isIgnorable: boolean) => Promise<boolean>;

export interface PerformanceGraphRequest {
    file: string;
    data: GraphData;
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
 * @param handleErrors Show performance graph errors
 * @param showMsg Show alerts in vscode side
 */
export async function addPerformanceData(st: any, file: string, lc: DiagramEditorLangClientInterface, session: PFSession, showPerf: (request: PerformanceGraphRequest) => Promise<boolean>, handleErrors: (response: PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse) => Promise<boolean>, showMsg: (message: string, type: MESSAGE_TYPE, isIgnorable: boolean) => Promise<boolean>) {
    if (!st || !file || !lc || !session) {
        return;
    }

    syntaxTree = st;
    langClient = lc;
    filePath = file;
    pfSession = session;
    showPerformanceGraph = showPerf;
    showMessage = showMsg;
    handlePerfErrors = handleErrors;

    const members: any[] = syntaxTree.members;
    for (let currentService = 0; currentService < members.length; currentService++) {
        if (members[currentService].kind === 'ServiceDeclaration') {
            const serviceMembers: any[] = members[currentService].members;
            for (let currentResource = 0; currentResource < members[currentService].members.length; currentResource++) {
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
                        syntaxTree.members[currentService].members[currentResource].performance = realtimeData;
                        syntaxTree.members[currentService].members[currentResource].performance.analyzeType = ANALYZE_TYPE.REALTIME;
                    }
                }
            }
        }
    }

}

async function getRealtimeData(range: Range): Promise<PerformanceAnalyzerRealtimeResponse | undefined> {
    if (!filePath || !langClient || !pfSession || !pfSession.choreoToken) {
        return;
    }

    return new Promise<PerformanceAnalyzerRealtimeResponse>(async (resolve, reject) => {
        await langClient.getRealtimePerformanceData({
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
            },
            choreoAPI: pfSession.choreoAPI,
            choreoToken: `Bearer ${pfSession.choreoToken}`,
            choreoCookie: pfSession.choreoCookie,
        }).then(async (response: PerformanceAnalyzerRealtimeResponse) => {
            if (!response) {
                return resolve(null);
            }
            if (response.type && response.type === IGNORE) {
                return;
            }
            if (response.type && response.type !== SUCCESS) {
                handlePerfErrors(response);
                return resolve(null);
            }
            return resolve(response);
        });
    });
}

export async function addAdvancedLabels(name: string, range: NodePosition, diagramRedrawFunc: any) {
    if (!filePath || !langClient || !pfSession || !diagramRedrawFunc) {
        return;
    }
    currentResourcePos = range;

    diagramRedraw = diagramRedrawFunc;
    await langClient.getPerformanceGraphData({
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
        },
        choreoAPI: pfSession.choreoAPI,
        choreoToken: `Bearer ${pfSession.choreoToken}`,
        choreoCookie: pfSession.choreoCookie,
    }).then(async (response: PerformanceAnalyzerGraphResponse) => {

        if (response.type !== SUCCESS) {
            handlePerfErrors(response);
            return;
        }

        sequenceDiagramData = response.sequenceDiagramData;
        graphData = response.graphData;
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
            await addPerformanceData(syntaxTree, filePath, langClient, pfSession, showPerformanceGraph, handlePerfErrors, showMessage);
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
