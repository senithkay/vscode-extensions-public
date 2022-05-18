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
import { commands, ExtensionContext, languages, Range as VRange, TextDocument, Uri, ViewColumn, window } from "vscode";
import {
    BallerinaExtension, ExtendedLangClient, GraphPoint, LANGUAGE, PerformanceAnalyzerGraphResponse,
    PerformanceAnalyzerRealtimeResponse, PerformanceAnalyzerResponse, Range, WEBVIEW_TYPE
} from "../core";
import { CODELENSE_TYPE, ExecutorCodeLensProvider } from "./codelens-provider";
import { debug } from "../utils";
import { DefaultWebviewPanel } from "./performanceGraphPanel";
import { MESSAGE_TYPE, showMessage } from "../utils/showMessage";
import { PALETTE_COMMANDS } from "../project";
import { URL } from "url";
import { CMP_PERF_ANALYZER, sendTelemetryEvent, sendTelemetryException, TM_EVENT_OPEN_PERF_GRAPH, TM_EVENT_PERF_LS_REQUEST, TM_EVENT_PERF_REQUEST } from "../telemetry";

export const SHOW_GRAPH_COMMAND = "ballerina.forecast.performance.showGraph";
export const CHOREO_API_PF = process.env.VSCODE_CHOREO_GATEWAY_BASE_URI ?
    `${process.env.VSCODE_CHOREO_GATEWAY_BASE_URI}/performance-analyzer/2.0.0/get_estimations/3.0` :
    "https://choreocontrolplane.choreo.dev/93tu/performance-analyzer/2.0.0/get_estimations/3.0";

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
let currentResourceData: PerformanceAnalyzerResponse;
let retryAttempts = 0;
const cachedResponses = new Map<any, PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse>();

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
        const currentDataLabels: DataLabel[] = Array.from(ExecutorCodeLensProvider.dataLabels);
        currentFile = document;
        currentFileUri = uri;
        ExecutorCodeLensProvider.dataLabels = [];

        if (args.length < 3) {
            showMessage("Insufficient data to provide detailed estimations", MESSAGE_TYPE.INFO, false);
            return;
        }
        await addPerfData(uri!, args[0], ANALYZETYPE.ADVANCED, args[1], args[2]);

        // if no advanced code lenses
        if (ExecutorCodeLensProvider.dataLabels.length === 0) {
            ExecutorCodeLensProvider.dataLabels = currentDataLabels;
        }
        ExecutorCodeLensProvider.onDidChangeCodeLenses.fire();

    });
    context.subscriptions.push(getEndpoints);

    if (ballerinaExtInstance.isAllCodeLensEnabled()) {
        languages.registerCodeLensProvider([{ language: LANGUAGE.BALLERINA, scheme: 'file' }],
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

export async function createPerformanceGraphAndCodeLenses(uri: string | undefined, type: ANALYZETYPE) {

    if (!extension.enabledPerformanceForecasting() || retryAttempts >= maxRetries ||
        extension.getPerformanceForecastContext().temporaryDisabled) {
        return;
    }

    if (!uri || !langClient) {
        return;
    }

    await langClient.getResourcesWithEndpoints({
        documentIdentifier: {
            uri
        }
    }).then(async (epResponse) => {
        const response = epResponse as PerformanceAnalyzerResponse[];
        for (var resource of response) {
            if (resource.type === SUCCESS) {
                currentResourceData = resource;

                sendTelemetryEvent(extension, TM_EVENT_PERF_LS_REQUEST, CMP_PERF_ANALYZER, { 'is_successful': "true" });
                await addPerfData(uri, resource.resourcePos, type, resource.name, resource);
            } else {
                sendTelemetryEvent(extension, TM_EVENT_PERF_LS_REQUEST, CMP_PERF_ANALYZER,
                    { 'is_successful': "false", 'error_code': `${resource.message}` });
                checkErrors(resource);
            }
        }

    }).catch(error => {
        sendTelemetryException(extension, error, CMP_PERF_ANALYZER);
        debug(`${error} ${new Date()}`);
    });
}

async function addPerfData(uri: string, pos: Range, type: ANALYZETYPE, name: String, endpoints: PerformanceAnalyzerResponse) {
    const data = await getDataFromChoreo(endpoints, type);

    currentFileUri = uri;
    currentResourceName = name;
    currentResourcePos = pos;

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

        sendTelemetryEvent(extension, TM_EVENT_OPEN_PERF_GRAPH, CMP_PERF_ANALYZER, { 'initiator': "codelense" });
        DefaultWebviewPanel.create(langClient, uiData, currentFile.uri, `Performance Forecast of ${uiData.name}`,
            ViewColumn.Three, extension, WEBVIEW_TYPE.PERFORMANCE_FORECAST);

    }
}

function checkErrors(response: PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse
    | PerformanceAnalyzerResponse) {
    debug(`${response.message} ${new Date()}`);
    if (response.message === 'AUTHENTICATION_ERROR' || response.message === 'CONNECTION_ERROR') {
        // Choreo Auth Error
        debug("Retry counted.");
        handleRetries();

    } else if (response.message === 'MODEL_RANGE_EXCEEDED') {
        // AI Error
        showMessage("Performance plots are not available due to insufficient data", MESSAGE_TYPE.INFO, false);

    } else if (response.message !== 'NO_DATA' && response.message !== 'ESTIMATOR_ERROR' && response.message !== 'INVALID_DATA' &&
        response.message !== 'MODEL_NOT_FOUND' && response.message !== 'ENDPOINT_RESOLVE_ERROR') {
        debug(`Retry counted. ${new Date()}`);
        handleRetries();
    }
}

export function handleRetries() {
    retryAttempts++;
    if (retryAttempts >= maxRetries) {
        debug(`Perf analyzer disabled. Max retry count reached. ${new Date()}`)
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
        const range = new VRange(parseInt(start[0]), parseInt(start[1]),
            parseInt(end[0]), parseInt(end[1]));
        const dataLabel = new DataLabel(CODELENSE_TYPE.ADVANCED, file, range,
            { max: concurrencyValue }, { max: latency }, { max: tps },
            currentResourceName, currentResourcePos, null);
        ExecutorCodeLensProvider.addDataLabel(dataLabel);

    }
    uiData = { name: currentResourceName, graphData: advancedData.graphData };
}

function addEndpointPerformanceLabels(data: PerformanceAnalyzerRealtimeResponse | GraphPoint) {
    if (!data || !currentResourcePos || !currentFileUri || !currentResourceData) {
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
            currentResourceName, currentResourcePos, currentResourceData);
    } else {
        // if graph point
        dataLabel = new DataLabel(CODELENSE_TYPE.ADVANCED, currentFileUri, currentResourcePos,
            { max: Number(data.concurrency) },
            { max: Number(data.latency) },
            { max: Number(data.tps) },
            currentResourceName, currentResourcePos, currentResourceData);
    }
    ExecutorCodeLensProvider.addDataLabel(dataLabel);

}

