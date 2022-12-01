import * as vscode from 'vscode';
import { window } from 'vscode';
import { activateAuth } from './auth';
import { choreoExtInstance } from './core/ChoreoExtension';
import { ProjectsTreeProvider } from './views/projects-tree-provider';

export let isPluginStartup = true;

export function activate(context: vscode.ExtensionContext) {
	console.log('activating the plugin');
	choreoExtInstance.setContext(context);

	activateAuth(choreoExtInstance);

	const choreoResourcesProvider = new ProjectsTreeProvider();
    window.createTreeView('choreo-resources', {
        treeDataProvider: choreoResourcesProvider, showCollapseAll: true
    });
	isPluginStartup = false;
}

export function deactivate() {}
