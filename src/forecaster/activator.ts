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
import { commands, ExtensionContext, languages, Range, TextDocument, ViewColumn, window } from "vscode";
import { BallerinaExtension, ExtendedLangClient, GraphPoint, LANGUAGE, PerformanceAnalyzerGraphResponse, PerformanceAnalyzerRealtimeResponse } from "../core";
import { ExecutorCodeLensProvider } from "./codelens-provider";
import { log } from "../utils";
import { showPerformanceGraph } from "./performanceGraphPanel";

const CHOREO_AUTH_ERR = "Choreo Authentication error.";
const NETWORK_ERR = "Network error. Please check you internet connection.";
let langClient: ExtendedLangClient;
let uiData: GraphData;
let extension: BallerinaExtension;
let currentGraphData: PerformanceAnalyzerGraphResponse;
let currentResourceName: String;
let currentResourcePos: Range;
let currentRealtimeData: PerformanceAnalyzerRealtimeResponse
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

        if (args.length < 3) {
            return;
        }
        await createPerformanceGraphAndCodeLenses(uri, args[0], ANALYZETYPE.ADVANCED, args[1], args[2]);
        ExecutorCodeLensProvider.onDidChangeCodeLenses.fire();

    });
    context.subscriptions.push(getEndpoints);

    if ((ballerinaExtInstance.isAllCodeLensEnabled() || ballerinaExtInstance.isExecutorCodeLensEnabled())) {
        languages.registerCodeLensProvider([{ language: LANGUAGE.BALLERINA }],
            new ExecutorCodeLensProvider(ballerinaExtInstance));
    }
}

export async function createPerformanceGraphAndCodeLenses(uri: string | undefined, pos: Range,
    type: ANALYZETYPE, name: String | undefined, realtimeData: PerformanceAnalyzerRealtimeResponse | undefined) {

    if (!extension.getChoreoSession().loginStatus) {
        window.showInformationMessage(
            "Please sign in to Choreo to view performance predictions."
        );
        return;
    }

    const choreoToken = extension.getChoreoSession().choreoToken!;
    const choreoCookie = extension.getChoreoSession().choreoCookie!;

    if (!uri || !langClient || !pos) {
        return;
    }

    currentFileUri = uri;
    if (type == ANALYZETYPE.REALTIME) {
        // add codelenses to resources
        await langClient.getRealtimePerformaceData({
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
            choreoToken: `Bearer ${choreoToken}`,
            choreoCookie: choreoCookie,
        }).then(async (response) => {
            if (response.type === 'error') {
                checkErrors(response);
                return;
            }
            if (!name) {
                return;
            }
            currentResourceName = name;
            currentResourcePos = pos;
            currentRealtimeData = response;
            addRealTimePerformanceLabels();
        }).catch(error => {
            log(error);
        });
    } else {
        // add code lenses to invocations
        await langClient.getPerformaceGraphData({
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
            choreoToken: `Bearer ${choreoToken}`,
            choreoCookie: choreoCookie,
        }).then(async (response) => {
            if (response.type === 'error') {
                checkErrors(response);
                return;
            }

            if (!realtimeData || !name) {
                return;
            }

            currentGraphData = response;
            currentResourceName = name;
            currentResourcePos = pos;
            currentRealtimeData = realtimeData;
            addRealTimePerformanceLabels();
            addPerformanceLabels(1);

            if (!uiData) {
                return;
            }
            showPerformanceGraph(langClient, uiData);

        }).catch(error => {
            log(error);
        });
    }

    function checkErrors(response: PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse) {
        if (response.message === 'AUTHENTICATION_ERROR') {
            // Choreo Auth Error
            window.showInformationMessage(
                CHOREO_AUTH_ERR
            );
        } else if (response.message === 'CONNECTION_ERROR') {
            // Internet Connection Error
            window.showInformationMessage(
                NETWORK_ERR
            );
        }
    }
}

function addPerformanceLabels(concurrency: number) {
    if (!currentGraphData || !currentResourcePos || !currentRealtimeData || !currentResourceName) {
        return;
    }
    const sequenceDiagramData = currentGraphData.sequenceDiagramData;

    if (!sequenceDiagramData) {
        return;
    }

    if (sequenceDiagramData.length == 0) {
        return;
    } let data;
    switch (concurrency) {
        case 1: {
            data = sequenceDiagramData[0];
            break;
        }
        case 25: {
            data = sequenceDiagramData[1];
            break;
        }
        case 50: {
            data = sequenceDiagramData[2];
            break;
        }
        case 75: {
            data = sequenceDiagramData[3];
            break;
        }
        case 100: {
            data = sequenceDiagramData[4];
            break;
        }
    }
    const values = data.values;

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
        const dataLabel = new DataLabel(file, range, latency, currentResourceName, currentResourcePos, currentRealtimeData);
        ExecutorCodeLensProvider.addDataLabel(dataLabel);

    }
    uiData = { name: currentResourceName, graphData: currentGraphData.graphData };
}

function addRealTimePerformanceLabels() {
    if (!currentRealtimeData || !currentResourcePos || !currentFileUri) {
        return;
    }

    // add resource latency
    const dataLabel = new DataLabel(currentFileUri, currentResourcePos, currentRealtimeData.latency,
        currentResourceName, currentResourcePos, currentRealtimeData);
    ExecutorCodeLensProvider.addDataLabel(dataLabel);

}

export function updateCodeLenses(concurrency: number) {
    ExecutorCodeLensProvider.dataLabels = [];
    addRealTimePerformanceLabels();
    addPerformanceLabels(concurrency);
    ExecutorCodeLensProvider.onDidChangeCodeLenses.fire();

    if (!currentFile) {
        return;
    }
    window.showTextDocument(currentFile, ViewColumn.One);
}