export function updateCodeLenses(concurrency: number, column: ViewColumn | undefined) {
    ExecutorCodeLensProvider.dataLabels = [];
    addPerformanceLabels(concurrency);
    ExecutorCodeLensProvider.onDidChangeCodeLenses.fire();

    if (!currentFile) {
        return;
    }
    window.showTextDocument(currentFile, column ?? ViewColumn.Beside);
}

export function openPerformanceDiagram(request: PerformanceGraphRequest) {
    sendTelemetryEvent(extension, TM_EVENT_OPEN_PERF_GRAPH, CMP_PERF_ANALYZER, { 'initiator': "button" });
    DefaultWebviewPanel.create(langClient, request.data, Uri.parse(request.file),
        `Performance Forecast of ${request.data.name}`, ViewColumn.Three, extension,
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

        if (!extension.getChoreoSession().loginStatus || retryAttempts >= maxRetries) {
            showChoreoSigninMessage(extension);
            return reject();
        }

        data["analyzeType"] = analyzeType;
        delete data.type;
        delete data.message;
        delete data.resourcePos;
        delete data.name;
        data = JSON.stringify(data)

        if (cachedResponses.has(data)) {
            return resolve(cachedResponses.get(data));
        }

        const url = new URL(CHOREO_API_PF);
        const choreoToken = extension.getChoreoSession().choreoAccessToken!;

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

        debug(`Calling perf API - ${url.toString()} - ${choreoToken} ${new Date()}`);
        const req = https.request(options, res => {
            var str = ''
            res.on('data', function (chunk) {
                str += chunk;
            });

            res.on('end', function () {
                if (res.statusCode != 200) {
                    debug(`Perf Error - ${res.statusCode} Status code. Retry counted. ${new Date()}`);
                    debug(str);
                    sendTelemetryEvent(extension, TM_EVENT_PERF_REQUEST, CMP_PERF_ANALYZER,
                        { 'is_successful': "false", 'error_code': `${res.statusCode}` });
                    handleRetries();
                    reject();
                }

                try {
                    const res = JSON.parse(str);
                    debug(`Perf Data received ${new Date()}`);
                    debug(str);

                    if (res.message) {
                        debug(`Perf Error ${new Date()}`);
                        sendTelemetryEvent(extension, TM_EVENT_PERF_REQUEST, CMP_PERF_ANALYZER,
                            { 'is_successful': "false", 'error_code': `${res.message}` });
                        checkErrors(res);
                        return reject();
                    }

                    cachedResponses.set(data, res);
                    if (analyzeType === ANALYZETYPE.REALTIME) {
                        sendTelemetryEvent(extension, TM_EVENT_PERF_REQUEST, CMP_PERF_ANALYZER,
                            {
                                'is_successful': "true", 'type': `${analyzeType}`,
                                'is_low_data': `${((res as PerformanceAnalyzerRealtimeResponse).concurrency.max == 1)}`
                            });

                    } else {
                        sendTelemetryEvent(extension, TM_EVENT_PERF_REQUEST, CMP_PERF_ANALYZER,
                            { 'is_successful': "true", 'type': `${analyzeType}` });

                    }
                    return resolve(res);

                } catch (e: any) {
                    debug(`Perf Error - Response json parsing failed. Retry counted. ${new Date()}`);
                    debug(str);
                    debug(e.toString())
                    sendTelemetryException(extension, e, CMP_PERF_ANALYZER);
                    handleRetries();
                    reject();
                }
            })
        })

        req.on('error', error => {
            debug(`Perf Error - Connection Error. Retry counted. ${new Date()}`);
            debug(error);
            sendTelemetryException(extension, error, CMP_PERF_ANALYZER);
            handleRetries();
            reject();
        })

        req.write(data);
        req.end();

    });
}
