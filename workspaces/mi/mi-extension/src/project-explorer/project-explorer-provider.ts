/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { MILanguageClient } from '../lang-client/activator';
import { ProjectStructureResponse, ProjectStructureEntry, RegistryResourcesFolder, RegistryArtifact, ListRegistryArtifactsResponse, getInboundEndpoint, getMessageProcessor, DataIntegrationResponse, CommonArtifactsResponse, AdvancedArtifactsResponse } from '@wso2-enterprise/mi-core';
import { COMMANDS, EndpointTypes, InboundEndpointTypes, MessageProcessorTypes, MessageStoreTypes, TemplateTypes } from '../constants';
import { window } from 'vscode';
import path = require('path');
import { findJavaFiles, getAvailableRegistryResources } from '../util/fileOperations';
import { ExtendedLanguageClient } from '../lang-client/ExtendedLanguageClient';

let resourceDetails: ListRegistryArtifactsResponse;
let extensionContext: vscode.ExtensionContext;
export class ProjectExplorerEntry extends vscode.TreeItem {
	children: ProjectExplorerEntry[] | undefined;
	info: ProjectStructureEntry | undefined;

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		info: ProjectStructureEntry | undefined = undefined,
		icon?: string,
		isCodicon: boolean = false
	) {
		super(label, collapsibleState);
		this.tooltip = `${this.label}`;
		this.info = info;
		if (icon && isCodicon) {
			this.iconPath = new vscode.ThemeIcon(icon);
		} else if (icon) {
			this.iconPath = {
				light: path.join(extensionContext.extensionPath, 'assets', `light-${icon}.svg`),
				dark: path.join(extensionContext.extensionPath, 'assets', `dark-${icon}.svg`)
			};
		}
	}
}

export class ProjectExplorerEntryProvider implements vscode.TreeDataProvider<ProjectExplorerEntry> {
	private _data: ProjectExplorerEntry[];
	private _onDidChangeTreeData: vscode.EventEmitter<ProjectExplorerEntry | undefined | null | void>
		= new vscode.EventEmitter<ProjectExplorerEntry | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<ProjectExplorerEntry | undefined | null | void>
		= this._onDidChangeTreeData.event;

	refresh(langClient: ExtendedLanguageClient) {
		return window.withProgress({
			location: { viewId: 'MI.project-explorer' },
			title: 'Loading project structure'
		}, async () => {
			try {
				this._data = await getProjectStructureData(langClient);
				this._onDidChangeTreeData.fire();
			} catch (err) {
				console.error(err);
				this._data = [];
			}
		});
	}

	constructor(private context: vscode.ExtensionContext) {
		this._data = [];
		extensionContext = context;
	}

	getTreeItem(element: ProjectExplorerEntry): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: ProjectExplorerEntry | undefined): vscode.ProviderResult<ProjectExplorerEntry[]> {
		if (element === undefined) {
			return this._data;
		}
		return element.children;
	}

	getParent(element: ProjectExplorerEntry): vscode.ProviderResult<ProjectExplorerEntry> {
		if (element.info?.path === undefined) return undefined;

		const projects = (this._data);
		for (const project of projects) {
			if (project.children?.find(child => child.info?.path === element.info?.path)) {
				return project;
			}
			const fileElement = this.recursiveSearchParent(project, element.info?.path);
			if (fileElement) {
				return fileElement;
			}
		}
		return element;
	}

	recursiveSearchParent(element: ProjectExplorerEntry, path: string): ProjectExplorerEntry | undefined {
		if (!element.children) {
			return undefined;
		}
		for (const child of element.children) {
			if (child.info?.path === path) {
				return element;
			}
			const foundParent = this.recursiveSearchParent(child, path);
			if (foundParent) {
				return foundParent;
			}
		}
		return undefined;
	}
}

