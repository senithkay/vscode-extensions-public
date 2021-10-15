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
import { commands, ViewColumn, ExtensionContext, languages, Range, window, WebviewPanel } from "vscode";
import { BallerinaExtension, ExtendedLangClient, GraphPoint, LANGUAGE, PerformanceAnalyzerGraphResponse, PerformanceAnalyzerRealtimeResponse } from "../core";
import { ExecutorCodeLensProvider } from "./codelens-provider";
import { log } from "../utils";
import { WebViewRPCHandler, WebViewMethod, getCommonWebViewOptions } from '../utils';
import { render } from './render';


let langClient: ExtendedLangClient;
let graphDatas: GraphData;
let extension: BallerinaExtension;


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
        const uri = activeEditor?.document.uri.fsPath.toString();
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

export async function createPerformanceGraphAndCodeLenses(uri: string | undefined, pos: Range
    , type: ANALYZETYPE, name: String | undefined, graphData: PerformanceAnalyzerRealtimeResponse | undefined) {

    const choreoToken = extension.getChoreoSession().choreoToken;
    const choreoCookie = extension.getChoreoSession().choreoCookie;

    if (!choreoToken || !choreoCookie) {
        window.showInformationMessage(
            "Please sign in to Choreo to use this feature"
        );
        return;
    }

    if (uri && langClient && pos) {
        if (type == ANALYZETYPE.REALTIME) {
            // add codelenses to resources
            await langClient.getRealtimePerformaceData({
                documentIdentifier: {
                    uri: uri
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
                    if (response.message === 'AUTHENTICATION_ERROR') {
                        // Choreo Auth Error
                        window.showInformationMessage(
                            "Choreo Authentication error."
                        );
                        return;
                    } else if (response.message === 'CONNECTION_ERROR') {
                        // Internet Connection Error
                        return;
                    }
                    return;
                }
                if (!name) {
                    return;
                }
                addRealTimePerformanceLabels(response, uri, name, pos);
            }).catch(error => {
                log(error);
            });
        } else {
            // add code lenses to invocations
            await langClient.getPerformaceGraphData({
                documentIdentifier: {
                    uri: uri
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
                    if (response.message === 'AUTHENTICATION_ERROR') {
                        // Choreo Auth Error
                        window.showInformationMessage(
                            "Choreo Authentication error."
                        );
                        return;
                    } else if (response.message === 'CONNECTION_ERROR') {
                        // Internet Connection Error
                        return;
                    }
                    return;
                }

                if (!graphData || !name) {
                    return;
                }

                addRealTimePerformanceLabels(graphData, uri, name, pos);
                addPerformanceLabels(response, name, pos, graphData);

                if (!graphDatas) {
                    return;
                }
                showPerformanceGraph(graphDatas);

            }).catch(error => {
                log(error);
            });
        }
    }
}

function addPerformanceLabels(graphData: PerformanceAnalyzerGraphResponse, currentResourceName: String, currentResourcePos: Range,
    realtimeData: PerformanceAnalyzerRealtimeResponse) {
    if (!graphData || !currentResourcePos) {
        return;
    }
    const sequenceDiagramData = graphData.sequenceDiagramData;

    if (!sequenceDiagramData) {
        return;
    }

    if (sequenceDiagramData.length == 0) {
        return;
    }

    const first = sequenceDiagramData[0];
    const values = first.values;

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
        const dataLabel = new DataLabel(file, range, latency, currentResourceName, currentResourcePos, realtimeData);
        ExecutorCodeLensProvider.addDataLabel(dataLabel);

    }
    graphDatas = { name: currentResourceName, graphData: graphData.graphData };
}

function addRealTimePerformanceLabels(graphData: PerformanceAnalyzerRealtimeResponse,
    file: String, currentResourceName: String, currentResourcePos: Range) {
    if (!graphData || !currentResourcePos || !file) {
        return;
    }

    // add resource latency
    const dataLabel = new DataLabel(file, currentResourcePos, graphData.latency, currentResourceName, currentResourcePos, graphData);
    ExecutorCodeLensProvider.addDataLabel(dataLabel);

}

let performanceGraphPanel: WebviewPanel | undefined;


function showPerformanceGraph(data: GraphData): void {

    // Create and show a new webview
    performanceGraphPanel = window.createWebviewPanel(
        'ballerinaExamples',
        `Performance Forecast of ${data.name}`,
        { viewColumn: ViewColumn.Beside, preserveFocus: true },
        getCommonWebViewOptions()
    );
    const remoteMethods: WebViewMethod[] = [
        {
            methodName: "openExample",
            handler: (args: any[]): Thenable<any> => {
                return Promise.resolve();
            }
        }
    ];
    WebViewRPCHandler.create(performanceGraphPanel, langClient, remoteMethods);
    const html = render({ name: data.name, data: data.graphData });
    if (performanceGraphPanel && html) {
        performanceGraphPanel.webview.html = html;
    }
    performanceGraphPanel.onDidDispose(() => {
        performanceGraphPanel = undefined;
    });
}
