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
import { WebViewRPCHandler, getCommonWebViewOptions } from '../../utils';
import { render } from './render';
import { ballerinaExtInstance, CodeServerContext, ExtendedLangClient, OASpec } from "../../core";
import { SwaggerServer } from "../server";
import { CMP_TRYIT_VIEW, sendTelemetryEvent, TM_EVENT_SWAGGER_RUN } from "../../telemetry";
import { getPortPromise } from "portfinder";
import { loader } from "./loader";
import { getChoreoExtAPI } from '../../choreo-features/activate';
import { KeyChainTokenStorage } from "@wso2-enterprise/choreo-client";

export const CHOREO_API_TEST_DATA_GEN = process.env.VSCODE_CHOREO_GATEWAY_BASE_URI ?
    `${process.env.VSCODE_CHOREO_GATEWAY_BASE_URI}/ai-test-assistant/1.0.0/generate-data` :
    "https://apis.choreo.dev/ai-test-assistant/1.0.0/generate-data";

let swaggerViewPanel: WebviewPanel | undefined;
let cors_proxy = require('cors-anywhere');

export async function showSwaggerView(langClient: ExtendedLangClient,
    specs: OASpec[], file: string, serviceName: string | undefined, codeServerContext: CodeServerContext): Promise<void> {
    if (swaggerViewPanel) {
        swaggerViewPanel.dispose();
    }

    if (serviceName && serviceName.startsWith("/")) {
        serviceName = serviceName.substring(1);
    }
    const swaggerServer: SwaggerServer = new SwaggerServer();
    const port = await getPortPromise({ port: 1000, stopPort: 3000 });

    cors_proxy.createServer({
        originWhitelist: [], // Allow all origins
        requireHeader: ['origin', 'x-requested-with']
    }).listen(port, '0.0.0.0');

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
            await swaggerServer.sendRequest(message.req, false).then((response) => {
                swaggerViewPanel!.webview.postMessage({
                    command: 'swaggerResponse',
                    res: response
                });
            });
        }
    );

    const proxy = codeServerContext.codeServerEnv ? codeServerContext.manageChoreoRedirectUri : `http://localhost:${port}/`;
    WebViewRPCHandler.create(swaggerViewPanel, langClient);
    if (swaggerViewPanel) {
        const loaderHtml = loader(swaggerViewPanel.webview);
        if (loaderHtml) {
            swaggerViewPanel.webview.html = loaderHtml;
        }

        const choreoExt = await getChoreoExtAPI();
        if (choreoExt) {
            const tokenStorage = new KeyChainTokenStorage();
            const choreoTokenInfo = await tokenStorage.getToken("choreo.vscode.token");

            if (choreoTokenInfo?.accessToken) {
                for (let index = 0; index < specs.length; index++) {
                    const spec = specs[index];
                    const data = { "openapiSpec": spec.spec };
                    const request = {
                        url: CHOREO_API_TEST_DATA_GEN,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${choreoTokenInfo.accessToken}`
                        },
                        body: data
                    }
                    let testData = await swaggerServer.sendRequest(request, false);
                    if (!testData) {
                        continue;
                    }
                    if ((testData as any).status != 200) {
                        continue;
                    }
                    spec.spec = JSON.parse((testData as any).body).openapiSpec;
                }
            }
        }

        const html = render({ specs, file, serviceName, proxy }, swaggerViewPanel.webview);
        if (html) {
            swaggerViewPanel.webview.html = html;
        }
    }
    //editor-lowcode-code-tryit
    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_SWAGGER_RUN, CMP_TRYIT_VIEW);
}
