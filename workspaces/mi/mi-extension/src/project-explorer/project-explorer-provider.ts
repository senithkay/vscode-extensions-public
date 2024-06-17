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
import { ProjectStructureResponse, ProjectStructureEntry, RegistryResourcesFolder, RegistryArtifact, ListRegistryArtifactsResponse } from '@wso2-enterprise/mi-core';
import { COMMANDS } from '../constants';
import { window } from 'vscode';
import path = require('path');
import { findJavaFiles, getAvailableRegistryResources } from '../util/fileOperations';
import { ExtendedLanguageClient } from '../lang-client/ExtendedLanguageClient';

let registryDetails: ListRegistryArtifactsResponse;
export class ProjectExplorerEntry extends vscode.TreeItem {
	children: ProjectExplorerEntry[] | undefined;
	info: ProjectStructureEntry | undefined;

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		info: ProjectStructureEntry | undefined = undefined,
		icon: string = 'folder'
	) {
		super(label, collapsibleState);
		this.tooltip = `${this.label}`;
		this.info = info;
		this.iconPath = new vscode.ThemeIcon(icon);
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
				this._data = await getProjectStructureData(this.context, langClient);
				this._onDidChangeTreeData.fire();
			} catch (err) {
				console.error(err);
				this._data = [];
			}
		});
	}

	constructor(private context: vscode.ExtensionContext) {
		this._data = [];
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

async function getProjectStructureData(context: vscode.ExtensionContext, langClient: ExtendedLanguageClient): Promise<ProjectExplorerEntry[]> {
	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		const data: ProjectExplorerEntry[] = [];
		if (!!langClient) {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			for (const workspace of workspaceFolders) {
				const rootPath = workspace.uri.fsPath;

				const resp = await langClient.getProjectStructure(rootPath);
				registryDetails = getAvailableRegistryResources(rootPath);
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
		generateTreeDataOfRegistry(project, data, projectRoot);
		generateTreeDataOfClassMediator(project, data, projectRoot);
		generateTreeDataOfDataMappings(project, data, projectRoot);
		return projectRoot;
	}
}

function generateTreeDataOfDataMappings(project: vscode.WorkspaceFolder, data: ProjectStructureResponse, projectRoot: ProjectExplorerEntry) {
	const directoryMap = data.directoryMap;
	const resources = (directoryMap as any)?.src?.main?.wso2mi.resources.registry;
	const govResources = resources['gov'];
	if (govResources && govResources.folders.length > 0) {
		const dataMapperResources = govResources.folders.find((folder: any) => folder.name === 'datamapper');
		if (dataMapperResources) {
			const parentEntry = new ProjectExplorerEntry(
				'Data Mappers',
				isCollapsibleState(dataMapperResources.folders.length > 0),
				{ name: 'datamapper', path: dataMapperResources.path, type: 'datamapper' },
				'arrow-both'
			);
			parentEntry.contextValue = 'data-mapper';
			parentEntry.id = 'data-mapper';
			parentEntry.children = parentEntry.children ?? [];
			for (const folder of dataMapperResources.folders) {
				for (const file of folder.files) {
					if (!file.name.endsWith('.ts')) {
						continue;
					}
					const configName = file.name.replace('.ts', '');
					const dataMapperEntry = new ProjectExplorerEntry(
						configName,
						isCollapsibleState(false),
						{ name: configName, path: file.path, type: 'dataMapper' },
						'file-code'
					);
					dataMapperEntry.contextValue = 'data-mapper';
					dataMapperEntry.command = {
						"title": "Open Data Mapper",
						"command": COMMANDS.SHOW_DATA_MAPPER,
						"arguments": [file.path]
					};
					parentEntry.children.push(dataMapperEntry);
				}
			}
			projectRoot.children?.push(parentEntry);
		}
	}
}

function generateTreeDataOfArtifacts(project: vscode.WorkspaceFolder, data: ProjectStructureResponse, projectRoot: ProjectExplorerEntry) {
	const directoryMap = data.directoryMap;
	const artifacts = (directoryMap as any)?.src?.main?.wso2mi?.artifacts;
	if (artifacts) {
		for (const key in artifacts) {

			artifacts[key].path = path.join(project.uri.fsPath, 'src', 'main', 'wso2mi', 'artifacts', key);
			let icon = 'folder';
			let label = key;
			let connectionEntry;

			switch (key) {
				case 'apis':
					icon = 'globe';
					label = 'APIs';
					break;
				case 'endpoints':
					icon = 'plug';
					label = 'Endpoints';
					break;
				case 'inboundEndpoints':
					icon = 'fold-down';
					label = 'Inbound Endpoints';
					break;
				case 'localEntries':
					icon = 'settings';
					label = 'Local Entries';
					connectionEntry = generateConnectionEntry(artifacts[key]);
					connectionEntry.info = artifacts[key];
					break;
				case 'messageStores':
					icon = 'database';
					label = 'Message Stores';
					break;
				case 'messageProcessors':
					icon = 'gear';
					label = 'Message Processors';
					break;
				case 'proxyServices':
					icon = 'arrow-swap';
					label = 'Proxy Services';
					break;
				case 'sequences':
					icon = 'list-ordered';
					label = 'Sequences';
					break;
				case 'tasks':
					icon = 'tasklist';
					label = 'Tasks';
					break;
				case 'templates':
					icon = 'file';
					label = 'Templates';
					break;
				case 'resources':
					icon = 'globe';
					label = 'Resources';
					break;
				case 'dataServices':
					icon = 'database';
					label = 'Data Services';
					break;
				case 'dataSources':
					icon = 'database';
					label = 'Data Sources';
					break;
				default:
			}
			// TODO: Will introduce back when both data services and data sources are supported
			if (key === 'dataServices' || key === 'dataSources') {
				continue;
			}

			const parentEntry = new ProjectExplorerEntry(
				label,
				isCollapsibleState(artifacts[key].length > 0),
				artifacts[key],
				icon
			);
			const children = genProjectStructureEntry(artifacts[key]);

			parentEntry.children = children;
			parentEntry.contextValue = key;
			parentEntry.id = `${project.name}/${key}`;

			connectionEntry ? parentEntry.children?.push(connectionEntry) : null;

			projectRoot.children = projectRoot.children ?? [];
			projectRoot.children.push(parentEntry);
		}
	}
}

function generateTreeDataOfRegistry(project: vscode.WorkspaceFolder, data: ProjectStructureResponse, projectRoot: ProjectExplorerEntry) {
	const directoryMap = data.directoryMap;
	const resources = (directoryMap as any)?.src?.main?.wso2mi?.resources;
	if (resources && resources['registry']) {
		const regPath = path.join(project.uri.fsPath, 'src', 'main', 'wso2mi', 'resources', 'registry');
		const parentEntry = new ProjectExplorerEntry(
			'Registry',
			isCollapsibleState(Object.keys(resources['registry']).length > 0),
			{ name: 'Registry', path: regPath, type: 'registry' },
			'type-hierarchy'
		);
		parentEntry.contextValue = 'registry';
		parentEntry.id = 'registry';
		const gov = resources['registry']['gov'];
		const conf = resources['registry']['conf'];
		const isCollapsibleGov = gov && ((gov.files && gov.files.length > 0) || (gov.folders && gov.folders.length > 0));
		const isCollapsibleConf = conf && ((conf.files && conf.files.length > 0) || (conf.folders && conf.folders.length > 0));
		if (gov) {
			const govEntry = new ProjectExplorerEntry(
				'gov',
				isCollapsibleState(isCollapsibleGov),
				{ name: 'gov', path: path.join(regPath, 'gov'), type: 'gov' },
				'root-folder'
			);
			govEntry.id = 'gov';
			govEntry.contextValue = 'gov';
			govEntry.children = genRegistryProjectStructureEntry(gov);
			parentEntry.children = parentEntry.children ?? [];
			parentEntry.children.push(govEntry);
		}
		if (conf) {
			const confEntry = new ProjectExplorerEntry(
				'conf',
				isCollapsibleState(isCollapsibleConf),
				{ name: 'conf', path: path.join(regPath, 'conf'), type: 'conf' },
				'root-folder-opened'
			);
			confEntry.id = 'conf';
			confEntry.contextValue = 'conf';
			confEntry.children = genRegistryProjectStructureEntry(conf);
			parentEntry.children = parentEntry.children ?? [];
			parentEntry.children.push(confEntry);
		}
		projectRoot.children = projectRoot.children ?? [];
		projectRoot.children.push(parentEntry);
	}
}

function generateTreeDataOfClassMediator(project: vscode.WorkspaceFolder, data: ProjectStructureResponse, projectRoot: ProjectExplorerEntry) {
	const directoryMap = data.directoryMap;
	const main = (directoryMap as any)?.src?.main;
	if (main && main['java']) {
		const javaPath = path.join(project.uri.fsPath, 'src', 'main', 'java');
		const mediators = findJavaFiles(javaPath);
		const parentEntry = new ProjectExplorerEntry(
			'Class Mediators',
			isCollapsibleState(mediators.size > 0),
			{ name: 'java', path: javaPath, type: 'java' },
			'debug-continue-small'
		);
		parentEntry.contextValue = 'class-mediator';
		parentEntry.id = 'class-mediator';
		parentEntry.children = parentEntry.children ?? [];
		for (var entry of mediators.entries()) {
			const filePath = entry[0];
			const packageName = entry[1];
			const fileName = path.basename(filePath);
			const resourceEntry = new ProjectExplorerEntry(fileName + " (" + packageName + ")", isCollapsibleState(false), {
				name: fileName,
				type: 'resource',
				path: filePath
			}, 'notebook-execute');
			resourceEntry.command = {
				"title": "Edit Class Mediator",
				"command": COMMANDS.EDIT_CLASS_MEDIATOR_COMMAND,
				"arguments": [vscode.Uri.file(filePath)]
			};
			parentEntry.children.push(resourceEntry);
		}
		projectRoot.children?.push(parentEntry);
	}
}

function isCollapsibleState(state: boolean): vscode.TreeItemCollapsibleState {
	return state ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
}

function genProjectStructureEntry(data: ProjectStructureEntry[]): ProjectExplorerEntry[] {
	const result: ProjectExplorerEntry[] = [];

	for (const entry of data) {
		let explorerEntry;

		if (entry.type === 'API' && entry.resources) {
			const apiEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(true), entry, 'code');
			apiEntry.contextValue = 'api';
			apiEntry.iconPath = new vscode.ThemeIcon('notebook-open-as-text');
			apiEntry.children = [];

			// Generate resource structure
			for (let i = 0; i < entry.resources.length; i++) {
				const resource = entry.resources[i];
				const resourceEntry = new ProjectExplorerEntry((resource.uriTemplate || resource.urlMapping) ?? "/", isCollapsibleState(false), {
					name: (resource.uriTemplate || resource.urlMapping),
					type: 'resource',
					path: `${entry.path}/${i}`
				}, 'code');
				resourceEntry.command = {
					"title": "Show Diagram",
					"command": COMMANDS.SHOW_RESOURCE_VIEW,
					"arguments": [vscode.Uri.file(entry.path), i, false]
				};
				apiEntry.children.push(resourceEntry);
			}
			explorerEntry = apiEntry;

		} else if (entry.type === "ENDPOINT") {
			const icon = entry.isRegistryResource ? 'file-code' : 'code';
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, icon);
			explorerEntry.contextValue = 'endpoint';
			explorerEntry.command = {
				"title": "Show Endpoint",
				"command": getViewCommand(entry.subType),
				"arguments": [vscode.Uri.file(entry.path), 'endpoint', undefined, false]
			};

		} else if (entry.type === "SEQUENCE") {
			let icon = 'code';
			if (entry.isRegistryResource) {
				icon = 'file-code';
			}
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, icon);
			explorerEntry.contextValue = 'sequence';
			explorerEntry.command = {
				"title": "Show Diagram",
				"command": COMMANDS.SHOW_SEQUENCE_VIEW,
				"arguments": [vscode.Uri.file(entry.path), undefined, false]
			};

		} else if (entry.type === "MESSAGE_PROCESSOR") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
			explorerEntry.contextValue = 'message-processor';
			explorerEntry.command = {
				"title": "Show Message Processor",
				"command": COMMANDS.SHOW_MESSAGE_PROCESSOR,
				"arguments": [vscode.Uri.file(entry.path), undefined, false]
			};

		} else if (entry.type === "PROXY_SERVICE") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
			explorerEntry.contextValue = 'proxy-service';
			explorerEntry.command = {
				"title": "Show Diagram",
				"command": COMMANDS.SHOW_PROXY_VIEW,
				"arguments": [vscode.Uri.file(entry.path), undefined, false]
			};

		} else if (entry.type === "TEMPLATE") {
			const icon = entry.isRegistryResource ? 'file-code' : 'code';
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, icon);
			explorerEntry.contextValue = 'template';
			explorerEntry.command = {
				"title": "Show Template",
				"command": getViewCommand(entry.subType),
				"arguments": [vscode.Uri.file(entry.path), 'template', undefined, false]
			};

		} else if (entry.type === "TASK") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
			explorerEntry.contextValue = 'task';
			explorerEntry.command = {
				"title": "Show Task",
				"command": COMMANDS.SHOW_TASK,
				"arguments": [vscode.Uri.file(entry.path), undefined, false]
			};
		} else if (entry.type === "INBOUND_ENDPOINT") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
			explorerEntry.contextValue = 'inboundEndpoint';
			explorerEntry.command = {
				"title": "Show Inbound Endpoint",
				"command": COMMANDS.SHOW_INBOUND_ENDPOINT,
				"arguments": [vscode.Uri.file(entry.path), undefined, false]
			};
		}
		else if (entry.type === "MESSAGE_STORE") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
			explorerEntry.contextValue = 'messageStore';
			explorerEntry.command = {
				"title": "Show Message Store",
				"command": COMMANDS.SHOW_MESSAGE_STORE,
				"arguments": [vscode.Uri.file(entry.path), undefined, false]
			};

		} else if (entry.type === "LOCAL_ENTRY") {
			let icon = 'code';
			if (entry.isRegistryResource) {
				icon = 'file-code';
			}
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, icon);
			explorerEntry.contextValue = 'localEntry';
			explorerEntry.command = {
				"title": "Show Local Entry",
				"command": COMMANDS.SHOW_LOCAL_ENTRY,
				"arguments": [vscode.Uri.file(entry.path), undefined, false]
			};
		}
		// TODO: Will introduce back when both data services and data sources are supported
		// else if (entry.type === "DATA_SOURCE") {
		// 	explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
		// 	explorerEntry.contextValue = 'dataSource';
		// 	explorerEntry.command = {
		// 		"title": "Show Data Source",
		// 		"command": COMMANDS.SHOW_DATA_SOURCE,
		// 		"arguments": [vscode.Uri.file(entry.path), undefined, false]
		// 	};
		// } 
		else {
			if (entry.name) {
				explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
			}
		}

		result.push(explorerEntry);
	}

	return result;
}

