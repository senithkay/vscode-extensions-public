/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { ViewColumn, window, WebviewPanel, Uri, Disposable } from "vscode";
import { WebViewRPCHandler, getCommonWebViewOptions } from '../utils';
import { render } from './render';
// import { updatePerfPath } from ".";
import { BallerinaExtension, ExtendedLangClient, WEBVIEW_TYPE } from "../core";
import { ExecutorCodeLensProvider } from "./codelens-provider";
import { refreshDiagramForPerformanceConcurrencyChanges as updateDiagramPerfPath } from "../diagram";
import { PerformanceGraphRequest } from "./model";
import { join } from "path";

export class DefaultWebviewPanel {
    public static currentPanel: DefaultWebviewPanel | undefined;
    private readonly webviewPanel: WebviewPanel;
    private disposables: Disposable[] = [];
    private extension: BallerinaExtension;
    static clearCodeLenses = true;

    private constructor(panel: WebviewPanel, data: PerformanceGraphRequest, type: WEBVIEW_TYPE, title: string, extension: BallerinaExtension) {
        this.webviewPanel = panel;
        this.update(data, type, title);
        this.webviewPanel.onDidDispose(() => this.dispose(), null, this.disposables);
        this.extension = extension;
    }

    public static create(langClient: ExtendedLangClient, data: PerformanceGraphRequest, currentFileUri: Uri, title: string, viewColumn: ViewColumn,
        extension: BallerinaExtension, type: WEBVIEW_TYPE) {
        extension.setWebviewContext({ isOpen: true, type });
        if (DefaultWebviewPanel.currentPanel && DefaultWebviewPanel.currentPanel.webviewPanel.viewColumn
            && DefaultWebviewPanel.currentPanel.webviewPanel.viewColumn == viewColumn) {
            DefaultWebviewPanel.clearCodeLenses = false;

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
                    case 'updatePerfPath':
                        // sendTelemetryEvent(extension, TM_EVENT_CLICK_PERF_GRAPH, CMP_PERF_ANALYZER, { 'concurrency': `${message.text}` });
                        // for (let editor of window.visibleTextEditors) {
                        //     if (editor.document.uri.path === currentFileUri.path) {
                        //         updatePerfPath(message.text, editor.viewColumn);
                        //         break;
                        //     }
                        // }

                        updateDiagramPerfPath(message.text);
                        return;
                }
            }
        );

        DefaultWebviewPanel.currentPanel.webviewPanel.onDidDispose(() => {
            if (DefaultWebviewPanel.clearCodeLenses) {
                updateDiagramPerfPath("-1");
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

    private update(request: PerformanceGraphRequest, type: WEBVIEW_TYPE, title) {
        if (DefaultWebviewPanel.currentPanel) {
            this.updateTitle(title);
        }
        this.webviewPanel.webview.html = render(type, { name: request.name, data: request.data }, this.webviewPanel.webview);
        DefaultWebviewPanel.clearCodeLenses = true;
    }

    public updateTitle(title: string) {
        if (this.webviewPanel.title === title) {
            return;
        }
        this.webviewPanel.title = title;
    }
}
