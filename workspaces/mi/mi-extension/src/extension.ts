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
import { MILanguageClient } from './lang-client/activator';

export async function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('integration.showDiagram', () => {
		createDiagramWebview(context, vscode.window.activeTextEditor!.document.uri.fsPath);
	});

	context.subscriptions.push(disposable);

	// activate language client
	const languageClient = (await MILanguageClient.getInstance()).languageClient;
	const st = await languageClient!.getSyntaxTree({
		documentIdentifier: {
			uri: vscode.window.activeTextEditor!.document.uri.toString()
		}
	});

	const cm = await languageClient!.getCompletion({
		textDocument: {
			fsPath: vscode.window.activeTextEditor!.document.uri.fsPath,
			uri: vscode.window.activeTextEditor!.document.uri.toString()
		},
		offset: 102,
		context: {
			triggerKind: 0
		}
	});
}
