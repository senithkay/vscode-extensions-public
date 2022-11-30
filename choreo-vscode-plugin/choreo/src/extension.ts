import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('choreo.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from WSO2 Choreo!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
