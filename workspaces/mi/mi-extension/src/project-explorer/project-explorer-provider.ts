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
		getProjectStructureData(this.context)
			.then(data => {
				this._data = data;
			})
			.catch(err => {
				console.error(err);
				this._data = [];
			});

		this._onDidChangeTreeData.fire();
	}

	constructor(private context: vscode.ExtensionContext) {
		this._data = [];

		getProjectStructureData(context)
			.then(data => {
				this._data = data;
				this._onDidChangeTreeData.fire();
			})
			.catch(err => {
				console.error(err);
				this._data = [];
			});
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



}

async function getProjectStructureData(context: vscode.ExtensionContext): Promise<ProjectExplorerEntry[]> {
	const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ?
		vscode.workspace.workspaceFolders[0].uri.fsPath
		: undefined;

	if (rootPath === undefined) {
		vscode.commands.executeCommand('setContext', 'projectOpened', false);
		throw new Error("Error identifying workspace root");
	}

	const langClient = (await MILanguageClient.getInstance(context)).languageClient;

	if (!!langClient) {
		const resp = await langClient.getProjectStructure(rootPath);
		if (resp) {
			vscode.commands.executeCommand('setContext', 'projectOpened', true);
		}
		return generateTreeData(resp);
	}
	vscode.commands.executeCommand('setContext', 'projectOpened', false);
	return [];

}

function generateTreeData(data: ProjectStructureResponse): ProjectExplorerEntry[] {
	const directoryMap = data.directoryMap;
	const result: ProjectExplorerEntry[] = [];
	const workspaceName = vscode.workspace.name ?? '';
	const projectRoot = new ProjectExplorerEntry(
		`Project ${workspaceName.length > 0 ? `: ${workspaceName.toUpperCase()}` : ''}`,
		vscode.TreeItemCollapsibleState.Collapsed,
		undefined,
		'project'
	);

	for (const key in directoryMap) {
		switch (key) {
			case "esbConfigs":
				const esbConfigs = new ProjectExplorerEntry(
					key,
					isCollapsibleState(Object.keys(directoryMap.esbConfigs).length > 0),
					undefined,
					'package'
				);

				for (const esbConfig in directoryMap.esbConfigs) {
					const config = directoryMap.esbConfigs[esbConfig];
					const esbConfigEntry = new ProjectExplorerEntry(
						config.name,
						isCollapsibleState(Object.keys(config).length > 0),
						undefined,
						'package'
					);

					for (const key in config.esbConfigs) {
						const parentEntry = new ProjectExplorerEntry(
							key,
							isCollapsibleState((config.esbConfigs[key]).length > 0),
							undefined,
							'folder'
						);
						const children = genProjectStructureEntry(config.esbConfigs[key]);

						parentEntry.children = children;
						parentEntry.contextValue = key;

						switch (key) {
							case 'api':
								parentEntry.iconPath = new vscode.ThemeIcon('globe');
								break;
							case 'endpoints':
								parentEntry.iconPath = new vscode.ThemeIcon('plug');
								break;
							case 'inbound-endpoints':
								parentEntry.iconPath = new vscode.ThemeIcon('fold-down');
								break;
							case 'local-entries':
								parentEntry.iconPath = new vscode.ThemeIcon('settings');
								break;
							case 'message-stores':
								parentEntry.iconPath = new vscode.ThemeIcon('database');
								break;
							case 'message-processors':
								parentEntry.iconPath = new vscode.ThemeIcon('gear');
								break;
							case 'proxy-services':
								parentEntry.iconPath = new vscode.ThemeIcon('arrow-swap');
								break;
							case 'sequences':
								parentEntry.iconPath = new vscode.ThemeIcon('list-ordered');
								break;
							case 'tasks':
								parentEntry.iconPath = new vscode.ThemeIcon('tasklist');
								break;
							case 'templates':
								parentEntry.iconPath = new vscode.ThemeIcon('file');
								break;
							case 'resources':
								parentEntry.iconPath = new vscode.ThemeIcon('globe');
								break;
							default:
						}

						esbConfigEntry.children = esbConfigEntry.children ?? [];
						if (parentEntry.children.length > 0) esbConfigEntry.children.push(parentEntry);
					}
					esbConfigs.children = esbConfigs.children ?? [];
					esbConfigs.children.push(esbConfigEntry);
				}
				projectRoot.children = projectRoot.children ?? [];
				projectRoot.children.push(esbConfigs);
				break;
			case 'dataServiceConfigs':
			case 'dataSourceConfigs':
			case 'mediatorProjects':
			case 'registryResources':
			case 'javaLibraryProjects':
			case 'compositeExporters':
			case 'connectorExporters':
			case 'dockerExporters':
				const parentEntry = new ProjectExplorerEntry(
					key,
					isCollapsibleState(Object.keys(directoryMap.esbConfigs).length > 0),
					undefined,
					'package'
				);
				const children = genProjectStructureEntry(directoryMap[key]);
				parentEntry.children = children;
				projectRoot.children = projectRoot.children ?? [];
				if (children.length > 0) { projectRoot.children.push(parentEntry); }
			default:
			// do none

		}
	}

	result.push(projectRoot);

	return result;
}

function isCollapsibleState(state: boolean): vscode.TreeItemCollapsibleState {
	return state ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
}

function genProjectStructureEntry(data: ProjectStructureEntry[]): ProjectExplorerEntry[] {
	const result: ProjectExplorerEntry[] = [];

	for (const entry of data) {
		let explorerEntry;

		if (entry.resources) {
			const apiEntry = new ProjectExplorerEntry(entry.name, isCollapsibleState(true), entry, 'code');
			apiEntry.contextValue = 'api';
			apiEntry.iconPath = new vscode.ThemeIcon('notebook-open-as-text');
			apiEntry.children = [];

			// Generate resource structure
			for (const resource of entry.resources) {
				const resourceEntry: ProjectStructureEntry = {
					...entry,
					name: resource.uriTemplate,
					type: 'resource'
				};
				apiEntry.children.push(new ProjectExplorerEntry(resource.uriTemplate ?? "/", isCollapsibleState(false), resourceEntry, 'code'));
			}
			explorerEntry = apiEntry;

		} else {
			explorerEntry = new ProjectExplorerEntry(entry.name, isCollapsibleState(false), entry, 'code');
		}

		result.push(explorerEntry);
	}

	return result;
}

