import * as vscode from 'vscode';
import { MILanguageClient } from '../lang-client/activator';

export class ProjectExplorerEntry extends vscode.TreeItem {
	children: ProjectExplorerEntry[] | undefined

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(label, collapsibleState);
		this.tooltip = `${this.label}`;
	}
}

export class ProjectExplorerEntryProvider implements vscode.TreeDataProvider<ProjectExplorerEntry> {
	private _data: ProjectExplorerEntry[]

	constructor(context: vscode.ExtensionContext) {
		this._data = []

		getProjectStructureData(context)
			.then(data => {
				this._data = data
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

		console.log(resp)

		return []

	}

	return []

}
