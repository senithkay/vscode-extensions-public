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
import { ExtensionContext, TreeItem, Uri, ViewColumn, commands, window, workspace } from 'vscode';
import path = require("path");
import { deleteRegistryResource } from '../util/fileOperations';
import { extension } from '../MIExtensionContext';
import { ExtendedLanguageClient } from '../lang-client/ExtendedLanguageClient';
import { APIResource } from '../../../syntax-tree/lib/src';
import { MiDiagramRpcManager } from '../rpc-managers/mi-diagram/rpc-manager';
import { RegistryExplorerEntryProvider } from './registry-explorer-provider';

export async function activateProjectExplorer(context: ExtensionContext, lsClient: ExtendedLanguageClient) {

	const projectExplorerDataProvider = new ProjectExplorerEntryProvider(context);
	await projectExplorerDataProvider.refresh(lsClient);
	const projectTree = window.createTreeView('MI.project-explorer', { treeDataProvider: projectExplorerDataProvider });

	const registryExplorerDataProvider = new RegistryExplorerEntryProvider(context);
	await registryExplorerDataProvider.refresh(lsClient);
	const registryTree = window.createTreeView('MI.registry-explorer', { treeDataProvider: registryExplorerDataProvider });

	commands.registerCommand(COMMANDS.REFRESH_COMMAND, () => { return projectExplorerDataProvider.refresh(lsClient); });
	commands.registerCommand(COMMANDS.ADD_COMMAND, () => {
		window.showQuickPick([
			{ label: 'New Project', description: 'Create new project' }
		], {
			placeHolder: 'Select the construct to add'
		}).then(selection => {
			if (selection?.label === 'New Project') {
				commands.executeCommand(COMMANDS.CREATE_PROJECT_COMMAND);
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

	commands.registerCommand(COMMANDS.ADD_DATA_SERVICE_COMMAND, (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.DataServiceForm, documentUri: entry.info?.path });
		console.log('Add Data Service');
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

	commands.registerCommand(COMMANDS.EDIT_REGISTRY_RESOURCE_METADATA_COMMAND, async (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.RegistryMetadataForm, documentUri: entry.info?.path });
	});

	commands.registerCommand(COMMANDS.EDIT_CLASS_MEDIATOR_COMMAND, async (entry: string) => {
		workspace.openTextDocument(entry).then((doc) => {
			window.showTextDocument(doc, { preview: false });
		});
		commands.executeCommand('workbench.files.action.focusFilesExplorer');
	});

	commands.registerCommand(COMMANDS.SHOW_DATA_MAPPER, async (entry: string) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.DataMapperView, documentUri: entry });
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

	commands.registerCommand(COMMANDS.ADD_CONNECTION_COMMAND, (entry: ProjectExplorerEntry) => {
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ConnectorStore, documentUri: entry.info?.path });
		console.log('Add Connection');
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
	commands.registerCommand(COMMANDS.SHOW_SEQUENCE_TEMPLATE_VIEW, (documentUri: Uri, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.SequenceTemplateView, documentUri: documentUri?.fsPath });
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
	commands.registerCommand(COMMANDS.SHOW_CONNECTION, async (documentUri: Uri, connectionName: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, {
			view: MACHINE_VIEW.ConnectionForm, documentUri: documentUri?.fsPath,
			customProps: { connectionName: connectionName }
		});
	});
	commands.registerCommand(COMMANDS.SHOW_DATA_SOURCE, (documentUri: Uri, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.DataSourceForm, documentUri: documentUri?.fsPath });
	});
	commands.registerCommand(COMMANDS.SHOW_TASK, (documentUri: Uri, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.TaskForm, documentUri: documentUri?.fsPath, identifier: resourceIndex });
	});
	commands.registerCommand(COMMANDS.SHOW_TASK_VIEW, (documentUri: Uri, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.TaskView, documentUri: documentUri?.fsPath, identifier: resourceIndex });
	});
	commands.registerCommand(COMMANDS.SHOW_INBOUND_ENDPOINT, (documentUri: Uri, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		const uri = Uri.file(documentUri?.fsPath);
		workspace.openTextDocument(uri).then((document) => {
			window.showTextDocument(document);
		});
	});
	commands.registerCommand(COMMANDS.SHOW_SOURCE, (e: any) => {
		const documentUri = StateMachine.context().documentUri;
		if (documentUri) {
			const openedEditor = window.visibleTextEditors.find(editor => editor.document.uri.fsPath === documentUri);
			if (openedEditor) {
				window.showTextDocument(openedEditor.document, { viewColumn: openedEditor.viewColumn });
			} else {
				commands.executeCommand('vscode.open', Uri.file(documentUri), { viewColumn: ViewColumn.Beside });
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
	commands.registerCommand(COMMANDS.SHOW_DATA_SERVICE, (documentUri: Uri, resourceIndex: string, beside: boolean = true) => {
		revealWebviewPanel(beside);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.DataServiceForm, documentUri: documentUri?.fsPath });
	});
	commands.registerCommand(COMMANDS.OPEN_PROJECT_OVERVIEW, async (entry: ProjectExplorerEntry) => {
		revealWebviewPanel(false);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.Overview });
	});
	commands.registerCommand(COMMANDS.OPEN_SERVICE_DESIGNER, async (entry: ProjectExplorerEntry) => {
		revealWebviewPanel(false);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ServiceDesigner, documentUri: entry.info?.path });
	});
	commands.registerCommand(COMMANDS.OPEN_DSS_SERVICE_DESIGNER, async (entry: ProjectExplorerEntry) => {
		revealWebviewPanel(false);
		openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.DSSServiceDesigner, documentUri: entry.info?.path });
	});

	// delete
	commands.registerCommand(COMMANDS.DELETE_PROJECT_EXPLORER_ITEM, async (item: TreeItem) => {
		switch (item.contextValue) {
			case 'api':
			case 'endpoint':
			case 'sequence':
			case 'proxy-service':
			case 'inboundEndpoint':
			case 'messageStore':
			case 'message-processor':
			case 'task':
			case 'localEntry':
			case 'template':
			case 'dataSource':
			case 'dataService':
				{
					const fileUri = item.command?.arguments?.[0] || (item as any)?.info?.path;
					if (!fileUri) {
						window.showErrorMessage('Resource not found.');
						return;
					}
					const confirmation = await window.showWarningMessage(
						`Are you sure you want to delete ${item.contextValue} - ${item.label}?`,
						{ modal: true },
						'Yes'
					);

					if (confirmation === 'Yes') {
						try {
							await workspace.fs.delete(Uri.parse(fileUri), { recursive: true, useTrash: true });
							window.showInformationMessage(`${item.label} has been deleted.`);
						} catch (error) {
							window.showErrorMessage(`Failed to delete ${item.label}: ${error}`);
						}
					}
					break;
				}
			case 'data-mapper':
				{
					const fileUri = item.command?.arguments?.[0];
					if (!fileUri) {
						window.showErrorMessage('Resource not found.');
						return;
					}
					const confirmation = await window.showWarningMessage(
						`Are you sure you want to delete Datamapper ${item.label} and its related contents?`,
						{ modal: true },
						'Yes'
					);

					if (confirmation === 'Yes') {
						try {
							// delete the file and the residing folder
							const folderPath = path.dirname(fileUri);
							await workspace.fs.delete(Uri.parse(folderPath), { recursive: true, useTrash: true });
							window.showInformationMessage(`${item.label} has been deleted.`);
						} catch (error) {
							window.showErrorMessage(`Failed to delete ${item.label}: ${error}`);
						}
					}
					break;
				}
			case 'resource':
				{
					const resourceId = item.command?.arguments?.[1];
					if (resourceId === undefined) {
						window.showErrorMessage('Resource ID not found.');
						return;
					}
					const langClient = StateMachine.context().langClient;
					const fileUri = item.command?.arguments?.[0];
					if (!langClient) {
						window.showErrorMessage('Language client not found.');
						return;
					}
					if (!fileUri) {
						window.showErrorMessage('Resource not found.');
						return;
					}
					const syntaxTree = await langClient.getSyntaxTree({ documentIdentifier: { uri: fileUri.fsPath } });
					const resource: APIResource = syntaxTree?.syntaxTree?.api?.resource[resourceId];

					if (!resource) {
						window.showErrorMessage(`Resource ${resourceId} not found.`);
					}
					const name = resource.uriTemplate || resource.urlMapping || "resource";
					const range = resource.range;
					const confirmation = await window.showWarningMessage(
						`Are you sure you want to delete resource - ${name}?`,
						{ modal: true },
						'Yes'
					);

					if (confirmation === 'Yes') {
						try {
							const rpcManager = new MiDiagramRpcManager()
							await rpcManager.applyEdit({
								text: "",
								documentUri: fileUri.fsPath,
								range: {
									start: range.startTagRange.start,
									end: range.endTagRange.end,
								},
							});
							window.showInformationMessage(`Resource ${name} has been deleted.`);
						} catch (error) {
							window.showErrorMessage(`Failed to delete resource ${name}: ${error}`);
						}
					}

					break;
				}
			case 'registry-with-metadata':
			case 'registry-without-metadata': {
				let filePath = "";
				if (item instanceof ProjectExplorerEntry) {
					if (item.info && item.info?.path) {
						filePath = item.info.path;
					}
				} else if (item.id) {
					filePath = item.id;
				}
				if (filePath !== "") {
					const fileName = path.basename(filePath);
					window.showInformationMessage("Do you want to delete : " + fileName, { modal: true }, "Yes", "No")
						.then(async answer => {
							if (answer === "Yes") {
								const res = await deleteRegistryResource(filePath);
								if (res.status === true) {
									window.showInformationMessage(res.info);
									projectExplorerDataProvider.refresh(lsClient);
								} else {
									window.showErrorMessage(res.info);
								}
							}
						});
				}
				break;
			}
		}
		projectExplorerDataProvider.refresh(lsClient);
	});
}

function revealWebviewPanel(beside: boolean = true) {
	extension.webviewReveal = beside;
}

