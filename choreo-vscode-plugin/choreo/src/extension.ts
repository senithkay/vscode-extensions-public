import * as vscode from 'vscode';
import { window } from 'vscode';
import { ProjectsTreeProvider } from './views/projects-tree-provider';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('choreo.sign.in', () => {
		vscode.window.showInformationMessage('Hello World from WSO2 Choreo!');
	});
	context.subscriptions.push(disposable);

	const choreoResourcesProvider = new ProjectsTreeProvider();
    window.createTreeView('choreo-resources', {
        treeDataProvider: choreoResourcesProvider, showCollapseAll: true
    });
	
}

export function deactivate() {}
