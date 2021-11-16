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

import { ViewColumn, window, WebviewPanel, Uri } from "vscode";
import { WebViewRPCHandler, getCommonWebViewOptions } from '../utils';
import { render } from './renderer';
import { ExtendedLangClient } from "../core";

let configEditorPanel: WebviewPanel | undefined;

export function showConfigEditor(langClient: ExtendedLangClient, configSchema: any, currentFileUri: Uri): void {
    if (configEditorPanel) {
        configEditorPanel.dispose();
    }

    // Create and show a new webview
    configEditorPanel = window.createWebviewPanel(
        'ballerinaConfigEditor',
        `Configurable Editor`,
        { viewColumn: ViewColumn.Beside, preserveFocus: true },
        getCommonWebViewOptions()
    );

    // Update latency
    configEditorPanel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case 'updateCodeLenses':
                    return;
            }
        }
    );

    WebViewRPCHandler.create(configEditorPanel, langClient);
    const html = render({ configSchema });
    if (configEditorPanel && html) {
        configEditorPanel.webview.html = html;
    }
    configEditorPanel.onDidDispose(() => {
        configEditorPanel = undefined;
    });
}
