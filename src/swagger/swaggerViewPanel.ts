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

import { ViewColumn, window, WebviewPanel } from "vscode";
import { WebViewRPCHandler, getCommonWebViewOptions } from '../utils';
import { render } from './render';
import { ballerinaExtInstance, ExtendedLangClient, OASpec } from "../core";
import { SwaggerServer } from "./server";
import { CMP_TRYIT_VIEW, sendTelemetryEvent, TM_EVENT_SWAGGER_RUN } from "../telemetry";

let swaggerViewPanel: WebviewPanel | undefined;

export async function showSwaggerView(langClient: ExtendedLangClient,
    specs: OASpec[], file: string, serviceName: string | undefined): Promise<void> {
    if (swaggerViewPanel) {
        swaggerViewPanel.dispose();
    }
    const swaggerServer: SwaggerServer = new SwaggerServer();

    // Create and show a new SwaggerView
    swaggerViewPanel = window.createWebviewPanel(
        'ballerinaSwagger',
        `Swagger`,
        { viewColumn: ViewColumn.Beside, preserveFocus: true },
        getCommonWebViewOptions()
    );

    // Swagger Request
    swaggerViewPanel.webview.onDidReceiveMessage(
        async message => {
            if (message.command !== 'swaggerRequest') {
                return;
            }
            await swaggerServer.sendRequest(message.req).then((response) => {
                swaggerViewPanel!.webview.postMessage({
                    command: 'swaggerResponse',
                    res: response
                });
            });
        }
    );

    WebViewRPCHandler.create(swaggerViewPanel, langClient);
    const html = render({ specs, file, serviceName });
    if (swaggerViewPanel && html) {
        swaggerViewPanel.webview.html = html;
    }
    //editor-lowcode-code-tryit
    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_SWAGGER_RUN, CMP_TRYIT_VIEW);
}