async function getProjectStructureData(langClient: ExtendedLanguageClient): Promise<ProjectExplorerEntry[]> {
	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		const data: ProjectExplorerEntry[] = [];
		if (!!langClient) {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			for (const workspace of workspaceFolders) {
				const rootPath = workspace.uri.fsPath;

				const resp = await langClient.getProjectExplorerModel(rootPath);
				resourceDetails = getAvailableRegistryResources(rootPath);
				const projectTree = generateTreeData(workspace, resp);
				if (projectTree) {
					data.push(projectTree);
				}
			};
		}
		if (data.length > 0) {
			vscode.commands.executeCommand('setContext', 'projectOpened', true);
			return data;
		} else {
			vscode.commands.executeCommand('setContext', 'projectOpened', false);
		}
	}
	vscode.commands.executeCommand('setContext', 'projectOpened', false);
	return [];

}

function generateTreeData(project: vscode.WorkspaceFolder, data: ProjectStructureResponse): ProjectExplorerEntry | undefined {
	const directoryMap = data.directoryMap;
	if (directoryMap) {
		const projectRoot = new ProjectExplorerEntry(
			`Project ${project.name}`,
			vscode.TreeItemCollapsibleState.Expanded,
			{ name: project.name, path: project.uri.fsPath, type: 'project' },
			'project'
		);

		projectRoot.contextValue = 'project';
		generateTreeDataOfArtifacts(project, data, projectRoot);
		return projectRoot;
	}
}

function generateTreeDataOfDataMappings(data: ProjectStructureResponse) {
	const result: ProjectExplorerEntry[] = [];
	const directoryMap = data.directoryMap;
	const resources = (directoryMap as any)?.src?.main?.wso2mi.resources.registry;
	const govResources = resources['gov'];
	if (govResources && govResources.folders.length > 0) {
		const dataMapperResources = govResources.folders.find((folder: any) => folder.name === 'datamapper');
		if (dataMapperResources) {
			for (const folder of dataMapperResources.folders) {
				for (const file of folder.files) {
					if (!file.name.endsWith('.ts') || file.name.substring(0, file.name.length - 3) !== folder.name) {
						continue;
					}
					const configName = file.name.replace('.ts', '');
					const dataMapperEntry = new ProjectExplorerEntry(
						configName,
						isCollapsibleState(false),
						{ name: configName, path: file.path, type: 'dataMapper' },
						'dataMapper'
					);
					dataMapperEntry.contextValue = 'data-mapper';
					dataMapperEntry.command = {
						"title": "Open Data Mapper",
						"command": COMMANDS.SHOW_DATA_MAPPER,
						"arguments": [file.path]
					};
					result.push(dataMapperEntry);
				}
			}
		}
	}
	return result;
}

