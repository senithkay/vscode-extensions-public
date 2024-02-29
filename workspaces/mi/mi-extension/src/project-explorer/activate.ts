/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ProjectExplorerEntry, ProjectExplorerEntryProvider } from './project-explorer-provider';
import { StateMachine, openView } from '../stateMachine';
import { EVENT_TYPE, MACHINE_VIEW, VisualizerLocation } from '@wso2-enterprise/mi-core';
import { COMMANDS } from '../constants';
import { ExtensionContext, Uri, ViewColumn, commands, window } from 'vscode';
import { VisualizerWebview } from '../visualizer/webview';

export function activateProjectExplorer(context: ExtensionContext) {

	const projectExplorerDataProvider = new ProjectExplorerEntryProvider(context);
	const projectTree = window.createTreeView('MI.project-explorer', { treeDataProvider: projectExplorerDataProvider });
	commands.registerCommand(COMMANDS.REFRESH_COMMAND, () => { projectExplorerDataProvider.refresh(); });
	commands.registerCommand(COMMANDS.ADD_COMMAND, () => {
		window.showQuickPick([
			{ label: 'New Project', description: 'Create new project' },
			{ label: 'API', description: 'Add new API' },
			{ label: 'Endpoint', description: 'Add new endpoint' },
			{ label: 'Sequence', description: 'Add new sequence' },
			{ label: 'Inbound Endpoint', description: 'Add new inbound endpoint' },
			{ label: 'Local Entry', description: 'Add new local entry'}
		], {
			placeHolder: 'Select the construct to add'
		}).then(selection => {
			if (selection?.label === 'API') {
				commands.executeCommand(COMMANDS.ADD_API_COMMAND);
			} else if (selection?.label === 'Endpoint') {
				commands.executeCommand(COMMANDS.ADD_ENDPOINT_COMMAND);
			} else if (selection?.label === 'Sequence') {
				commands.executeCommand(COMMANDS.ADD_SEQUENCE_COMMAND);
			} else if (selection?.label === 'Inbound Endpoint') {
				commands.executeCommand(COMMANDS.ADD_INBOUND_ENDPOINT_COMMAND);
			} else if (selection?.label === 'New Project') {
				commands.executeCommand(COMMANDS.CREATE_PROJECT_COMMAND);
			} else if (selection?.label === 'Local Entry') {
				commands.executeCommand(COMMANDS.ADD_LOCAL_ENTRY_COMMAND);
			}
		});

	});
	commands.registerCommand(COMMANDS.ADD_API_COMMAND, async (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.APIForm, documentUri:entry.info?.path });
		console.log('Add API');
	});

	commands.registerCommand(COMMANDS.ADD_ENDPOINT_COMMAND, () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.EndPointForm });
		console.log('Add Endpoint');
	});

	commands.registerCommand(COMMANDS.ADD_SEQUENCE_COMMAND, () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.SequenceForm });
		console.log('Add Sequence');
	});

	commands.registerCommand(COMMANDS.ADD_INBOUND_ENDPOINT_COMMAND, () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.InboundEPForm });
		console.log('Add Inbound API');
	});
    
	commands.registerCommand(COMMANDS.ADD_INBOUND_ENDPOINT_COMMAND, () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.InboundEPForm });
		console.log('Add Inbound API');
	});

	commands.registerCommand(COMMANDS.CREATE_PROJECT_COMMAND, () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ProjectCreationForm });
		console.log('Create New Project');
	});

	commands.registerCommand(COMMANDS.ADD_LOCAL_ENTRY_COMMAND, () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.LocalEntryForm });
		console.log('Add Local Entry');
	});

	commands.registerCommand(COMMANDS.REVEAL_ITEM_COMMAND, async (viewLocation: VisualizerLocation) => {
		const data = projectExplorerDataProvider.getChildren();

		if (viewLocation.documentUri && viewLocation.projectUri && data) {
			const project = (await data)?.find((project) => project.info?.path === viewLocation.projectUri);
			if (project) {
				projectTree.reveal(project, { select: true });
				const projectChildren = projectExplorerDataProvider.getChildren(project);
				if (projectChildren) {
					const projectResources = await projectChildren;
					if (!projectResources) return;

					for (const projectResource of projectResources) {
						const fileEntry = projectResource.children?.find((file) => file.info?.path === viewLocation.documentUri);
						if (fileEntry) {
							projectTree.reveal(fileEntry, { select: true });

							if (viewLocation.identifier !== undefined) {
								const resourceEntry = fileEntry.children?.find((file) => file.info?.path === `${viewLocation.documentUri}/${viewLocation.identifier}`);
								if (resourceEntry) {
									projectTree.reveal(resourceEntry, { select: true });
								}
							}
							break;
						}
					}
				}
			}
		}
	});

	// action items
	commands.registerCommand(COMMANDS.SHOW_DIAGRAM, (documentUri: Uri, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.Diagram, documentUri: documentUri.fsPath, identifier: resourceIndex });
	})
	commands.registerCommand(COMMANDS.SHOW_SOURCE, (e: any) => {
		const documentUri = StateMachine.context().documentUri;
		if (documentUri) {
			const openedEditor = window.visibleTextEditors.find(editor => editor.document.uri.fsPath === documentUri);
			if (openedEditor) {
				window.showTextDocument(openedEditor.document, { viewColumn: openedEditor.viewColumn });
			} else {
				commands.executeCommand('vscode.open', Uri.parse(documentUri), { viewColumn: ViewColumn.Beside });
			}
		}
	})
	commands.registerCommand(COMMANDS.OPEN_SERVICE_DESIGNER, async (entry: ProjectExplorerEntry) => {
		revealWebviewPanel(false);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ServiceDesigner, documentUri: entry.info?.path });
	});
	commands.registerCommand(COMMANDS.OPEN_SERVICE_DESIGNER_BESIDE, async (file: Uri) => {
		revealWebviewPanel(true);
		setTimeout(() => {
			openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ServiceDesigner, documentUri: file.fsPath });
		}, 100);
	});

	commands.executeCommand(COMMANDS.FOCUS_PROJECT_EXPLORER);
}

function revealWebviewPanel(beside: boolean = true) {
	if (!VisualizerWebview.currentPanel) {
		VisualizerWebview.currentPanel = new VisualizerWebview(true);
		VisualizerWebview.currentPanel?.getWebview()?.reveal(beside ? ViewColumn.Beside : ViewColumn.One);
	} else {
		VisualizerWebview.currentPanel?.getWebview()?.reveal(beside ? ViewColumn.Beside : ViewColumn.Active);
	}
}

