/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { extension } from './MIExtensionContext';
import { activate as activateHistory } from './history';
import { activateVisualizer } from './visualizer/activate';
import { activateAiPanel } from './ai-panel/activate';

import { activateDebugger } from './debugger/activate';
import { activateMigrationSupport } from './migration';
import { activateRuntimeService } from './runtime-services-panel/activate';
import { MILanguageClient } from './lang-client/activator';
import { activateUriHandlers } from './uri-handler';
import { extensions, workspace } from 'vscode';
import { StateMachineAI } from './ai-panel/aiMachine';
import { getStateMachine } from './stateMachine';
import { webviews } from './visualizer/webview';

export async function activate(context: vscode.ExtensionContext) {
	extension.context = context;
	activateUriHandlers();
	activateHistory();

	activateDebugger(context);
	activateMigrationSupport(context);
	// activateActivityPanel(context);
	// activateAiPrompt(context);
	activateRuntimeService(context);
	activateVisualizer(context);
	activateAiPanel(context);

	const firstProject = workspace.workspaceFolders?.[0];
	if (firstProject) {
		getStateMachine(firstProject.uri.fsPath);
	}
	workspace.onDidChangeWorkspaceFolders(async (event) => {
		if (event.added.length > 0) {
			const newProject = event.added[0];
			getStateMachine(newProject.uri.fsPath);
		}
		if (event.removed.length > 0) {
			const removedProject = event.removed[0];
			const webview = webviews.get(removedProject.uri.fsPath);

			if (webview) {
				webview.dispose();
			}
		}
	}
	);
	StateMachineAI.initialize();
}

export async function deactivate(): Promise<void> {
	const clients = await MILanguageClient.getAllInstances();
	clients.forEach(async client => {
		await client?.languageClient?.stop();
	});

	// close all webviews
	const allWebviews = Array.from(webviews.values());
	for (let i = 0; i < allWebviews.length; i++) {
		const webview = allWebviews[i];
		if (webview) {
			webview.dispose();
		}
	}
}

export function checkForDevantExt() {
	const wso2PlatformExtension = extensions.getExtension('wso2.wso2-platform');
	if (!wso2PlatformExtension) {
		vscode.window.showErrorMessage('The WSO2 Platform extension is not installed. Please install it to proceed.');
		return false;
	}
	return true;
}
