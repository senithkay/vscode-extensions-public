/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import * as vscode from 'vscode';
import { Uri } from "vscode";
import { getUri } from '../utils';
import { extension } from '../eggplantExtentionContext';
import { RPCLayer } from '../RPCLayer';
import { debounce } from "lodash";
import { onFileContentUpdate } from '@wso2-enterprise/eggplant-core';

export class VisualizerWebview {
    public static currentPanel: VisualizerWebview | undefined;
    private _panel: vscode.WebviewPanel | undefined;
    private _disposables: vscode.Disposable[] = [];
    public static readonly viewType = 'eggplant.visualizer';
    public static readonly panelTitle = 'Eggplant Visualizer';

    constructor() {
        this._panel = VisualizerWebview.createWebview();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this.getWebviewContent(this._panel.webview);
        RPCLayer.create(this._panel);

        // Handle the text change and diagram update with rpc notification
        const sendUpdateNotificationToWebview = debounce(() => {
            if (this._panel) {
                RPCLayer._messenger.sendNotification(onFileContentUpdate, { type: 'webview', webviewType: VisualizerWebview.viewType });
            }
        }, 500);

        vscode.workspace.onDidChangeTextDocument(async function (document) {
            if (document && document.document.languageId === "ballerina") {
                await document.document.save();
                sendUpdateNotificationToWebview();
            }
        }, extension.context);
    }

    private static createWebview(): vscode.WebviewPanel {
        const panel = vscode.window.createWebviewPanel(
            VisualizerWebview.viewType,
            VisualizerWebview.panelTitle,
            vscode.ViewColumn.One,
            { enableScripts: true }
        );
        return panel;
    }

    public getWebview(): vscode.WebviewPanel | undefined {
        return this._panel;
    }

    private getWebviewContent(webview: vscode.Webview) {
        // The JS file from the React build output
        const scriptUri = getUri(webview, extension.context.extensionUri, [
            "resources",
            "jslibs",
            "Visualizer.js"
        ]);

        const codiconUri = webview.asWebviewUri(Uri.joinPath(extension.context.extensionUri, "resources", "codicons", "codicon.css"));
        const fontsUri = webview.asWebviewUri(Uri.joinPath(extension.context.extensionUri, "node_modules", "@wso2-enterprise", "font-wso2-vscode", "dist", "wso2-vscode.css"));

        return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
          <meta name="theme-color" content="#000000">
          <title>Eggplant Overview</title>
          <link rel="stylesheet" href="${codiconUri}">
          <link rel="stylesheet" href="${fontsUri}">
          <script src="${scriptUri}"></script>
        </head>
        <body>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root">
                Loading ....
            </div>
            <script>
            function render() {
                visualizerWebview.renderWebview("visualizer", document.getElementById("root"));
            }
            render();
        </script>
        </body>
        </html>
      `;
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
