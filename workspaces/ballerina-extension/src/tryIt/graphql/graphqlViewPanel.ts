/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
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