function generateTreeDataOfArtifacts(project: vscode.WorkspaceFolder, data: ProjectStructureResponse, projectRoot: ProjectExplorerEntry) {
	const directoryMap = data.directoryMap;
	const topLevelEntries = (directoryMap as any)?.src?.main?.wso2mi?.artifacts;
	if (topLevelEntries) {
		for (const key in topLevelEntries) {

			let icon = 'folder';
			let label = key;
			let folderName = '';
			let contextValue = key;

			switch (key) {
				case 'APIs':
					icon = 'APIResource';
					label = 'APIs';
					folderName = 'artifacts/apis';
					contextValue = 'apis';
					break;
				case 'Triggers':
					icon = 'inbound-endpoint';
					label = 'Triggers';
					folderName = 'artifacts/inbound-endpoints';
					contextValue = 'inboundEndpoints'
					break;
				case 'Scheduled Tasks':
					icon = 'task';
					label = 'Scheduled Tasks';
					folderName = 'artifacts/tasks';
					contextValue = 'tasks';
					break;
				case 'Common Artifacts':
					icon = 'endpoint';
					label = 'Common Artifacts';
					break;
				case 'Data Integration':
					icon = 'Data Sources';
					label = 'Data Integration';
					break;
				case 'Advanced Artifacts':
					icon = 'endpoint';
					label = 'Advanced Artifacts';
					break;
				case 'Resources':
					icon = 'folder';
					label = 'Resources';
					folderName = 'resources';
					contextValue = 'resources';
					break;
				default:
			}
			// TODO: Will introduce back when both data services and data sources are supported
			// if (key === 'dataServices' || key === 'dataSources') {
			// 	continue;
			// }

			topLevelEntries[key].path = path.join(project.uri.fsPath, 'src', 'main', 'wso2mi', ...folderName.split("/"));

			const parentEntry = new ProjectExplorerEntry(
				label,
				isCollapsibleState(topLevelEntries[key].length > 0 || ['Data Integration', 'Common Artifacts', 'Advanced Artifacts', 'Resources'].includes(key)),
				topLevelEntries[key]
			);

			let children;
			if (key === "APIs" || key === "Triggers" || key === "Scheduled Tasks") {
				children = genProjectStructureEntry(topLevelEntries[key]);
			} else if (key === "Resources") {
				children = genResourceProjectStructureEntry(topLevelEntries[key]);
			} else {
				children = generateArtifacts(topLevelEntries[key], data, project);
			}

			parentEntry.children = children;
			parentEntry.contextValue = contextValue;
			parentEntry.id = `${project.name}/${contextValue}`;

			projectRoot.children = projectRoot.children ?? [];
			projectRoot.children.push(parentEntry);
		}
	}
}

function genResourceProjectStructureEntry(data: RegistryResourcesFolder): ProjectExplorerEntry[] {
	const result: ProjectExplorerEntry[] = [];
	const resPathPrefix = path.join("wso2mi", "resources");
	if (data) {
		if (data.files) {
			for (const entry of data.files) {
				const explorerEntry = new ProjectExplorerEntry(entry.name, isCollapsibleState(false), {
					name: entry.name,
					type: 'resource',
					path: `${entry.path}`
				}, 'code', true);
				explorerEntry.id = entry.path;
				explorerEntry.command = {
					"title": "Edit Resource",
					"command": COMMANDS.EDIT_REGISTERY_RESOURCE_COMMAND,
					"arguments": [vscode.Uri.file(entry.path)]
				};
				result.push(explorerEntry);
				const lastIndex = entry.path.indexOf(resPathPrefix) !== -1 ? entry.path.indexOf(resPathPrefix) + resPathPrefix.length : 0;
				const resourcePath = entry.path.substring(lastIndex);
				if (checkExistenceOfResource(resourcePath)) {
					explorerEntry.contextValue = "registry-with-metadata";
				} else {
				explorerEntry.contextValue = "registry-without-metadata";
                }
			}
		}
		if (data.folders) {
			for (const entry of data.folders) {
				if (entry.name !== ".meta") {
					const explorerEntry = new ProjectExplorerEntry(entry.name,
						isCollapsibleState(entry.files.length > 0 || entry.folders.length > 0),
						{
							name: entry.name,
							type: 'resource',
							path: `${entry.path}`
						}, 'folder', true);
					explorerEntry.children = genResourceProjectStructureEntry(entry);
					result.push(explorerEntry);
					const lastIndex = entry.path.indexOf(resPathPrefix) !== -1 ? entry.path.indexOf(resPathPrefix) + resPathPrefix.length : 0;
					const resourcePath = entry.path.substring(lastIndex);
					if (checkExistenceOfResource(resourcePath)) {
						explorerEntry.contextValue = "registry-with-metadata";
					} else {
					explorerEntry.contextValue = "registry-without-metadata";
                    }
				}
			}
		}
	}
	return result;
}

