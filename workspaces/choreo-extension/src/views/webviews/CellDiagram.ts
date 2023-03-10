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
import { Project } from "@wso2-enterprise/choreo-core";
import { WebViewRpc } from "./rpc/WebviewRPC";
import { ext } from "../../extensionVariables";
import { getUri } from "./utils";

export class CellDiagram {
	public static currentPanel: CellDiagram | undefined;
	private static _rpcHandler: WebViewRpc;
	public static project: Project | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, orgName: string, projectId: string) {
		this._panel = panel;
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri, orgName, projectId);
		if (!CellDiagram._rpcHandler) {
			CellDiagram._rpcHandler = new WebViewRpc(this._panel);
		} else if (CellDiagram._rpcHandler.panel !== panel) {
			CellDiagram._rpcHandler = new WebViewRpc(this._panel);
		}
		this._panel.onDidChangeViewState(e => {
			if (e.webviewPanel.visible) {
				ext.api.projectUpdated();
			}
		});
	}

	public static render(extensionUri: vscode.Uri, orgName: string, projectId: string) {
		if (CellDiagram.currentPanel) {
			const panel = CellDiagram.currentPanel._panel;
			CellDiagram.currentPanel = new CellDiagram(panel, extensionUri, orgName, projectId);
			panel.reveal(vscode.ViewColumn.One);
		} else {
			const panel = vscode.window.createWebviewPanel("choreo-cell-view", "Cell Architecture View", vscode.ViewColumn.One, {
				enableScripts: true, retainContextWhenHidden: true
			});
			CellDiagram.currentPanel = new CellDiagram(panel, extensionUri, orgName, projectId);
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
                    <title>Cell View</title>
                    <script src="${scriptUri}"></script>
                </head>
                <body>
                    <noscript>You need to enable JavaScript to run this app.</noscript>
                    <div id="root"></div>
                </body>
                <script>
                    function render() {
                        choreoWebviews.renderChoreoWebViews({ type: "CellView", projectId: "${projectId}", orgName: "${orgName}" }, document.getElementById("root"));
                    }
                    render();
                </script>
            </html>
          `;
	}

	public dispose() {
		CellDiagram.currentPanel = undefined;

		this._panel.dispose();

		while (this._disposables.length) {
			const disposable = this._disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
	}
}
