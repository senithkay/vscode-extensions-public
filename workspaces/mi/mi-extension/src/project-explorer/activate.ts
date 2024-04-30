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
import { ExtensionContext, Uri, ViewColumn, commands, window, workspace } from 'vscode';
import { VisualizerWebview } from '../visualizer/webview';
import path = require("path");
import { deleteRegistryResource } from '../util/fileOperations';
import { RpcClient } from '@wso2-enterprise/mi-rpc-client';
import { extension } from '../MIExtensionContext';

export function activateProjectExplorer(context: ExtensionContext) {

	const projectExplorerDataProvider = new ProjectExplorerEntryProvider(context);
	const projectTree = window.createTreeView('MI.project-explorer', { treeDataProvider: projectExplorerDataProvider });
	commands.registerCommand(COMMANDS.REFRESH_COMMAND, () => { return projectExplorerDataProvider.refresh(); });
	commands.registerCommand(COMMANDS.ADD_COMMAND, () => {
		window.showQuickPick([
			{ label: 'New Project', description: 'Create new project' },
			{ label: 'API', description: 'Add new API' },
			{ label: 'Endpoint', description: 'Add new endpoint' },
			{ label: 'Sequence', description: 'Add new sequence' },
			{ label: 'Inbound Endpoint', description: 'Add new inbound endpoint' },
			{ label: 'Local Entry', description: 'Add new local entry' },
			{ label: 'Message Store', description: 'Add new message store' },
			{ label: 'Message Processor', description: 'Add new message processor' },
			{ label: 'Task', description: 'Add new task' },
			{ label: 'Proxy Service', description: 'Add new proxy service' },
			{ label: 'Template', description: 'Add new template' },
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
			} else if (selection?.label === 'Message Processor') {
				commands.executeCommand(COMMANDS.ADD_MESSAGE_PROCESSOR_COMMAND);
			} else if (selection?.label === 'Task') {
				commands.executeCommand(COMMANDS.ADD_TASK_COMMAND);
			} else if (selection?.label === 'Proxy Service') {
				commands.executeCommand(COMMANDS.ADD_PROXY_SERVICE_COMMAND);
			} else if (selection?.label === 'Template') {
				commands.executeCommand(COMMANDS.ADD_TEMPLATE_COMMAND);
			} else if (selection?.label === 'New Project') {
				commands.executeCommand(COMMANDS.CREATE_PROJECT_COMMAND);
			} else if (selection?.label === 'Local Entry') {
				commands.executeCommand(COMMANDS.ADD_LOCAL_ENTRY_COMMAND);
			} else if (selection?.label === 'Message Store') {
				commands.executeCommand(COMMANDS.ADD_MESSAGE_STORE_COMMAND);
			}
		});

	});
	commands.registerCommand(COMMANDS.ADD_API_COMMAND, async (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.APIForm, documentUri: entry.info?.path });
		console.log('Add API');
	});

	commands.registerCommand(COMMANDS.ADD_ENDPOINT_COMMAND, (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.EndPointForm, documentUri: entry.info?.path });
		console.log('Add Endpoint');
	});

	commands.registerCommand(COMMANDS.ADD_SEQUENCE_COMMAND, (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.SequenceForm, documentUri: entry.info?.path });
		console.log('Add Sequence');
	});

	commands.registerCommand(COMMANDS.ADD_INBOUND_ENDPOINT_COMMAND, (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.InboundEPForm, documentUri: entry.info?.path });
		console.log('Add Inbound API');
	});

	commands.registerCommand(COMMANDS.ADD_REGISTERY_RESOURCE_COMMAND, async (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.RegistryResourceForm, documentUri: entry.info?.path });
		console.log('Add Registry Resource');
	});

	commands.registerCommand(COMMANDS.ADD_CLASS_MEDIATOR_COMMAND, async (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ClassMediatorForm, documentUri: entry.info?.path });
		console.log('Add Class Mediator');
	});

	commands.registerCommand(COMMANDS.ADD_MESSAGE_PROCESSOR_COMMAND, (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.MessageProcessorForm, documentUri: entry.info?.path });
		console.log('Add Message Processor');
	});

	commands.registerCommand(COMMANDS.ADD_PROXY_SERVICE_COMMAND, (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ProxyServiceForm, documentUri: entry.info?.path });
		console.log('Add Proxy Service');
	});

	commands.registerCommand(COMMANDS.ADD_TASK_COMMAND, (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.TaskForm, documentUri: entry.info?.path });
	});

	commands.registerCommand(COMMANDS.EDIT_REGISTERY_RESOURCE_COMMAND, async (entry: string) => {
		workspace.openTextDocument(entry).then((doc) => {
			window.showTextDocument(doc, { preview: false });
		});
	});

	commands.registerCommand(COMMANDS.EDIT_CLASS_MEDIATOR_COMMAND, async (entry: string) => {
		workspace.openTextDocument(entry).then((doc) => {
			window.showTextDocument(doc, { preview: false });
		});
		commands.executeCommand('workbench.files.action.focusFilesExplorer');
	});

	commands.registerCommand(COMMANDS.DELETE_REGISTERY_RESOURCE_COMMAND, async (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.Overview });
		if (entry.info && entry.info?.path) {
			const filePath = entry.info.path;
			const fileName = path.basename(filePath);
			window.showInformationMessage("Do you want to delete : " + fileName, { modal: true }, "Yes", "No")
				.then(async answer => {
					if (answer === "Yes") {
						const res = await deleteRegistryResource(filePath);
						if (res.status === true) {
							window.showInformationMessage(res.info);
							projectExplorerDataProvider.refresh();
						} else {
							window.showErrorMessage(res.info);
						}
					}
				});
		}
	});

	commands.registerCommand(COMMANDS.ADD_MESSAGE_STORE_COMMAND, (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.MessageStoreForm, documentUri: entry.info?.path });
		console.log('Add Message Store');
	});

	commands.registerCommand(COMMANDS.ADD_TEMPLATE_COMMAND, (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.TemplateForm, documentUri: entry.info?.path });
		console.log('Add Template');
	});

	commands.registerCommand(COMMANDS.IMPORT_PROJECT_COMMAND, () => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ImportProjectForm });
		console.log('Import a Project');
	});

	commands.registerCommand(COMMANDS.ADD_LOCAL_ENTRY_COMMAND, (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.LocalEntryForm, documentUri: entry.info?.path });
		console.log('Add Local Entry');
	});

	commands.registerCommand(COMMANDS.ADD_DATA_SOURCE_COMMAND, (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.DataSourceForm, documentUri: entry.info?.path });
		console.log('Add Data Source');
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
						const fileEntry = projectResource.children?.find((file) => file !== undefined && file.info?.path === viewLocation.documentUri);
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
	commands.registerCommand(COMMANDS.SHOW_RESOURCE_VIEW, (documentUri: Uri, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ResourceView, documentUri: documentUri?.fsPath, identifier: resourceIndex });
	});
	commands.registerCommand(COMMANDS.SHOW_SEQUENCE_VIEW, (documentUri: Uri, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.SequenceView, documentUri: documentUri?.fsPath });
	});
	commands.registerCommand(COMMANDS.SHOW_PROXY_VIEW, (documentUri: Uri, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ProxyView, documentUri: documentUri?.fsPath });
	});
	commands.registerCommand(COMMANDS.SHOW_MESSAGE_STORE, (documentUri: Uri, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.MessageStoreForm, documentUri: documentUri?.fsPath });

	})
	commands.registerCommand(COMMANDS.SHOW_LOCAL_ENTRY, (documentUri: Uri, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.LocalEntryForm, documentUri: documentUri?.fsPath });
	});
	commands.registerCommand(COMMANDS.SHOW_CONNECTION, async (documentUri: Uri, beside: boolean = true) => {
		revealWebviewPanel(beside);
		if (documentUri) {
			let doc = await workspace.openTextDocument(documentUri);
			let viewColumn = window.activeTextEditor ? ViewColumn.Beside : ViewColumn.Active;
			await window.showTextDocument(doc, { viewColumn: viewColumn });
		}
	});
	commands.registerCommand(COMMANDS.SHOW_DATA_SOURCE, (documentUri: Uri, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.DataSourceForm, documentUri: documentUri?.fsPath });
	});
	commands.registerCommand(COMMANDS.SHOW_TASK, (documentUri: Uri, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.TaskForm, documentUri: documentUri?.fsPath, identifier: resourceIndex });
	});
	commands.registerCommand(COMMANDS.SHOW_INBOUND_ENDPOINT, (documentUri: Uri, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.InboundEPForm, documentUri: documentUri?.fsPath, identifier: resourceIndex });
	});
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
	});
	commands.registerCommand(COMMANDS.SHOW_MESSAGE_PROCESSOR, (documentUri: Uri, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.MessageProcessorForm, documentUri: documentUri?.fsPath });
	});
	commands.registerCommand(COMMANDS.SHOW_XML, (documentUri: Uri, resourceIndex: string, beside: boolean = true) => {
		const uri = Uri.file(documentUri?.fsPath);
		workspace.openTextDocument(uri).then((document) => {
			window.showTextDocument(document);
		});
	});
	commands.registerCommand(COMMANDS.SHOW_TEMPLATE, (documentUri: Uri, type: string, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.TemplateForm, documentUri: documentUri?.fsPath });
	});
	commands.registerCommand(COMMANDS.SHOW_ENDPOINT, (documentUri: Uri, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.EndPointForm, documentUri: documentUri?.fsPath });
	});
	commands.registerCommand(COMMANDS.SHOW_DEFAULT_ENDPOINT, (documentUri: Uri, type: string, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.DefaultEndpointForm, documentUri: documentUri?.fsPath, customProps: { type: type } });
	});
	commands.registerCommand(COMMANDS.SHOW_ADDRESS_ENDPOINT, (documentUri: Uri, type: string, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.AddressEndpointForm, documentUri: documentUri?.fsPath, customProps: { type: type } });
	});
	commands.registerCommand(COMMANDS.SHOW_HTTP_ENDPOINT, (documentUri: Uri, type: string, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.HttpEndpointForm, documentUri: documentUri?.fsPath, customProps: { type: type } });
	});
	commands.registerCommand(COMMANDS.SHOW_WSDL_ENDPOINT, (documentUri: Uri, type: string, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.WsdlEndpointForm, documentUri: documentUri?.fsPath, customProps: { type: type } });
	});
	commands.registerCommand(COMMANDS.SHOW_LOAD_BALANCE_ENDPOINT, (documentUri: Uri, type: string, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.LoadBalanceEndPointForm, documentUri: documentUri?.fsPath });
	});
	commands.registerCommand(COMMANDS.SHOW_FAILOVER_ENDPOINT, (documentUri: Uri, type: string, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.FailoverEndPointForm, documentUri: documentUri?.fsPath });
	});
	commands.registerCommand(COMMANDS.SHOW_RECIPIENT_ENDPOINT, (documentUri: Uri, type: string, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.RecipientEndPointForm, documentUri: documentUri?.fsPath });
	});
	commands.registerCommand(COMMANDS.SHOW_TEMPLATE_ENDPOINT, (documentUri: Uri, type: string, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.TemplateEndPointForm, documentUri: documentUri?.fsPath });
	});
	commands.registerCommand(COMMANDS.OPEN_PROJECT_OVERVIEW, async (entry: ProjectExplorerEntry) => {
		revealWebviewPanel(false);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.Overview });
	});
	commands.registerCommand(COMMANDS.OPEN_SERVICE_DESIGNER, async (entry: ProjectExplorerEntry) => {
		revealWebviewPanel(false);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ServiceDesigner, documentUri: entry.info?.path });
	});
}

function revealWebviewPanel(beside: boolean = true) {
	extension.webviewReveal = beside;
}

