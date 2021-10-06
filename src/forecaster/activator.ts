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

import { CurrentResource, DataLabel } from "./model";
import { commands, ExtensionContext, languages, Range, window } from "vscode";
import { BallerinaExtension, ExtendedLangClient, LANGUAGE, PerformanceAnalyzerGraphResponse } from "../core";
import { ExecutorCodeLensProvider } from "./codelens-provider";
import { log } from "../utils";
import keytar = require("keytar");
import { CHOREO_SERVICE_NAME, CHOREO_ACCESS_TOKEN, CHOREO_COOKIE } from "../project/cmds/choreo-signin";

let langClient: ExtendedLangClient;

export const FORECAST_PERFORMANCE_COMMAND = "ballerina.forecast.performance";
export const SHOW_GRAPH_COMMAND = "ballerina.forecast.performance.showGraph";

export enum ANALYZETYPE {
    ADVANCED = "advanced",
}

/**
 * Endpoint performance analyzer.
 */
export async function activate(ballerinaExtInstance: BallerinaExtension) {
    const context = <ExtensionContext>ballerinaExtInstance.context;
    langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;

    const getEndpoints = commands.registerCommand(FORECAST_PERFORMANCE_COMMAND, async (...args: any[]) => {
        const activeEditor = window.activeTextEditor;
        const uri = activeEditor?.document.uri.fsPath.toString();

        const choreoToken = await keytar.getPassword(CHOREO_SERVICE_NAME, CHOREO_ACCESS_TOKEN);
        const choreoCookie = await keytar.getPassword(CHOREO_SERVICE_NAME, CHOREO_COOKIE);

        if (!choreoToken || !choreoCookie) {
            window.showInformationMessage(
                "Please sign in to Choreo to use this feature"
            );
            return;
        }

        if (uri && langClient && args.length > 0) {
            const pos: Range = args[0];
            // add codelenses to endpoints
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
            }).then(async response => {
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
                addPerformanceLabels(response, pos);
            }).catch(error => {
                log(error);
            });
        }
    });
    context.subscriptions.push(getEndpoints);

    if ((ballerinaExtInstance.isAllCodeLensEnabled() || ballerinaExtInstance.isExecutorCodeLensEnabled())) {
        languages.registerCodeLensProvider([{ language: LANGUAGE.BALLERINA }],
            new ExecutorCodeLensProvider(ballerinaExtInstance));
    }
}

function addPerformanceLabels(graphData: PerformanceAnalyzerGraphResponse, currentResourcePos: Range) {
    if (!graphData || !currentResourcePos) {
        return;
    }
    const sequenceDiagramData = graphData.sequenceDiagramData;
    const realtimeData = graphData.realtimeData;

    if (!sequenceDiagramData || !realtimeData) {
        return;
    }

    const first = sequenceDiagramData[0];
    const values = first.values;

    let dataLabels: DataLabel[] = [];
    for (let i = 0; i < values.length; i++) {
        const name = values[i].name.replace("(", "").replace(")", "").split("/");
        const latency = values[i].latency;
        const file = name[0];
        const pos = name[1].split(",");
        const start = pos[0].split(":");
        const end = pos[1].split(":");
        const range = new Range(parseInt(start[0]), parseInt(start[1]),
            parseInt(end[0]), parseInt(end[1]));
        const dataLabel = new DataLabel(file, range, latency)
        dataLabels.push(dataLabel);

    }

    const currentResource: CurrentResource = new CurrentResource(currentResourcePos,
        realtimeData.latency);

    ExecutorCodeLensProvider.setCurrentResource(currentResource);
    ExecutorCodeLensProvider.setGraphData(graphData);

    ExecutorCodeLensProvider.addDataLabels(dataLabels);
}
