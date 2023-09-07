/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { createDiagramWebview } from './diagram/webview';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "integration-studio" is now active!');

	let disposable = vscode.commands.registerCommand('integration-studio.helloWorld', () => {
		vscode.window.showInformationMessage('Hello Worldd from Integration Studio!');
		createDiagramWebview(context);
	});

	context.subscriptions.push(disposable);
}
