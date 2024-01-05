/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { getComposerJSFiles } from '../util';

export class ProjectView implements vscode.WebviewViewProvider {
	public static readonly viewType = 'integration-studio.activity.project';
	private _view?: vscode.WebviewView;

	constructor(private readonly _extensionContext: vscode.ExtensionContext) { }

	resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {

		this._view = webviewView;
		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionContext.extensionUri
			]
		};

		webviewView.webview.html = this._getWebviewContent(webviewView.webview);
	}

	private _getWebviewContent(webview: vscode.Webview) {
		// The JS file from the React build output

		const scripts = getComposerJSFiles(this._extensionContext, 'MIDiagram', webview).map(jsFile =>
			'<script charset="UTF-8" src="' + jsFile + '"></script>').join('\n');

		return /*html*/ `
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
					<meta name="theme-color" content="#000000">
					<title>Integration Studio</title>
				</head>
				<body>
					<noscript>You need to enable JavaScript to run this app.</noscript>
					<div id="activity-panel-container"></div>
				</body>
				${scripts}
				<script>
					function render() {
						MIDiagram.renderActivityPanel();
					}
					render();
				</script>
			</html>
		`;
	}
}