function checkExistenceOfResource(resourcePath: string): boolean {
	if (resourceDetails.artifacts) {
		for (const artifact of resourceDetails.artifacts) {
			let transformedPath = artifact.path.replace("/_system/governance/mi-resources", '/resources');
			if (!artifact.isCollection) {
				transformedPath = transformedPath.endsWith('/') ? transformedPath + artifact.file : transformedPath + "/" + artifact.file;
			}
			if (transformedPath === resourcePath) {
				return true;
			}
		}
		return false;
	}
	return false;
}

function generateArtifacts(
	data: DataIntegrationResponse | CommonArtifactsResponse | AdvancedArtifactsResponse,
	projectStructure: ProjectStructureResponse,
	project: vscode.WorkspaceFolder
): ProjectExplorerEntry[] {
	const result: ProjectExplorerEntry[] = [];
	for (const key in data) {
		if (key === 'path') continue;
		let icon = 'folder';
		let label = key;
		let folderName = key;
		let contextValue = key
		let parentEntry: ProjectExplorerEntry | undefined;

		switch (key) {
			case 'apis':
				icon = 'APIResource';
				label = 'APIs';
				break;
			case 'Endpoints':
				icon = 'endpoint';
				label = 'Endpoints';
				folderName = 'endpoints';
				contextValue = 'endpoints';
				break;
			case 'Local Entries':
				icon = 'local-entry';
				label = 'Local Entries';
				folderName = 'local-entries';
				contextValue = 'localEntries';
				break;
			case 'Connections':
				icon = 'vm-connect';
				label = 'Connections';
				folderName = 'connections';
				contextValue = 'connections';
				break;
			case 'Message Stores':
				icon = 'message-store';
				label = 'Message Stores';
				folderName = 'message-stores';
				contextValue = 'messageStores';
				break;
			case 'Message Processors':
				icon = 'message-processor';
				label = 'Message Processors';
				folderName = 'message-processors';
				contextValue = 'messageProcessors';
				break;
			case 'Proxy Services':
				icon = 'arrow-swap';
				label = 'Proxy Services';
				folderName = 'proxy-services';
				contextValue = 'proxyServices';
				break;
			case 'Sequences':
				icon = 'Sequence';
				label = 'Sequences';
				folderName = 'sequences';
				contextValue = 'sequences';
				break;
			case 'Templates':
				icon = 'template';
				label = 'Templates';
				folderName = 'templates';
				contextValue = 'templates';
				break;
			case 'Data Services':
				icon = 'data-service';
				label = 'Data Services';
				folderName = 'data-services';
				contextValue = 'dataServices';
				break;
			case 'Data Sources':
				icon = 'data-source';
				label = 'Data Sources';
				folderName = 'data-sources';
				contextValue = 'dataSources';
				break;
			case 'Class Mediators':
				icon = 'class';
				label = 'Class Mediators'
				contextValue = 'class-mediator'

				const javaPath = path.join(project.uri.fsPath, 'src', 'main', 'java');
				const mediators = findJavaFiles(javaPath);
				parentEntry = new ProjectExplorerEntry(
					'Class Mediators',
					isCollapsibleState(mediators.size > 0),
					{ name: 'java', path: javaPath, type: 'java' },
				);

				parentEntry.id = 'class-mediator';

				const children = generateTreeDataOfClassMediator(project, projectStructure);
				parentEntry.children = children;
				parentEntry.contextValue = contextValue;
				break;
			case 'Data Mappers':
				const directoryMap = projectStructure.directoryMap;
				const resources = (directoryMap as any)?.src?.main?.wso2mi.resources.newResources;

				const dataMapperResources = resources.folders.find((folder: any) => folder.name === 'datamappers');

				const datamapperResourcePath = path.join(resources.path, 'datamappers');
				parentEntry = new ProjectExplorerEntry(
					'Data Mappers',
					isCollapsibleState(dataMapperResources?.folders?.length > 0),
					{ name: 'datamapper', path: datamapperResourcePath, type: 'datamapper' }
				);
				parentEntry.contextValue = 'data-mappers';
				parentEntry.id = 'data-mapper';
				parentEntry.contextValue = contextValue;
				
				if (resources && resources.folders.length > 0) {
					const dataMapperResources = resources.folders.find((folder: any) => folder.name === 'datamappers');
					if (dataMapperResources) {
						const children = generateTreeDataOfDataMappings(projectStructure);
						parentEntry.children = children;
					}
				}
				break;
			default:
		}

		data[key].path = path.join(project.uri.fsPath, 'src', 'main', 'wso2mi', 'artifacts', folderName);

		if (!parentEntry) {
			parentEntry = new ProjectExplorerEntry(
				label,
				isCollapsibleState(data[key].length > 0),
				data[key]
			);

			const children = genProjectStructureEntry(data[key]);
			parentEntry.children = children;
			parentEntry.contextValue = contextValue;
		}
		result.push(parentEntry);
	}

	return result;
}

