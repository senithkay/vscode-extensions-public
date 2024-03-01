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
import { EVENT_TYPE, MACHINE_VIEW, VisualizerLocation } from '@wso2-enterprise/mi-core';

export function activateProjectExplorer(context: vscode.ExtensionContext) {

	const projectExplorerDataProvider = new ProjectExplorerEntryProvider(context);
	// vscode.window.registerTreeDataProvider('project-explorer', projectExplorerDataProvider)
	const projectTree = vscode.window.createTreeView('project-explorer', { treeDataProvider: projectExplorerDataProvider });
	vscode.commands.registerCommand('project-explorer.refresh', () => { projectExplorerDataProvider.refresh(); });
	vscode.commands.registerCommand('project-explorer.add', () => {
		vscode.window.showQuickPick([
			{ label: 'New Project', description: 'Create new project' },
			{ label: 'API', description: 'Add new API' },
			{ label: 'Endpoint', description: 'Add new endpoint' },
			{ label: 'Sequence', description: 'Add new sequence' },
			{ label: 'Inbound Endpoint', description: 'Add new inbound endpoint' }
		], {
			placeHolder: 'Select the construct to add'
		}).then(selection => {
			if (selection?.label === 'API') {
				vscode.commands.executeCommand('project-explorer.add-api');
			} else if (selection?.label === 'Endpoint') {
				vscode.commands.executeCommand('project-explorer.add-endpoint');
			} else if (selection?.label === 'Sequence') {
				vscode.commands.executeCommand('project-explorer.add-sequence');
			} else if (selection?.label === 'Inbound Endpoint') {
				vscode.commands.executeCommand('project-explorer.add-inbound-endpoint');
			} else if (selection?.label === 'New Project') {
				vscode.commands.executeCommand('project-explorer.create-project');
			}
		});

	});
	vscode.commands.registerCommand('project-explorer.add-api', () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.APIForm });
		console.log('Add API');
	});

	vscode.commands.registerCommand('project-explorer.add-endpoint', () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.EndPointForm });
		console.log('Add Endpoint');
	});

	vscode.commands.registerCommand('project-explorer.add-sequence', () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.SequenceForm });
		console.log('Add Sequence');
	});

	vscode.commands.registerCommand('project-explorer.add-inbound-endpoint', () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.InboundEPForm });
		console.log('Add Inbound API');
	});

	vscode.commands.registerCommand('project-explorer.create-project', () => {
		// Update state machine to show the api wizard
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ProjectCreationForm });
		console.log('Create New Project');
	});

	vscode.commands.registerCommand('project-explorer.revealItem', async (viewLocation: VisualizerLocation) => {
		const data = projectExplorerDataProvider.getChildren();

		if (viewLocation.projectUri && viewLocation.projectUri && data) {
			const project = (await data)?.find((project) => project.info?.path === viewLocation.projectUri);
			if (project) {
				projectTree.reveal(project, { select: true, focus: true });
				const projectChildren = projectExplorerDataProvider.getChildren(project);
				if (projectChildren) {
					const projectResources = await projectChildren;
					if (!projectResources) return;

					for (const projectResource of projectResources) {
						const fileEntry = projectResource.children?.find((file) => file.info?.path === viewLocation.documentUri);
						if (fileEntry) {
							projectTree.reveal(fileEntry, { select: true, focus: true });

							if (viewLocation.identifier) {
								const resourceEntry = fileEntry.children?.find((file) => file.info?.name === viewLocation.identifier);
								if (resourceEntry) {
									projectTree.reveal(resourceEntry, { select: true, focus: true });
								}
							}
							break;
						}
					}
				}
			}
		}
	});

	vscode.commands.executeCommand('project-explorer.focus');
}

