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
import { ExtendedLangClient, OASpec } from "../core";
import { PreviewServer } from "./server";

let swaggerViewPanel: WebviewPanel | undefined;

export function showSwaggerView(langClient: ExtendedLangClient, specs: OASpec[]): void {
    if (swaggerViewPanel) {
        swaggerViewPanel.dispose();
    }
    let previewServer: PreviewServer = new PreviewServer();
    previewServer.initiateServer();

    // Create and show a new SwaggerView
    swaggerViewPanel = window.createWebviewPanel(
        'ballerinaExamples',
        `Swagger`,
        { viewColumn: ViewColumn.Beside, preserveFocus: true },
        getCommonWebViewOptions()
    );

    WebViewRPCHandler.create(swaggerViewPanel, langClient);
    const html = render({ specs: specs });
    if (swaggerViewPanel && html) {
        swaggerViewPanel.webview.html = html;
    }
}