function generateConnectionEntry(connectionsData: any): ProjectExplorerEntry {
	const connectionsEntry = new ProjectExplorerEntry(
		"Connections",
		isCollapsibleState(true),
		connectionsData,
		'vm-connect'
	);
	connectionsEntry.contextValue = 'connections';
	connectionsEntry.id = 'connections';

	for (const entry of connectionsData) {
		if (!entry.type) {
			for (const [key, connectionsArray] of Object.entries(entry)) {
				const connectionTypeEntry = new ProjectExplorerEntry(
					key,
					isCollapsibleState((connectionsArray as any[]).length > 0),
					{
						name: key,
						type: 'connections',
						path: (connectionsArray as any)[0].path
					},
					'link-external'
				);
				connectionTypeEntry.contextValue = key;
				connectionTypeEntry.id = key;

				for (const connection of (connectionsArray as any)) {
					const connectionEntry = new ProjectExplorerEntry(
						connection.name,
						isCollapsibleState(false),
						connection,
						'code'
					);
					connectionEntry.contextValue = 'connection';
					connectionEntry.id = connection.name;

					connectionEntry.command = {
						"title": "Show Connection",
						"command": COMMANDS.SHOW_CONNECTION,
						"arguments": [vscode.Uri.file(connection.path), undefined, false]
					};

					connectionTypeEntry.children = connectionTypeEntry.children ?? [];
					connectionTypeEntry.children.push(connectionEntry);

				}
				connectionsEntry.children = connectionsEntry.children ?? [];
				connectionsEntry.children.push(connectionTypeEntry);
			}
		}
	}

	return connectionsEntry;
}