function generateTreeDataOfClassMediator(project: vscode.WorkspaceFolder, data: ProjectStructureResponse): ProjectExplorerEntry[] {
	const directoryMap = data.directoryMap;
	const main = (directoryMap as any)?.src?.main;
	const result: ProjectExplorerEntry[] = [];
	if (main && main['java']) {
		const javaPath = path.join(project.uri.fsPath, 'src', 'main', 'java');
		const mediators = findJavaFiles(javaPath);
		for (var entry of mediators.entries()) {
			const filePath = entry[0];
			const packageName = entry[1];
			const fileName = path.basename(filePath);
			const resourceEntry = new ProjectExplorerEntry(fileName + " (" + packageName + ")", isCollapsibleState(false), {
				name: fileName,
				type: 'resource',
				path: filePath
			}, 'class-icon');
			resourceEntry.command = {
				"title": "Edit Class Mediator",
				"command": COMMANDS.EDIT_CLASS_MEDIATOR_COMMAND,
				"arguments": [vscode.Uri.file(filePath)]
			};
			result.push(resourceEntry);
		}
	}
	return result;
}

function isCollapsibleState(state: boolean): vscode.TreeItemCollapsibleState {
	return state ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
}

function getEndpointIcon(endpointType: EndpointTypes): string {
	let icon = 'endpoint';
	// Replace above with switch case when more endpoint types are added
	switch (endpointType) {
		case EndpointTypes.HTTP_ENDPOINT:
			icon = 'http-endpoint';
			break;
		case EndpointTypes.ADDRESS_ENDPOINT:
			icon = 'address-endpoint';
			break;
		case EndpointTypes.WSDL_ENDPOINT:
			icon = 'wsdl-endpoint';
			break;
		case EndpointTypes.DEFAULT_ENDPOINT:
			icon = 'default-endpoint';
			break;
		case EndpointTypes.LOAD_BALANCE_ENDPOINT:
			icon = 'load-balance-endpoint';
			break;
		case EndpointTypes.FAILOVER_ENDPOINT:
			icon = 'failover-endpoint';
			break;
		case EndpointTypes.RECIPIENT_ENDPOINT:
			icon = 'recipient-endpoint';
			break;
	}
	return icon;
}

function getTemplateIcon(templateType: string): string {
	let icon = 'template-endpoint';
	switch (templateType) {
		case TemplateTypes.ADDRESS_ENDPOINT:
			icon = 'address-endpoint-template';
			break;
		case TemplateTypes.DEFAULT_ENDPOINT:
			icon = 'default-endpoint-template';
			break;
		case TemplateTypes.HTTP_ENDPOINT:
			icon = 'http-endpoint-template';
			break;
		case TemplateTypes.WSDL_ENDPOINT:
			icon = 'wsdl-endpoint-template';
			break;
		case TemplateTypes.SEQUENCE_ENDPOINT:
			icon = 'sequence-template';
			break;
	}
	return icon;
}

