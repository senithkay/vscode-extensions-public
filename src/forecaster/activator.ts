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

import { ANALYZETYPE, DataLabel, GraphData, PerformanceGraphRequest } from "./model";
import { commands, ExtensionContext, languages, Range, TextDocument, Uri, ViewColumn, window } from "vscode";
import { BallerinaExtension, ExtendedLangClient, GraphPoint, LANGUAGE, PerformanceAnalyzerGraphResponse, PerformanceAnalyzerRealtimeResponse, WEBVIEW_TYPE } from "../core";
import { CODELENSE_TYPE, ExecutorCodeLensProvider } from "./codelens-provider";
import { debug } from "../utils";
import { DefaultWebviewPanel } from "./performanceGraphPanel";
import { MESSAGE_TYPE, showMessage } from "../utils/showMessage";
import { PALETTE_COMMANDS } from "../project";
import { URL } from "url";

export const SHOW_GRAPH_COMMAND = "ballerina.forecast.performance.showGraph";
export const CHOREO_API_PF = process.env.VSCODE_CHOREO_GATEWAY_BASE_URI ?
    `${process.env.VSCODE_CHOREO_GATEWAY_BASE_URI}/performance-analyzer/2.0.0/get_estimations/3.0` :
    "https://choreocontrolplane.preview-dv.choreo.dev/performance-analyzer/2.0.0/get_estimations/3.0";

const NETWORK_ERR = "Network error. Please check you internet connection";
const MODEL_NOT_FOUND = "AI service does not have enough data to forecast";
const ESTIMATOR_ERROR = "AI service is currently unavailable (ID2)";
const UNKNOWN_ANALYSIS_TYPE = "Invalid request sent to AI service (ID7)";
const INVALID_DATA = "Request with invalid data sent to AI service (ID8)";
const UNABLE_TO_GET = "Error while connecting to Choreo API, unable to get performance data";
const PERF_DISABLED = "Error while connecting to Choreo API, Performance analyzer will be disabled for this session";
const SUCCESS = "Success";
const maxRetries = 3;
const https = require('https');

let langClient: ExtendedLangClient;
let uiData: GraphData;
let extension: BallerinaExtension;
let advancedData: PerformanceAnalyzerGraphResponse;
let currentResourceName: String;
let currentResourcePos: Range;
let currentFile: TextDocument | undefined;
let currentFileUri: String | undefined;
let retryAttempts = 0;

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
            showMessage("Insufficient data to provide detailed estimations", MESSAGE_TYPE.INFO, false);
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

    commands.registerCommand(PALETTE_COMMANDS.PERFORMANCE_FORECAST_ENABLE, async () => {
        await extension.updatePerformanceForecastSetting(true);
        extension.getChoreoSessionTreeProvider()?.refresh();
    });

    commands.registerCommand(PALETTE_COMMANDS.PERFORMANCE_FORECAST_DISABLE, async () => {
        await extension.updatePerformanceForecastSetting(false);
        extension.getChoreoSessionTreeProvider()?.refresh();
    });
}

export async function createPerformanceGraphAndCodeLenses(uri: string | undefined, pos: Range, type: ANALYZETYPE, name: String) {

    if (!extension.enabledPerformanceForecasting() || retryAttempts >= maxRetries ||
        extension.getPerformanceForecastContext().temporaryDisabled) {
        return;
    }

    if (!uri || !langClient || !pos || !name) {
        return;
    }

    currentFileUri = uri;
    currentResourceName = name;
    currentResourcePos = pos;

    await langClient.getEndpoints({
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
    }).then(async (response) => {
        if (response.type !== SUCCESS) {
            checkErrors(response);
            return;
        }
        const data = await getDataFromChoreo(response, type);

        if (!data) {
            return;
        }

        if (type == ANALYZETYPE.REALTIME) {
            addEndpointPerformanceLabels(data as PerformanceAnalyzerRealtimeResponse);
        } else {
            advancedData = data as PerformanceAnalyzerGraphResponse;
            addPerformanceLabels(1);

            if (!uiData || !currentFile) {
                return;
            }

            DefaultWebviewPanel.create(langClient, uiData, currentFile.uri, `Performance Forecast of ${uiData.name}`,
                ViewColumn.Two, extension, WEBVIEW_TYPE.PERFORMANCE_FORECAST);

        }

    }).catch(error => {
        debug(error);
    });
}

