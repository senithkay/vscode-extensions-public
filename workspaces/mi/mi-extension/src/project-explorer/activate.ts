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
import { COMMANDS } from '../constants';

export function activateProjectExplorer(context: vscode.ExtensionContext) {

	const projectExplorerDataProvider = new ProjectExplorerEntryProvider(context);
	const projectTree = vscode.window.createTreeView('project-explorer', { treeDataProvider: projectExplorerDataProvider });
	vscode.commands.registerCommand(COMMANDS.REFRESH_COMMAND, () => { projectExplorerDataProvider.refresh(); });
	vscode.commands.registerCommand(COMMANDS.ADD_COMMAND, () => {
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
				vscode.commands.executeCommand(COMMANDS.ADD_API_COMMAND);
			} else if (selection?.label === 'Endpoint') {
				vscode.commands.executeCommand(COMMANDS.ADD_ENDPOINT_COMMAND);
			} else if (selection?.label === 'Sequence') {
				vscode.commands.executeCommand(COMMANDS.ADD_SEQUENCE_COMMAND);
			} else if (selection?.label === 'Inbound Endpoint') {
				vscode.commands.executeCommand(COMMANDS.ADD_INBOUND_ENDPOINT_COMMAND);
			} else if (selection?.label === 'New Project') {
				vscode.commands.executeCommand(COMMANDS.CREATE_PROJECT_COMMAND);
			}
		});

	});
	vscode.commands.registerCommand(COMMANDS.ADD_API_COMMAND, () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.APIForm });
		console.log('Add API');
	});

	vscode.commands.registerCommand(COMMANDS.ADD_ENDPOINT_COMMAND, () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.EndPointForm });
		console.log('Add Endpoint');
	});

	vscode.commands.registerCommand(COMMANDS.ADD_SEQUENCE_COMMAND, () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.SequenceForm });
		console.log('Add Sequence');
	});

	vscode.commands.registerCommand(COMMANDS.ADD_INBOUND_ENDPOINT_COMMAND, () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.InboundEPForm });
		console.log('Add Inbound API');
	});

	vscode.commands.registerCommand(COMMANDS.CREATE_PROJECT_COMMAND, () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ProjectCreationForm });
		console.log('Create New Project');
	});

	vscode.commands.registerCommand(COMMANDS.REVEAL_ITEM_COMMAND, async (viewLocation: VisualizerLocation) => {
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

	vscode.commands.executeCommand(COMMANDS.FOCUS_PROJECT_EXPLORER);
}
