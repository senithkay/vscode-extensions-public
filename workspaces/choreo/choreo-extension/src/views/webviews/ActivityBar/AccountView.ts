/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as vscode from 'vscode';
import { WebViewViewRPC } from '../rpc/WebviewRPC';
import { getUri } from '../utils';
import { ext } from '../../../extensionVariables';

export class AccountView implements vscode.WebviewViewProvider {

	public static readonly viewType = 'choreo.activity.account';

	private _view?: vscode.WebviewView;
	private _rpc?: WebViewViewRPC;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;
        

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getWebviewContent(webviewView.webview);
		this._rpc = new WebViewViewRPC(webviewView);
		this.updateLoginStatus();
		ext.context.subscriptions.push(ext.api.onStatusChanged(() => this.updateLoginStatus()));
	}

	private async updateLoginStatus() {
		const isLoggedIn = await ext.api.waitForLogin();
		if (isLoggedIn && this._view) {
			const userInfo = ext.api.userInfo;
			// this._view.description = userInfo?.displayName;
		}
	}

	private _getWebviewContent(webview: vscode.Webview) {
		// The JS file from the React build output
		const scriptUri = getUri(webview, ext.context.extensionUri, [
		  "resources",
		  "jslibs",
		  "main.js"
		]);
	
		const codiconUri = webview.asWebviewUri(vscode.Uri.joinPath(ext.context.extensionUri, "resources", "codicons", "codicon.css"));
		const fontsUri = webview.asWebviewUri(vscode.Uri.joinPath(ext.context.extensionUri, "node_modules", "@wso2-enterprise", "font-wso2-vscode", "dist", "wso2-vscode.css"));
	
		return /*html*/ `
			  <!DOCTYPE html>
			  <html lang="en">
				<head>
				  <meta charset="utf-8">
				  <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
				  <meta name="theme-color" content="#000000">
				  <title>Choreo Webview Wizard</title>
				  <link rel="stylesheet" href="${codiconUri}">
				  <link rel="stylesheet" href="${fontsUri}">
				  <script src="${scriptUri}"></script>
				  <script src="${fontsUri}"></script>
				</head>
				<body>
				  <noscript>You need to enable JavaScript to run this app.</noscript>
				  <div id="root"></div>
				</body>
				<script>
				  function render() {
					choreoWebviews.renderChoreoWebViews(document.getElementById("root"), "ActivityBarAccountView");
				  }
				  render();
				</script>
			  </html>
			`;
	  }
}
