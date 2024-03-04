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
import { ProjectStructureResponse, ProjectStructureEntry } from '@wso2-enterprise/mi-core';
import { COMMANDS } from '../constants';
import { window } from 'vscode';

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

	refresh(): void {
		window.withProgress({
			location: { viewId: 'MI.project-explorer' },
			title: 'Loading project structure'
		}, async () => {
			await getProjectStructureData(this.context)
				.then(data => {
					this._data = data;
				})
				.catch(err => {
					console.error(err);
					this._data = [];
				});

			this._onDidChangeTreeData.fire();
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

		const artifacts = (directoryMap as any)?.src?.main?.wso2mi?.artifacts;
		if (artifacts) {
			for (const key in artifacts) {

				artifacts[key].path = project.uri.fsPath + '/src/main/wso2mi/artifacts/' + key;
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

		return projectRoot;
	}
}

function isCollapsibleState(state: boolean): vscode.TreeItemCollapsibleState {
	return state ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
}

function genProjectStructureEntry(data: ProjectStructureEntry[]): ProjectExplorerEntry[] {
	const result: ProjectExplorerEntry[] = [];

	for (const entry of data) {
		let explorerEntry;

		if (entry.resources) {
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

		} else {
			explorerEntry = new ProjectExplorerEntry(entry.name.replace(".xml", ""), isCollapsibleState(false), entry, 'code');
		}

		result.push(explorerEntry);
	}

	return result;
}

