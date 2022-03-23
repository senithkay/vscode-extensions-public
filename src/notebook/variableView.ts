/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { WebviewViewProvider, WebviewView, WebviewViewResolveContext, CancellationToken, ExtensionContext } from "vscode";
import { BallerinaExtension, ExtendedLangClient } from "../core";

export class VariableViewProvider implements WebviewViewProvider {

	public static readonly viewType = 'ballerinaViewVariables';
	private view?: WebviewView;
	private ballerinaExtension: BallerinaExtension;

    constructor(extensionInstance: BallerinaExtension) {
        this.ballerinaExtension = extensionInstance; 
	}

	public resolveWebviewView(webviewView: WebviewView, _context: WebviewViewResolveContext,
		token: CancellationToken,) {
		const context = <ExtensionContext>this.ballerinaExtension.context;
		const langClient: ExtendedLangClient = <ExtendedLangClient>this.ballerinaExtension.langClient;
		
		this.view = webviewView;
		webviewView.webview.options = {
			enableScripts: true,
		};
		// const html = render(context, langClient);
		webviewView.webview.html = this.getHtmlForWebview();
	}

	private getHtmlForWebview() {
		let langClient: ExtendedLangClient = <ExtendedLangClient>this.ballerinaExtension.langClient;
		let varStrings = ''
        if (langClient) {
			// let variables = await langClient.getNotebookVariables();
			// variables.forEach(element => {
			// 	varStrings += `<li>${element}</li>`;
			// });
        }


		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				
				<title>Variables</title>
			</head>
			<body>
				<ul class="variable-list">${varStrings}</ul>

				<button class="add-color-button">Add Color</button>
			</body>
			</html>`;
	}
}