function checkErrors(response: PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse) {
    if (response.message === 'AUTHENTICATION_ERROR') {
        // Choreo Auth Error
        handleRetries();

    } else if (response.message === 'CONNECTION_ERROR') {
        // Internet Connection Error
        showMessage(NETWORK_ERR, MESSAGE_TYPE.ERROR, true);
        handleRetries();

    } else if (response.message === 'MODEL_NOT_FOUND') {
        // AI Error
        showMessage(MODEL_NOT_FOUND, MESSAGE_TYPE.INFO, true);

    } else if (response.message === 'NO_DATA') {
        // This happens when there is no action invocations in the code.
        // No need to show any error/info since there is no invocations.

    } else if (response.message === 'ESTIMATOR_ERROR') {
        // AI Error
        showMessage(ESTIMATOR_ERROR, MESSAGE_TYPE.ERROR, true);

    } else if (response.message === 'UNKNOWN_ANALYSIS_TYPE') {
        // AI Error
        showMessage(UNKNOWN_ANALYSIS_TYPE, MESSAGE_TYPE.ERROR, true);

    } else if (response.message === 'INVALID_DATA') {
        // AI Error
        showMessage(INVALID_DATA, MESSAGE_TYPE.INFO, true);

    } else {
        showMessage(`${UNABLE_TO_GET} ${response.message}`, MESSAGE_TYPE.ERROR, true);
        handleRetries();
    }
}

export function handleRetries() {
    retryAttempts++;
    if (retryAttempts >= maxRetries) {
        showMessage(PERF_DISABLED, MESSAGE_TYPE.ERROR, true);
        extension.getPerformanceForecastContext().temporaryDisabled = true;
    }
}

function addPerformanceLabels(concurrencyValue: number) {
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

    let concurrency;
    switch (concurrencyValue) {
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
    addEndpointPerformanceLabels(graphData[concurrency]);

    let file;
    for (let i = 0; i < values.length; i++) {
        const name = values[i].name.replace("(", "").replace(")", "").split("/");
        const latency = Number(values[i].latency);
        const tps = Number(values[i].tps);
        file = name[0];
        const pos = name[1].split(",");
        const start = pos[0].split(":");
        const end = pos[1].split(":");
        const range = new Range(parseInt(start[0]), parseInt(start[1]),
            parseInt(end[0]), parseInt(end[1]));
        const dataLabel = new DataLabel(CODELENSE_TYPE.ADVANCED, file, range,
            { max: concurrencyValue }, { max: latency }, { max: tps },
            currentResourceName, currentResourcePos, null);
        ExecutorCodeLensProvider.addDataLabel(dataLabel);

    }
    uiData = { name: currentResourceName, graphData: advancedData.graphData };
}

function addEndpointPerformanceLabels(data: PerformanceAnalyzerRealtimeResponse | GraphPoint) {
    if (!data || !currentResourcePos || !currentFileUri) {
        return;
    }

    // add resource latency
    let dataLabel;
    if ((data.concurrency as any).max) {
        // If realtime response
        const realtimeData = data as PerformanceAnalyzerRealtimeResponse;
        dataLabel = new DataLabel(CODELENSE_TYPE.REALTIME, currentFileUri, currentResourcePos,
            { min: realtimeData.concurrency.min, max: realtimeData.concurrency.max },
            { min: realtimeData.latency.min, max: realtimeData.latency.max },
            { min: realtimeData.tps.min, max: realtimeData.tps.max },
            currentResourceName, currentResourcePos, null);
    } else {
        // if graph point
        dataLabel = new DataLabel(CODELENSE_TYPE.ADVANCED, currentFileUri, currentResourcePos,
            { max: Number(data.concurrency) },
            { max: Number(data.latency) },
            { max: Number(data.tps) },
            currentResourceName, currentResourcePos, null);
    }
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
    DefaultWebviewPanel.create(langClient, request.data, Uri.parse(request.file),
        `Performance Forecast of ${request.data.name}`, ViewColumn.Two, extension,
        WEBVIEW_TYPE.PERFORMANCE_FORECAST);
    return true;
}

export function showChoreoSigninMessage(extension: BallerinaExtension) {
    if (!extension.getPerformanceForecastContext().infoMessageStatus.signinChoreo) {
        return;
    }
    const action = 'Sign in to Choreo';
    window.showInformationMessage("Please sign in to Choreo to view performance predictions.",
        action).then((selection) => {
            if (action === selection) {
                commands.executeCommand('sessionExplorer.focus');
            }
        });
    extension.getPerformanceForecastContext().infoMessageStatus.signinChoreo = false;
}

/**
 * Get performance data from choreo API.
 * @param data endpoints data
 * @param analyzeType Analyze type
 * @returns response
 */
export function getDataFromChoreo(data: any, analyzeType: ANALYZETYPE): Promise<PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse | undefined> {

    return new Promise((resolve, reject) => {

        if (!extension.getChoreoSession().loginStatus) {
            showChoreoSigninMessage(extension);
            reject();
        }
    
        const choreoToken = extension.getChoreoSession().choreoAccessToken!;
        data["analyzeType"] = analyzeType;
        delete data.type;
        delete data.message;
        data = JSON.stringify(data)

        const url = new URL(CHOREO_API_PF);

        const options = {
            hostname: url.hostname,
            path: url.pathname,
            port: 443,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Authorization': `Bearer ${choreoToken}`
            }
        }

        const req = https.request(options, res => {

            res.on('data', data => {
                resolve(JSON.parse(data));
            })
        })

        req.on('error', error => {
            debug(error);
            reject();
        })

        req.write(data);
        req.end();

    });
}
