/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { ProjectExplorerEntryProvider } from './project-explorer-provider';
import { openView } from '../stateMachine';

export function activateProjectExplorer(context: vscode.ExtensionContext) {

	const projectExplorerDataProvider = new ProjectExplorerEntryProvider(context);
	// vscode.window.registerTreeDataProvider('project-explorer', projectExplorerDataProvider)
	const projectTree = vscode.window.createTreeView('project-explorer', { treeDataProvider: projectExplorerDataProvider });
	vscode.commands.registerCommand('project-explorer.refresh', () => { projectExplorerDataProvider.refresh(); });
	vscode.commands.registerCommand('project-explorer.add', () => {
		vscode.window.showQuickPick([
			{ label: 'API', description: 'Add new API' }
		], {
			placeHolder: 'Select the construct to add'
		}).then(selection => {
			if (selection?.label === 'API') {
				vscode.commands.executeCommand('project-explorer.add-api');
			}
		});

	});
	vscode.commands.registerCommand('project-explorer.add-api', () => {
		// Update state machine to show the api wizard
		// createApiWizardWebview(context);
		console.log('Add API');
	});

	projectTree.onDidChangeSelection(async e => {
		if (e.selection.length > 0 && e.selection[0].info) {
			const info = e.selection[0].info;
			console.log(info);
			// TODO: Open file logic should go here
			// const document = await vscode.workspace.openTextDocument(info.path);
			// await vscode.window.showTextDocument(document);
			openView( { fileName: info.path });
			vscode.commands.executeCommand('integrationStudio.showDiagram');
		}
	});

	vscode.commands.executeCommand('project-explorer.focus');
}

