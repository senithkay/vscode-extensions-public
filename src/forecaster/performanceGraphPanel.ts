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

import { ViewColumn, window, WebviewPanel, Uri, Disposable } from "vscode";
import { WebViewRPCHandler, getCommonWebViewOptions } from '../utils';
import { render } from './render';
import { updateCodeLenses } from ".";
import { BallerinaExtension, ExtendedLangClient, WEBVIEW_TYPE } from "../core";
import { ExecutorCodeLensProvider } from "./codelens-provider";
import { refreshDiagramForPerformanceConcurrencyChanges } from "../diagram";
import { GraphData } from "./model";
import { join } from "path";

let clearCodeLenses = true;

export class DefaultWebviewPanel {
    public static currentPanel: DefaultWebviewPanel | undefined;
    private readonly webviewPanel: WebviewPanel;
    private disposables: Disposable[] = [];
    private extension: BallerinaExtension;


    private constructor(panel: WebviewPanel, data: GraphData, type: WEBVIEW_TYPE, title: string, extension: BallerinaExtension) {
        this.webviewPanel = panel;
        this.update(data, type, title);
        this.webviewPanel.onDidDispose(() => this.dispose(), null, this.disposables);
        this.extension = extension;
    }

    public static create(langClient: ExtendedLangClient, data: GraphData, currentFileUri: Uri, title: string, viewColumn: ViewColumn,
        extension: BallerinaExtension, type: WEBVIEW_TYPE) {
        extension.setWebviewContext({ isOpen: true, type });
        if (DefaultWebviewPanel.currentPanel && DefaultWebviewPanel.currentPanel.webviewPanel.viewColumn
            && DefaultWebviewPanel.currentPanel.webviewPanel.viewColumn == viewColumn) {
            clearCodeLenses = false;

            DefaultWebviewPanel.currentPanel.webviewPanel.reveal();
            DefaultWebviewPanel.currentPanel.update(data, type, title);
            return;
        } else if (DefaultWebviewPanel.currentPanel) {
            DefaultWebviewPanel.currentPanel.dispose();
        }

        const panel = window.createWebviewPanel(
            'webviewPanel',
            title,
            { viewColumn, preserveFocus: true },
            getCommonWebViewOptions()
        );

        panel.iconPath = {
            light: Uri.file(join(extension.context!.extensionPath, 'resources/images/icons/enable.svg')),
            dark: Uri.file(join(extension.context!.extensionPath,
                'resources/images/icons/enable.svg'))
        };

        WebViewRPCHandler.create(panel, langClient);
        DefaultWebviewPanel.currentPanel = new DefaultWebviewPanel(panel, data, type, title, extension);

        // Update latency
        DefaultWebviewPanel.currentPanel.webviewPanel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'updateCodeLenses':
                        for (let editor of window.visibleTextEditors) {
                            if (editor.document.uri.path === currentFileUri.path) {
                                updateCodeLenses(message.text, editor.viewColumn);
                                break;
                            }
                        }

                        refreshDiagramForPerformanceConcurrencyChanges(message.text);
                        return;
                }
            }
        );

        DefaultWebviewPanel.currentPanel.webviewPanel.onDidDispose(() => {
            if (clearCodeLenses) {
                refreshDiagramForPerformanceConcurrencyChanges(-1);
                ExecutorCodeLensProvider.addCodeLenses(currentFileUri);
            }
        });
    }

    public dispose() {
        this.extension.setWebviewContext({ isOpen: false });
        DefaultWebviewPanel.currentPanel = undefined;
        this.webviewPanel.dispose();
        this.disposables.forEach(disposable => {
            disposable.dispose();
        });
    }

    private update(data: GraphData, type: WEBVIEW_TYPE, title) {
        if (DefaultWebviewPanel.currentPanel) {
            this.updateTitle(title);
        }
        this.webviewPanel.webview.html = render(type, { name: data.name, data: data.graphData });
        clearCodeLenses = true;
    }

    public updateTitle(title: string) {
        if (this.webviewPanel.title === title) {
            return;
        }
        this.webviewPanel.title = title;
    }
}
