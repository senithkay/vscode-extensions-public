import * as vscode from 'vscode';
import { ProjectView } from './panel';

export function activateActivityBarWebViews(context: vscode.ExtensionContext) {
	const projectViewProvider = new ProjectView(context);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(ProjectView.viewType, projectViewProvider));
}

