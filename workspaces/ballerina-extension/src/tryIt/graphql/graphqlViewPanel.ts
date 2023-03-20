/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import { ballerinaExtInstance, ExtendedLangClient } from "../../core";
import { CMP_TRYIT_GRAPHQL_VIEW, sendTelemetryEvent, TM_EVENT_GRAPHQL_RUN } from "../../telemetry";
import { SwaggerServer } from "../server";

let graphqlViewPanel: WebviewPanel | undefined;

export async function showGraphqlView(langClient: ExtendedLangClient, serviceAPI: string): Promise<void> {
    if (graphqlViewPanel) {
        graphqlViewPanel.dispose();
    }

    // Create and show a new GraphqlView
    graphqlViewPanel = window.createWebviewPanel(
        'ballerinaGraphql',
        `Graphql`,
        { viewColumn: ViewColumn.Active, preserveFocus: true },
        getCommonWebViewOptions()
    );

    // Graphql Request
    const swaggerServer: SwaggerServer = new SwaggerServer();
    graphqlViewPanel.webview.onDidReceiveMessage(
        async message => {
            if (message.command !== 'graphqlRequest') {
                return;
            }
            await swaggerServer.sendRequest(message.req, true).then((response) => {
                graphqlViewPanel!.webview.postMessage({
                    command: 'graphqlResponse',
                    res: response
                });
            });
        }
    );

    WebViewRPCHandler.create(graphqlViewPanel, langClient);
    if (graphqlViewPanel) {
        const html = render({ serviceAPI }, graphqlViewPanel.webview);
        if (html) {
            graphqlViewPanel.webview.html = html;
        }
    }
    //editor-lowcode-code-tryit
    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_GRAPHQL_RUN, CMP_TRYIT_GRAPHQL_VIEW);
}