function getInboundEndpointIcon(endpointType: InboundEndpointTypes): string {
	let icon = 'inbound-endpoint';
	// Replace above with switch case when more endpoint types are added
	switch (endpointType) {
		case InboundEndpointTypes.CXF_WS_RM:
			icon = 'cxf-ws-rm-endpoint';
			break;
		case InboundEndpointTypes.FILE:
			icon = 'file-endpoint';
			break;
		case InboundEndpointTypes.HL7:
			icon = 'hl7-endpoint';
			break;
		case InboundEndpointTypes.JMS:
			icon = 'jms-endpoint';
			break;
		case InboundEndpointTypes.MQTT:
			icon = 'mqtt-endpoint';
			break;
		case InboundEndpointTypes.WS:
			icon = 'ws-endpoint';
			break;
		case InboundEndpointTypes.FEED:
			icon = 'feed-endpoint';
			break;
		case InboundEndpointTypes.HTTPS:
			icon = 'https-endpoint';
			break;
		case InboundEndpointTypes.HTTP:
			icon = 'http-inbound-endpoint';
			break;
		case InboundEndpointTypes.KAFKA:
			icon = 'kafka-endpoint';
			break;
		case InboundEndpointTypes.WSS:
			icon = 'wss-endpoint';
			break;
		case InboundEndpointTypes.CUSTOM:
			icon = 'user-defined-endpoint';
			break;
		case InboundEndpointTypes.RABBITMQ:
			icon = 'rabbitmq-endpoint';
			break;
	}
	return icon;
}

function getMessageProcessorIcon(messageProcessorType: MessageProcessorTypes): string {
	let icon = 'message-processor';
	// Replace above with switch case when more endpoint types are added
	switch (messageProcessorType) {
		case MessageProcessorTypes.MESSAGE_SAMPLING:
			icon = 'message-sampling-processor';
			break;
		case MessageProcessorTypes.SCHEDULED_MESSAGE_FORWARDING:
			icon = 'scheduled-message-forwarding-processor';
			break;
		case MessageProcessorTypes.SCHEDULED_FAILOVER_MESSAGE_FORWARDING:
			icon = 'scheduled-failover-message-forwarding-processor';
			break;
		case MessageProcessorTypes.CUSTOM:
			icon = 'custom-message-processor';
			break;
	}
	return icon;
}

function getMesaaageStoreIcon(messageStoreType: MessageStoreTypes): string {
	let icon = 'message-store';
	// Replace above with switch case when more endpoint types are added
	switch (messageStoreType) {
		case MessageStoreTypes.IN_MEMORY:
			icon = 'in-memory-message-store';
			break;
		case MessageStoreTypes.CUSTOM:
			icon = 'custom-message-store';
			break;
		case MessageStoreTypes.JMS:
			icon = 'jms-message-store';
			break;
		case MessageStoreTypes.RABBITMQ:
			icon = 'rabbit-mq';
			break;
		case MessageStoreTypes.WSO2_MB:
			icon = 'wso2-mb-message-store';
			break;
		case MessageStoreTypes.RESEQUENCE:
			icon = 'resequence-message-store';
			break;
		case MessageStoreTypes.JDBC:
			icon = 'jdbc-message-store';
			break;
	}
	return icon;
}


