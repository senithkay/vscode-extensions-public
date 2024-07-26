/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from "vscode";
import { WebViewPanelRpc } from "./rpc/WebviewRPC";
import { getUri } from "./utils";
import { FREE_COMPONENT_LIMIT } from "../../auth/config";
import { choreoEnvConfig } from "../../auth/auth";
import { Organization } from "@wso2-enterprise/choreo-core";

export class ChoreoCellView {
	public static currentPanel: ChoreoCellView | undefined;
	private static _rpcHandler: WebViewPanelRpc;
	private readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, orgName: string, projectId: string) {
		this._panel = panel;
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri, orgName, projectId);
		if (!ChoreoCellView._rpcHandler || ChoreoCellView._rpcHandler.panel !== panel) {
			ChoreoCellView._rpcHandler = new WebViewPanelRpc(this._panel);
		}
	}

	public static render(extensionUri: vscode.Uri, org: Organization, projectId: string) {
		if (ChoreoCellView.currentPanel) {
			const panel = ChoreoCellView.currentPanel._panel;
			ChoreoCellView.currentPanel = new ChoreoCellView(panel, extensionUri, org.name, projectId);
			panel.reveal(vscode.ViewColumn.One);
		} else {
			const panel = vscode.window.createWebviewPanel(
				"choreo-cell-view",
				"Choreo Cell View",
				vscode.ViewColumn.One,
				{ enableScripts: true, retainContextWhenHidden: true }
			);
			ChoreoCellView.currentPanel = new ChoreoCellView(panel, extensionUri, org.name, projectId);
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
                    <title>Choreo Cell View</title>
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
							"ChoreoCellView", 
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
		ChoreoCellView.currentPanel = undefined;

		this._panel.dispose();

		while (this._disposables.length) {
			const disposable = this._disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
	}
}
