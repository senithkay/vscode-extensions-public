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
import { ProjectStructureResponse, ProjectStructureEntry, RegistryResourcesFolder } from '@wso2-enterprise/mi-core';
import { COMMANDS } from '../constants';
import { window } from 'vscode';
import path = require('path');
import { findJavaFiles } from '../util/fileOperations';

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

	refresh() {
		return window.withProgress({
			location: { viewId: 'MI.project-explorer' },
			title: 'Loading project structure'
		}, async () => {
			try {
				this._data = await getProjectStructureData(this.context);
				this._onDidChangeTreeData.fire();
			} catch (err) {
				console.error(err);
				this._data = [];
			}
		});
	}

	constructor(private context: vscode.ExtensionContext) {
		this._data = [];
		this.refresh();
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

async function getProjectStructureData(context: vscode.ExtensionContext): Promise<ProjectExplorerEntry[]> {
	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		const langClient = (await MILanguageClient.getInstance(context)).languageClient;
		const data: ProjectExplorerEntry[] = [];
		if (!!langClient) {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			for (const workspace of workspaceFolders) {
				const rootPath = workspace.uri.fsPath;

				const resp = await langClient.getProjectStructure(rootPath);
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
		return projectRoot;
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
			'debug-continue'
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
				"arguments": [vscode.Uri.parse(filePath)]
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
				const resourceEntry = new ProjectExplorerEntry(resource.uriTemplate ?? "/", isCollapsibleState(false), {
					name: resource.uriTemplate,
					type: 'resource',
					path: `${entry.path}/${i}`
				}, 'code');
				resourceEntry.command = {
					"title": "Show Diagram",
					"command": COMMANDS.SHOW_DIAGRAM,
					"arguments": [vscode.Uri.parse(entry.path), i, false]
				};
				apiEntry.children.push(resourceEntry);
			}
			explorerEntry = apiEntry;

		} else if (entry.type === "ENDPOINT") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
			explorerEntry.contextValue = 'endpoint';
			explorerEntry.command = {
				"title": "Show Endpoint",
				"command": COMMANDS.SHOW_ENDPOINT,
				"arguments": [vscode.Uri.parse(entry.path), undefined, false]
			};

		} else if (entry.type === "SEQUENCE") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
			explorerEntry.contextValue = 'sequence';
			explorerEntry.command = {
				"title": "Show Diagram",
				"command": COMMANDS.SHOW_DIAGRAM,
				"arguments": [vscode.Uri.parse(entry.path), undefined, false]
			};

		} else if (entry.type === "MESSAGE_PROCESSOR") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
			explorerEntry.contextValue = 'message-processor';
			explorerEntry.command = {
				"title": "Show Message Processor",
				"command": COMMANDS.SHOW_MESSAGE_PROCESSOR,
				"arguments": [vscode.Uri.parse(entry.path), undefined, false]
			};

		} else if (entry.type === "PROXY_SERVICE") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
			explorerEntry.contextValue = 'proxy-service';
			explorerEntry.command = {
				"title": "Show Diagram",
				"command": COMMANDS.SHOW_DIAGRAM,
				"arguments": [vscode.Uri.parse(entry.path), undefined, false]
			};

		} else if (entry.type === "TEMPLATE") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
			explorerEntry.contextValue = 'template';
			explorerEntry.command = {
				"title": "Show Template",
				"command": COMMANDS.SHOW_TEMPLATE,
				"arguments": [vscode.Uri.parse(entry.path), undefined, false]
			};

		} else if (entry.type === "TASK") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
			explorerEntry.contextValue = 'task';
			explorerEntry.command = {
				"title": "Show Task",
				"command": COMMANDS.SHOW_TASK,
				"arguments": [vscode.Uri.parse(entry.path), undefined, false]
			};
		} else if (entry.type === "INBOUND_ENDPOINT") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
			explorerEntry.contextValue = 'inboundEndpoint';
			explorerEntry.command = {
				"title": "Show Inbound Endpoint",
				"command": COMMANDS.SHOW_INBOUND_ENDPOINT,
				"arguments": [vscode.Uri.parse(entry.path), undefined, false]
			};
		}
		else if (entry.type === "MESSAGE_STORE") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
			explorerEntry.contextValue = 'messageStore';
			explorerEntry.command = {
				"title": "Show Message Store",
				"command": COMMANDS.SHOW_MESSAGE_STORE,
				"arguments": [vscode.Uri.parse(entry.path), undefined, false]
			};

		} else if (entry.type === "LOCAL_ENTRY") {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
			explorerEntry.contextValue = 'localEntry';
			explorerEntry.command = {
				"title": "Show Local Entry",
				"command": COMMANDS.SHOW_LOCAL_ENTRY,
				"arguments": [vscode.Uri.parse(entry.path), undefined, false]
			};

		} else {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
		}

		result.push(explorerEntry);
	}

	return result;
}

function genRegistryProjectStructureEntry(data: RegistryResourcesFolder): ProjectExplorerEntry[] {
	const result: ProjectExplorerEntry[] = [];
	if (data) {
		if (data.files) {
			for (const entry of data.files) {
				const explorerEntry = new ProjectExplorerEntry(entry.name, isCollapsibleState(false), {
					name: entry.name,
					type: 'resource',
					path: `${entry.path}`
				}, 'code');
				explorerEntry.contextValue = "registry-file";
				explorerEntry.id = entry.path;
				explorerEntry.command = {
					"title": "Edit Registry Resource",
					"command": COMMANDS.EDIT_REGISTERY_RESOURCE_COMMAND,
					"arguments": [vscode.Uri.parse(entry.path)]
				};
				result.push(explorerEntry);
			}
		}
		if (data.folders) {
			for (const entry of data.folders) {
				const explorerEntry = new ProjectExplorerEntry(entry.name,
					isCollapsibleState(entry.files.length > 0 || entry.folders.length > 0),
					{
						name: entry.name,
						type: 'resource',
						path: `${entry.path}`
					}, 'folder');
				explorerEntry.children = genRegistryProjectStructureEntry(entry);
				explorerEntry.contextValue = "registry-folder";
				result.push(explorerEntry);
			}
		}
	}
	return result;
}
