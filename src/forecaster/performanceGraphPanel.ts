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
import { render } from './render';
import { GraphData } from "./activator";
import { updateCodeLenses } from ".";
import { ExtendedLangClient } from "../core";
import { ExecutorCodeLensProvider } from "./codelens-provider";
import { refreshDiagramForPerformanceConcurrencyChanges } from "../diagram";

let performanceGraphPanel: WebviewPanel | undefined;

export function showPerformanceGraph(langClient: ExtendedLangClient, data: GraphData, currentFileUri: Uri): void {
    if (performanceGraphPanel) {
        performanceGraphPanel.dispose();
    }

    // Create and show a new webview
    performanceGraphPanel = window.createWebviewPanel(
        'ballerinaExamples',
        `Performance Forecast of ${data.name}`,
        { viewColumn: ViewColumn.Beside, preserveFocus: true },
        getCommonWebViewOptions()
    );

    // Update latency
    performanceGraphPanel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case 'updateCodeLenses':
                    for (let editor of window.visibleTextEditors) {
                        if (editor.document.uri.path === currentFileUri.path) {
                            updateCodeLenses(message.text);
                            break;
                        }
                    }

                    refreshDiagramForPerformanceConcurrencyChanges(message.text);
                    return;
            }
        }
    );

    WebViewRPCHandler.create(performanceGraphPanel, langClient);
    const html = render({ name: data.name, data: data.graphData });
    if (performanceGraphPanel && html) {
        performanceGraphPanel.webview.html = html;
    }
    performanceGraphPanel.onDidDispose(() => {
        performanceGraphPanel = undefined;
        refreshDiagramForPerformanceConcurrencyChanges(-1);
        ExecutorCodeLensProvider.addCodeLenses(currentFileUri);
    });
}
