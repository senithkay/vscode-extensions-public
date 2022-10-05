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
import { getPortPromise } from "portfinder";

let graphqlViewPanel: WebviewPanel | undefined;
let cors_proxy = require('cors-anywhere');

export async function showGraphqlView(langClient: ExtendedLangClient, serviceAPI: string): Promise<void> {
    if (graphqlViewPanel) {
        graphqlViewPanel.dispose();
    }

    const port = await getPortPromise({ port: 1000, stopPort: 3000 });

    cors_proxy.createServer({
        originWhitelist: [], // Allow all origins
        requireHeader: ['origin', 'x-requested-with']
    }).listen(port, '0.0.0.0');

    // Create and show a new GraphqlView
    graphqlViewPanel = window.createWebviewPanel(
        'ballerinaGraphql',
        `Graphql`,
        { viewColumn: ViewColumn.Beside, preserveFocus: true },
        getCommonWebViewOptions()
    );

    const proxy = `http://localhost:${port}/`;
    WebViewRPCHandler.create(graphqlViewPanel, langClient);
    const html = render({ serviceAPI, proxy });
    if (graphqlViewPanel && html) {
        graphqlViewPanel.webview.html = html;
    }
    //editor-lowcode-code-tryit
    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_GRAPHQL_RUN, CMP_TRYIT_GRAPHQL_VIEW);
}