function checkExistanceOfRegistryResource(registryPath: string): boolean {
	if (registryDetails.artifacts) {
		for (const artifact of registryDetails.artifacts) {
			let transformedPath = artifact.path.replace("/_system/governance", '/gov').replace("/_system/config", '/conf');
			if (!artifact.isCollection) {
				transformedPath = transformedPath.endsWith('/') ? transformedPath + artifact.file : transformedPath + "/" + artifact.file;
			}
			if (transformedPath === registryPath) {
				return true;
			}
		}
		return false;
	}
	return false;
}

function genRegistryProjectStructureEntry(data: RegistryResourcesFolder): ProjectExplorerEntry[] {
	const result: ProjectExplorerEntry[] = [];
	const regPathPrefix = path.join("wso2mi", "resources", "registry");
	if (data) {
		if (data.files) {
			for (const entry of data.files) {
				const explorerEntry = new ProjectExplorerEntry(entry.name, isCollapsibleState(false), {
					name: entry.name,
					type: 'resource',
					path: `${entry.path}`
				}, 'code');
				explorerEntry.id = entry.path;
				explorerEntry.command = {
					"title": "Edit Registry Resource",
					"command": COMMANDS.EDIT_REGISTERY_RESOURCE_COMMAND,
					"arguments": [vscode.Uri.file(entry.path)]
				};
				result.push(explorerEntry);
				const lastIndex = entry.path.indexOf(regPathPrefix) !== -1 ? entry.path.indexOf(regPathPrefix) + regPathPrefix.length : 0;
				const registryPath = entry.path.substring(lastIndex);
				if (checkExistanceOfRegistryResource(registryPath)) {
					explorerEntry.contextValue = "registry-with-metadata";
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
						}, 'folder');
					explorerEntry.children = genRegistryProjectStructureEntry(entry);
					result.push(explorerEntry);
					const lastIndex = entry.path.indexOf(regPathPrefix) !== -1 ? entry.path.indexOf(regPathPrefix) + regPathPrefix.length : 0;
					const registryPath = entry.path.substring(lastIndex);
					if (checkExistanceOfRegistryResource(registryPath)) {
						explorerEntry.contextValue = "registry-with-metadata";
					}
				}
			}
		}
	}
	return result;
}

function getViewCommand(endpointType?: string) {
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
