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

import { DataLabel } from "./model";
import { commands, ExtensionContext, languages, Range, TextDocument, Uri, ViewColumn, window } from "vscode";
import { BallerinaExtension, ExtendedLangClient, GraphPoint, LANGUAGE, PerformanceAnalyzerGraphResponse, PerformanceAnalyzerRealtimeResponse } from "../core";
import { ExecutorCodeLensProvider } from "./codelens-provider";
import { log } from "../utils";
import { showPerformanceGraph } from "./performanceGraphPanel";
import { MESSAGE_TYPE, showMessage } from "../utils/showMessage";

export const CHOREO_API_PF = "http://choreocontrolplane.preview-dv.choreo.dev/performance-analyzer/1.0.0/get_estimations/2.0";
const CHOREO_AUTH_ERR = "Choreo Authentication error.";
const NETWORK_ERR = "Network error. Please check you internet connection.";
const MODEL_NOT_FOUND = "AI service does not have enough data to forecast."
const SUCCESS = "Success";
let langClient: ExtendedLangClient;
let uiData: GraphData;
let extension: BallerinaExtension;
let advancedData: PerformanceAnalyzerGraphResponse;
let currentResourceName: String;
let currentResourcePos: Range;
let currentFile: TextDocument | undefined;
let currentFileUri: String | undefined;

export const SHOW_GRAPH_COMMAND = "ballerina.forecast.performance.showGraph";

export enum ANALYZETYPE {
    ADVANCED = "advanced",
    REALTIME = "realtime",
}

export interface GraphData {
    name: String,
    graphData: GraphPoint[];
}

export interface PFSession {
    choreoAPI: String,
    choreoToken: String | undefined,
    choreoCookie?: String | undefined
}

export interface PerformanceGraphRequest {
    file: string;
    data: GraphData;
}

/**
 * Endpoint performance analyzer.
 */
export async function activate(ballerinaExtInstance: BallerinaExtension) {
    const context = <ExtensionContext>ballerinaExtInstance.context;
    langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
    extension = ballerinaExtInstance;

    const getEndpoints = commands.registerCommand(SHOW_GRAPH_COMMAND, async (...args: any[]) => {
        const activeEditor = window.activeTextEditor;
        const document = activeEditor?.document;
        const uri = activeEditor?.document.uri.fsPath.toString();
        currentFile = document;
        currentFileUri = uri;
        ExecutorCodeLensProvider.dataLabels = [];

        if (args.length < 2) {
            return;
        }
        await createPerformanceGraphAndCodeLenses(uri, args[0], ANALYZETYPE.ADVANCED, args[1]);
        ExecutorCodeLensProvider.onDidChangeCodeLenses.fire();

    });
    context.subscriptions.push(getEndpoints);

    if ((ballerinaExtInstance.isAllCodeLensEnabled() || ballerinaExtInstance.isExecutorCodeLensEnabled())) {
        languages.registerCodeLensProvider([{ language: LANGUAGE.BALLERINA }],
            new ExecutorCodeLensProvider(ballerinaExtInstance));
    }
}

