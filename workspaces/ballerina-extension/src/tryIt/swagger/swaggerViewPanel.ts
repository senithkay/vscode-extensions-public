/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ViewColumn, window, WebviewPanel, commands } from "vscode";
import { WebViewRPCHandler, getCommonWebViewOptions, debug } from '../../utils';
import { render } from './render';
import { ballerinaExtInstance, CodeServerContext, ExtendedLangClient, OASpec } from "../../core";
import { SwaggerServer } from "../server";
import { CMP_TRYIT_VIEW, sendTelemetryEvent, TM_EVENT_SWAGGER_RUN } from "../../telemetry";
import { getPortPromise } from "portfinder";
import { loader } from "./loader";
import { getChoreoExtAPI } from '../../choreo-features/activate';

const cachedResponses = new Map<any, JSON>();

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

        const extApi = await getChoreoExtAPI();
        if (extApi) {
            if (!await extApi.waitForLogin()) {
                const action = 'Sign in to Choreo';
                window.showInformationMessage("Please sign in to Choreo to use AI generated sample data.",
                    action).then((selection) => {
                        if (action === selection) {
                            commands.executeCommand('choreo-account.focus');
                        }
                    });
            } else {
                for (let index = 0; index < specs.length; index++) {
                    const spec = specs[index];
                    const data = { "openapiSpec": spec.spec };
                    const cacheKey = JSON.stringify(data);

                    if (cachedResponses.has(cacheKey)) {
                        spec.spec = cachedResponses.get(cacheKey);
                        continue;
                    }

                    try {
                        const response = await extApi.getSwaggerExamples(data);
                        if (!response) {
                            continue;
                        }

                        const status = response.status;
                        if (status != 200) {
                            debug(`Swagger examples API Error - ${status} Status code.`);
                            debug(response.data);
                            continue;
                        }

                        const responseData = response.data;
                        debug(`Swagger examples data received ${new Date()}`);
                        debug(responseData);

                        cachedResponses.set(cacheKey, responseData.openapiSpec);
                        spec.spec = responseData.openapiSpec;
                    } catch {
                        continue;
                    }
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
