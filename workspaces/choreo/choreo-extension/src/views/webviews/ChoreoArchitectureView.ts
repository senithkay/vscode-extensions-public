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

import * as vscode from "vscode";
import { WebViewPanelRpc } from "./rpc/WebviewRPC";
import { getUri } from "./utils";
import { FREE_COMPONENT_LIMIT } from "../../auth/config";
import { choreoEnvConfig } from "../../auth/auth";

export class ChoreoArchitectureView {
    public static currentPanel: ChoreoArchitectureView | undefined;
    private static _rpcHandler: WebViewPanelRpc;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, orgName: string, projectId: string) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri, orgName, projectId);
        if (!ChoreoArchitectureView._rpcHandler || ChoreoArchitectureView._rpcHandler.panel !== panel) {
            ChoreoArchitectureView._rpcHandler = new WebViewPanelRpc(this._panel);
        }
    }

    public static render(extensionUri: vscode.Uri, orgName: string, projectId: string) {
        if (ChoreoArchitectureView.currentPanel) {
            const panel = ChoreoArchitectureView.currentPanel._panel;
            ChoreoArchitectureView.currentPanel = new ChoreoArchitectureView(panel, extensionUri, orgName, projectId);
            panel.reveal(vscode.ViewColumn.One);
        } else {
            const panel = vscode.window.createWebviewPanel(
                "choreo-archi-view",
                "Choreo Architecture View",
                vscode.ViewColumn.One,
                { enableScripts: true, retainContextWhenHidden: true }
            );
            ChoreoArchitectureView.currentPanel = new ChoreoArchitectureView(panel, extensionUri, orgName, projectId);
        }
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, orgName: string, projectId: string) {
        // The JS file from the React build output
        const scriptUri = getUri(webview, extensionUri, [
            "resources",
            "jslibs",
            "main.js"
        ]);

        return /*html*/ `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
                    <meta name="theme-color" content="#000000">
                    <title>Choreo Architecture View</title>
                    <script src="${scriptUri}"></script>
                </head>
                <body>
                    <noscript>You need to enable JavaScript to run this app.</noscript>
                    <div id="root"></div>
                </body>
                <script>
                    function render() {
                        choreoWebviews.renderChoreoWebViews(
							document.getElementById("root"), 
							"ChoreoArchitectureView", 
							"${projectId}", 
							"${orgName}", 
							${FREE_COMPONENT_LIMIT},  
							"${choreoEnvConfig.getConsoleUrl()}"
						);
                    }
                    render();
                </script>
            </html>
          `;
    }

    public dispose() {
        ChoreoArchitectureView.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