export async function createPerformanceGraphAndCodeLenses(uri: string | undefined, pos: Range,
    type: ANALYZETYPE, name: String | undefined) {

    if (!extension.getChoreoSession().loginStatus) {
        showMessage("Please sign in to Choreo to view performance predictions.", MESSAGE_TYPE.INFO, true);
        return;
    }

    const choreoToken = extension.getChoreoSession().choreoToken!;
    const choreoCookie = "";

    if (!uri || !langClient || !pos) {
        return;
    }

    currentFileUri = uri;
    if (type == ANALYZETYPE.REALTIME) {
        // add codelenses to resources
        await langClient.getRealtimePerformanceData({
            documentIdentifier: {
                uri
            },
            range: {
                start: {
                    line: pos.start.line,
                    character: pos.start.character,
                },
                end: {
                    line: pos.end.line,
                    character: pos.end.character
                }
            },
            choreoAPI: CHOREO_API_PF,
            choreoToken: `Bearer ${choreoToken}`,
            choreoCookie: choreoCookie,
        }).then(async (response) => {
            if (response.type !== SUCCESS) {
                checkErrors(response);
                return;
            }
            if (!name) {
                return;
            }
            currentResourceName = name;
            currentResourcePos = pos;
            addRealTimePerformanceLabels(response);
        }).catch(error => {
            log(error);
        });
    } else {
        // add code lenses to invocations
        await langClient.getPerformanceGraphData({
            documentIdentifier: {
                uri
            },
            range: {
                start: {
                    line: pos.start.line,
                    character: pos.start.character,
                },
                end: {
                    line: pos.end.line,
                    character: pos.end.character
                }
            },
            choreoAPI: CHOREO_API_PF,
            choreoToken: `Bearer ${choreoToken}`,
            choreoCookie: choreoCookie,
        }).then(async (response) => {
            if (response.type !== SUCCESS) {
                checkErrors(response);
                return;
            }

            if (!name) {
                return;
            }

            advancedData = response;
            currentResourceName = name;
            currentResourcePos = pos;
            addPerformanceLabels(1);

            if (!uiData || !currentFile) {
                return;
            }

            showPerformanceGraph(langClient, uiData, currentFile.uri);

        }).catch(error => {
            log(error);
        });
    }

    function checkErrors(response: PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse) {
        if (response.message === 'AUTHENTICATION_ERROR') {
            // Choreo Auth Error
            showMessage(CHOREO_AUTH_ERR, MESSAGE_TYPE.ERROR, true);

        } else if (response.message === 'CONNECTION_ERROR') {
            // Internet Connection Error
            showMessage(NETWORK_ERR, MESSAGE_TYPE.ERROR, true);

        } else if (response.message === 'MODEL_NOT_FOUND') {
            // AI Error
            showMessage(MODEL_NOT_FOUND, MESSAGE_TYPE.INFO, true);

        } else {
            showMessage(response.message, MESSAGE_TYPE.ERROR, true);

        }
    }
}

function addPerformanceLabels(concurrency: number) {
    if (!advancedData || !currentResourcePos || !currentResourceName) {
        return;
    }
    const sequenceDiagramData = advancedData.sequenceDiagramData;
    const graphData = advancedData.graphData;

    if (!sequenceDiagramData) {
        return;
    }

    if (sequenceDiagramData.length == 0) {
        return;
    }

    switch (concurrency) {
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
    }
    let data = sequenceDiagramData[concurrency];
    const values = data.values;
    addRealTimePerformanceLabels(graphData[concurrency]);

    let file;
    for (let i = 0; i < values.length; i++) {
        const name = values[i].name.replace("(", "").replace(")", "").split("/");
        const latency = values[i].latency;
        file = name[0];
        const pos = name[1].split(",");
        const start = pos[0].split(":");
        const end = pos[1].split(":");
        const range = new Range(parseInt(start[0]), parseInt(start[1]),
            parseInt(end[0]), parseInt(end[1]));
        const dataLabel = new DataLabel(file, range, latency, currentResourceName, currentResourcePos, null);
        ExecutorCodeLensProvider.addDataLabel(dataLabel);

    }
    uiData = { name: currentResourceName, graphData: advancedData.graphData };
}

function addRealTimePerformanceLabels(data: GraphPoint) {
    if (!data || !currentResourcePos || !currentFileUri) {
        return;
    }

    // add resource latency
    const dataLabel = new DataLabel(currentFileUri, currentResourcePos, data.latency,
        currentResourceName, currentResourcePos, null);
    ExecutorCodeLensProvider.addDataLabel(dataLabel);

}

export function updateCodeLenses(concurrency: number) {
    ExecutorCodeLensProvider.dataLabels = [];
    addPerformanceLabels(concurrency);
    ExecutorCodeLensProvider.onDidChangeCodeLenses.fire();

    if (!currentFile) {
        return;
    }
    window.showTextDocument(currentFile, ViewColumn.One);
}

export function openPerformanceDiagram(request: PerformanceGraphRequest) {
    showPerformanceGraph(langClient, request.data, Uri.parse(request.file));
    return true;
}
