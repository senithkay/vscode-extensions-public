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
import axios from 'axios';
import { generatePrompt } from './ai/prompt';
import { unescape } from 'querystring';
import { ProjectExplorerEntryProvider } from './activity-panel/project-explorer-provider';
import { createApiWizardWebview } from './api-wizard/webview';
import { createEndpointWizardWebview } from './endpoint-wizard/webview';
import { createSequenceWizardWebview } from './sequence-wizard/webview';

export async function activate(context: vscode.ExtensionContext) {

	const projectExplorerDataProvider = new ProjectExplorerEntryProvider(context)
	// vscode.window.registerTreeDataProvider('project-explorer', projectExplorerDataProvider)
	const projectTree = vscode.window.createTreeView('project-explorer', { treeDataProvider: projectExplorerDataProvider })
	vscode.commands.registerCommand('project-explorer.refresh', () => { projectExplorerDataProvider.refresh() })
	vscode.commands.registerCommand('project-explorer.add', () => {
		vscode.window.showQuickPick([
			{ label: 'API', description: 'Add new API' },
			{ label: 'Endpoint', description: 'Add new Endpoint' },
			{ label: 'Sequence', description: 'Add new Sequence' }
		], {
			placeHolder: 'Select the construct to add'
		}).then(selection => {
			if (selection?.label === 'API') {
				vscode.commands.executeCommand('project-explorer.add-api');
			} else if (selection?.label === 'Endpoint') {
				vscode.commands.executeCommand('project-explorer.add-endpoint');
			} else if (selection?.label === 'Sequence') {
				vscode.commands.executeCommand('project-explorer.add-sequence');
			}
		});

	})
	vscode.commands.registerCommand('project-explorer.add-api', () => {
		createApiWizardWebview(context);
	})

	vscode.commands.registerCommand('project-explorer.add-endpoint', () => {
		createEndpointWizardWebview(context);
	})

	vscode.commands.registerCommand('project-explorer.add-sequence', () => {
		createSequenceWizardWebview(context);
	})

	projectTree.onDidChangeSelection(async e => {
		if (e.selection.length > 0 && e.selection[0].info) {
			const info = e.selection[0].info;
			// TODO: Open file logic should go here
			const document = await vscode.workspace.openTextDocument(info.path);
			await vscode.window.showTextDocument(document);
			if (info.type === 'api') {
				vscode.commands.executeCommand('integrationStudio.showDiagram');
			} else if (info.type === 'resource') {
				vscode.commands.executeCommand('integrationStudio.showDiagram', info.name);
			}
		}
	})

	vscode.commands.executeCommand('project-explorer.focus');

	let disposable = vscode.commands.registerCommand('integrationStudio.showDiagram', async (resource: string) => {
		createDiagramWebview(context, vscode.window.activeTextEditor!.document.uri.fsPath, resource);
	});

	context.subscriptions.push(disposable);

	let prompt = vscode.commands.registerCommand('integrationStudio.addMediator', async () => {
		let userInput = await vscode.window.showInputBox({ prompt: 'What you want to add?' });
		let editor = vscode.window.activeTextEditor;
		if (userInput && editor) {
			let document = editor.document;
			let text = document.getText();

			const prompt = unescape(generatePrompt(text, userInput));

			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "Processing...",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0 });

				try {
					const apiKey = vscode.workspace.getConfiguration('integrationStudio').get('apiKey');
					if (!apiKey) {
						vscode.window.showErrorMessage('Please set your OpenAI API key in the settings.');
						return;
					}
					const response = await axios.post('https://api.openai.com/v1/chat/completions', {
						model: "gpt-3.5-turbo",
						"messages": [{ "role": "user", "content": prompt }],
						temperature: 0.2,
					}, {
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${apiKey}`
						}
					});

					progress.report({ increment: 50 });

					const data = response.data;
					if (editor) {
						const position = editor.selection.active;
						await editor.edit(editBuilder => {
							const content = data.choices[0].message.content;
							editBuilder.replace(new vscode.Range(document.positionAt(0), document.positionAt(text.length)), content);
						});
					}

					progress.report({ increment: 100 });
				} catch (error) {
					vscode.window.showErrorMessage('An error occurred while processing your request.');
				}
			});
		}
	});

	context.subscriptions.push(prompt);
}
