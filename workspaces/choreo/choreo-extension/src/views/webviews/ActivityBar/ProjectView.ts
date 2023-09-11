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
import { WebViewViewRPC } from "../rpc/WebviewRPC";
import { getUri } from '../utils';
import { ext } from '../../../extensionVariables';
import { choreoEnvConfig } from '../../../auth/auth';
import { FREE_COMPONENT_LIMIT } from '../../../auth/config';


export class ProjectView implements vscode.WebviewViewProvider {

	public static readonly viewType = 'choreo.activity.project';

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
		this.updateProjectInfo();
	}

	private async updateProjectInfo() {
		await ext.api.waitForLogin();
		const currentProject = await ext.api.getChoreoProject();
		if (currentProject && this._view) {
			this._view.description = currentProject.name;
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
	
		return /*html*/ `
			  <!DOCTYPE html>
			  <html lang="en">
				<head>
				  <meta charset="utf-8">
				  <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
				  <meta name="theme-color" content="#000000">
				  <title>Choreo Webview Wizard</title>
				  <link rel="stylesheet" href="${codiconUri}">
				  <script src="${scriptUri}"></script>
				</head>
				<body>
				  <noscript>You need to enable JavaScript to run this app.</noscript>
				  <div id="root"></div>
				</body>
				<script>
				  function render() {
					choreoWebviews.renderChoreoWebViews(document.getElementById("root"), "ActivityBarProjectView",
						undefined, // webview will use RPC to get the current project
						undefined, // webview will use RPC to get the current org
						${FREE_COMPONENT_LIMIT}, 
						"${choreoEnvConfig.getConsoleUrl()}"
					);
				  }
				  render();
				</script>
			  </html>
			`;
	  }
}
