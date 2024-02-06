/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { Uri, ViewColumn, Webview } from 'vscode';
import { getComposerJSFiles } from '../util';
import { RPCLayer } from '../RPCLayer';
import { extension } from '../MIExtensionContext';
import { onRefresh } from '@wso2-enterprise/mi-core';
import { debounce } from 'lodash';
import { WebViewOptions, getComposerWebViewOptions, getLibraryWebViewContent } from 'src/utils/webview-utils';

export class VisualizerWebview {
    public static currentPanel: VisualizerWebview | undefined;
	public static readonly viewType = 'ballerina.visualizer';
    private _panel: vscode.WebviewPanel | undefined;
    private _disposables: vscode.Disposable[] = [];

    constructor() {
        this._panel = VisualizerWebview.createWebview();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this.getWebviewContent(this._panel.webview);
        RPCLayer.create(this._panel);

        // Handle the text change and diagram update with rpc notification
        const refreshDiagram = debounce(() => {
            if (this.getWebview()) {
                RPCLayer._messenger.sendNotification(onRefresh, { type: 'webview', webviewType: VisualizerWebview.viewType });
            }
        }, 500);

        vscode.workspace.onDidChangeTextDocument(async function (document) {
            await document.document.save();
            refreshDiagram();
        }, extension.context);
    }

    private static createWebview(): vscode.WebviewPanel {
        const panel = vscode.window.createWebviewPanel(
            VisualizerWebview.viewType,
            'Integration Studio',
            ViewColumn.Active,
            {
                enableScripts: true,
                localResourceRoots: [Uri.file(path.join(extension.context.extensionPath, 'resources'))],
                retainContextWhenHidden: true,
            }
        );
        return panel;
    }

    public getWebview(): vscode.WebviewPanel | undefined {
        return this._panel;
    }

    private getWebviewContent(webView: Webview) {
        const body = `<div class="container" id="webview-container" />`;
        const bodyCss = ``;
        const styles = `
            .container {
                background-color: var(--vscode-editor-background);
                padding: 15px;
                height: 100vh;
                overflow: auto;
                width: 100%;
            }
        `;
        const scripts = `
            function loadedScript() {
                function renderDiagrams() {
                    visualizerWebview.renderWebview(document.getElementById("webview-container"));
                }
                renderDiagrams();
            }
        `;
    
        const webViewOptions: WebViewOptions = {
            ...getComposerWebViewOptions("Visualizer", webView),
            body, scripts, styles, bodyCss
        };
    
        return getLibraryWebViewContent(webViewOptions, webView);
    }

    public dispose() {
        VisualizerWebview.currentPanel = undefined;
        this._panel?.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }

        this._panel = undefined;
    }
}
