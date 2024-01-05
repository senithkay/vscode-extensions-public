import * as vscode from 'vscode';
import { MILanguageClient } from '../lang-client/activator';
import { GetProjectStructureResponse, ProjectStructureEntry } from '@wso2-enterprise/mi-core';

export class ProjectExplorerEntry extends vscode.TreeItem {
	children: ProjectExplorerEntry[] | undefined
	info: ProjectStructureEntry | undefined

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		info: ProjectStructureEntry | undefined = undefined
	) {
		super(label, collapsibleState);
		this.tooltip = `${this.label}`;
		this.info = info;
	}
}

export class ProjectExplorerEntryProvider implements vscode.TreeDataProvider<ProjectExplorerEntry> {
	private _data: ProjectExplorerEntry[]
	private _onDidChangeTreeData: vscode.EventEmitter<ProjectExplorerEntry | undefined | null | void> = new vscode.EventEmitter<ProjectExplorerEntry | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<ProjectExplorerEntry | undefined | null | void> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	constructor(context: vscode.ExtensionContext) {
		this._data = []

		getProjectStructureData(context)
			.then(data => {
				this._data = data
				this.refresh()
			})
			.catch(err => {
				console.error(err)
				this._data = []
			})
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
		throw new Error("Error identifying workspace root")
	}

	const langClient = (await MILanguageClient.getInstance(context)).languageClient;

	if (!!langClient) {
		const resp = await langClient.getProjectStructure(rootPath)
		return generateTreeData(resp);
	}

	return []

}

function generateTreeData(data: GetProjectStructureResponse): ProjectExplorerEntry[] {
	console.log("hehe >>>", data)
	const directoryMap = data.directoryMap;
	const result: ProjectExplorerEntry[] = [];
	const projectRoot = new ProjectExplorerEntry("Project", vscode.TreeItemCollapsibleState.Collapsed);

	for (const key in directoryMap) {
		switch (key) {
			case "esbConfigs":
				const esbConfigs = new ProjectExplorerEntry(
					key,
					isCollapsibleState(Object.keys(directoryMap.esbConfigs).length > 0));

				for (const key in directoryMap.esbConfigs) {
					const parentEntry = new ProjectExplorerEntry(key, isCollapsibleState(directoryMap.esbConfigs[key].length > 0));
					const children = genProjectStructureEntry(directoryMap.esbConfigs[key]);

					parentEntry.children = children;
					esbConfigs.children = esbConfigs.children ?? [];
					esbConfigs.children.push(parentEntry);
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
					isCollapsibleState(Object.keys(directoryMap.esbConfigs).length > 0));
				const children = genProjectStructureEntry(directoryMap[key]);
				parentEntry.children = children;
				projectRoot.children = projectRoot.children ?? [];
				projectRoot.children.push(parentEntry);
			default:
			// do none

		}
	}

	result.push(projectRoot);

	console.log("hehe >>>", result)

	return result;
}

function isCollapsibleState(state: boolean): vscode.TreeItemCollapsibleState {
	return state ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
}

function genProjectStructureEntry(data: ProjectStructureEntry[]): ProjectExplorerEntry[] {
	const result: ProjectExplorerEntry[] = [];

	for (const entry of data) {
		const children = genProjectStructureEntry(entry.sequences ?? []).concat(genProjectStructureEntry(entry.endpoints ?? []))
		result.push(new ProjectExplorerEntry(entry.name, isCollapsibleState(children.length > 0), entry),);
	}

	return result;
}