function genProjectStructureEntry(data: ProjectStructureEntry[]): ProjectExplorerEntry[] {
	const result: ProjectExplorerEntry[] = [];

	for (const entry of data) {
		let explorerEntry;

		if (entry.type === 'API' && entry.resources) {
			const apiEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(true), entry, 'APIResource');
			apiEntry.contextValue = 'api';
			apiEntry.iconPath = {
				light: path.join(extensionContext.extensionPath, 'assets', `light-APIResource.svg`),
				dark: path.join(extensionContext.extensionPath, 'assets', `dark-APIResource.svg`)
			};
			apiEntry.children = [];

			// Generate resource structure
			for (let i = 0; i < entry.resources.length; i++) {
				const resource: any = entry.resources[i];
				const iconName = resource?.methods?.includes(" ") ? "APIResource" : `${resource?.methods?.toLowerCase()}-api`;
				const resourceEntry = new ProjectExplorerEntry((resource.uriTemplate || resource.urlMapping) ?? "/", isCollapsibleState(false), {
					name: (resource.uriTemplate || resource.urlMapping),
					type: 'resource',
					path: `${entry.path}/${i}`
				}, iconName);
				resourceEntry.command = {
					"title": "Show Diagram",
					"command": COMMANDS.SHOW_RESOURCE_VIEW,
					"arguments": [vscode.Uri.file(entry.path), i, false]
				};
				resourceEntry.contextValue = 'resource';
				apiEntry.children.push(resourceEntry);
			}
			explorerEntry = apiEntry;

		} else if (entry.type === "ENDPOINT") {
			const icon = entry.isRegistryResource ? 'file-code' : 'code';
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, getEndpointIcon(entry.subType as EndpointTypes));
			explorerEntry.contextValue = 'endpoint';
			explorerEntry.command = {
				"title": "Show Endpoint",
				"command": getViewCommand(entry.subType),
				"arguments": [vscode.Uri.file(entry.path), 'endpoint', undefined, false]
			};

		} else if (entry.type === "SEQUENCE") {
			let icon = 'Sequence';
			let isCodicon = false;
			if (entry.isRegistryResource) {
				icon = 'file-code';
				isCodicon = true;
			}
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, icon, isCodicon);
			explorerEntry.contextValue = 'sequence';
			explorerEntry.command = {
				"title": "Show Diagram",
				"command": COMMANDS.SHOW_SEQUENCE_VIEW,
				"arguments": [vscode.Uri.file(entry.path), undefined, false]
			};

		} else if (entry.type === "MESSAGE_PROCESSOR") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, getMessageProcessorIcon(entry.subType as MessageProcessorTypes));
			explorerEntry.contextValue = 'message-processor';
			explorerEntry.command = {
				"title": "Show Message Processor",
				"command": COMMANDS.SHOW_MESSAGE_PROCESSOR,
				"arguments": [vscode.Uri.file(entry.path), undefined, false]
			};

		} else if (entry.type === "PROXY_SERVICE") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'arrow-swap', true);
			explorerEntry.contextValue = 'proxy-service';
			explorerEntry.command = {
				"title": "Show Diagram",
				"command": COMMANDS.SHOW_PROXY_VIEW,
				"arguments": [vscode.Uri.file(entry.path), undefined, false]
			};

		} else if (entry.type === "TEMPLATE") {
			const icon = entry.isRegistryResource ? 'file-code' : getTemplateIcon(entry.subType as TemplateTypes);
			const isCodicon = entry.isRegistryResource ? true : false;
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, icon, isCodicon);
			explorerEntry.contextValue = 'template';
			explorerEntry.command = {
				"title": "Show Template",
				"command": getViewCommand(entry.subType),
				"arguments": [vscode.Uri.file(entry.path), 'template', undefined, false]
			};

		} else if (entry.type === "TASK") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, entry.type);
			explorerEntry.contextValue = 'task';
			explorerEntry.command = {
				"title": "Show Task",
				"command": COMMANDS.SHOW_TASK_VIEW,
				"arguments": [vscode.Uri.file(entry.path), undefined, false]
			};
		} else if (entry.type === "INBOUND_ENDPOINT") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, getInboundEndpointIcon(entry.subType as InboundEndpointTypes));
			explorerEntry.contextValue = 'inboundEndpoint';
			explorerEntry.command = {
				"title": "Show Inbound Endpoint",
				"command": COMMANDS.SHOW_INBOUND_ENDPOINT,
				"arguments": [vscode.Uri.file(entry.path), undefined, false]
			};
		}
		else if (entry.type === "MESSAGE_STORE") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, getMesaaageStoreIcon(entry.subType as MessageStoreTypes));
			explorerEntry.contextValue = 'messageStore';
			explorerEntry.command = {
				"title": "Show Message Store",
				"command": COMMANDS.SHOW_MESSAGE_STORE,
				"arguments": [vscode.Uri.file(entry.path), undefined, false]
			};

		} else if (entry.type === "LOCAL_ENTRY") {
			let icon = 'local-entry';
			let isCodicon = false;
			if (entry.isRegistryResource) {
				icon = 'file-code';
				isCodicon = true;
			}
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, icon, isCodicon);
			explorerEntry.contextValue = 'localEntry';
			explorerEntry.command = {
				"title": "Show Local Entry",
				"command": COMMANDS.SHOW_LOCAL_ENTRY,
				"arguments": [vscode.Uri.file(entry.path), undefined, false]
			};

		}
		// TODO: Update type to connections
		else if (entry.type === "localEntry") {
			explorerEntry = new ProjectExplorerEntry(
				entry.name,
				isCollapsibleState(false),
				entry,
				'vm-connect',
				true
			);
			explorerEntry.contextValue = 'connection';
			explorerEntry.id = entry.name;
			explorerEntry.command = {
				"title": "Show Connection",
				"command": COMMANDS.SHOW_CONNECTION,
				"arguments": [vscode.Uri.file(entry.path), entry.name, false]
			};
		}
		// TODO: Will introduce back when both datasource and dataservice functionalities are completely supported
		else if (entry.type === "DATA_SOURCE") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, "data-source");
			explorerEntry.contextValue = 'dataSource';
			explorerEntry.command = {
				"title": "Show Data Source",
				"command": COMMANDS.SHOW_DATA_SOURCE,
				"arguments": [vscode.Uri.file(entry.path), undefined, false]
			};
		} else if (entry.type === "DATA_SERVICE") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, "data-service");
			explorerEntry.contextValue = 'data-service';
			explorerEntry.command = {
				"title": "Show Data Service",
				"command": COMMANDS.OPEN_DSS_SERVICE_DESIGNER,
				"arguments": [vscode.Uri.file(entry.path)]
			};
		}
		else {
			if (entry.name) {
				explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code', true);
			}
		}

		result.push(explorerEntry);
	}

	return result;
}

export function getViewCommand(endpointType?: string) {
	let viewCommand = COMMANDS.SHOW_TEMPLATE;
	if (endpointType === 'HTTP_ENDPOINT') {
		viewCommand = COMMANDS.SHOW_HTTP_ENDPOINT;
	} else if (endpointType === 'ADDRESS_ENDPOINT') {
		viewCommand = COMMANDS.SHOW_ADDRESS_ENDPOINT;
	} else if (endpointType === 'WSDL_ENDPOINT') {
		viewCommand = COMMANDS.SHOW_WSDL_ENDPOINT;
	} else if (endpointType === 'DEFAULT_ENDPOINT') {
		viewCommand = COMMANDS.SHOW_DEFAULT_ENDPOINT;
	} else if (endpointType === 'LOAD_BALANCE_ENDPOINT') {
		viewCommand = COMMANDS.SHOW_LOAD_BALANCE_ENDPOINT;
	} else if (endpointType === 'FAIL_OVER_ENDPOINT') {
		viewCommand = COMMANDS.SHOW_FAILOVER_ENDPOINT;
	} else if (endpointType === 'RECIPIENT_LIST_ENDPOINT') {
		viewCommand = COMMANDS.SHOW_RECIPIENT_ENDPOINT;
	} else if (endpointType === 'TEMPLATE_ENDPOINT') {
		viewCommand = COMMANDS.SHOW_TEMPLATE_ENDPOINT;
	} else if (endpointType === 'SEQUENCE') {
		viewCommand = COMMANDS.SHOW_SEQUENCE_TEMPLATE_VIEW;
	}
	return viewCommand;
}
