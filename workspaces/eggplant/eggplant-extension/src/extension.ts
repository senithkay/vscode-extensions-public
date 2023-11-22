import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { activateActivityBarWebViews } from './ActivityBar/activate';

export function activate(context: vscode.ExtensionContext) {
	activateActivityBarWebViews(context);

	vscode.workspace.findFiles('**/Ballerina.toml', '**/node_modules/**', 1).then(files => {
		if (files.length > 0) {
			fs.readFile(files[0].fsPath, 'utf8', (err, data) => {
				if (err) {
					console.error(err);
					return;
				}
				if (data.includes('eggplant')) {
					openEggplantPerspective();
				}
			});
		}
	});

}

function openEggplantPerspective() {
	// render the low code editor
	vscode.commands.executeCommand('eggplant.showWebview');
	const panel = vscode.window.createWebviewPanel(
		'eggplantView', // Identifies the type of the webview. Used internally
		'Eggplant View', // Title of the panel displayed to the user
		vscode.ViewColumn.One, // Editor column to show the new webview panel in.
		{} // Webview options. More on these later.
	);
	panel.webview.html = `<h1>Hello Eggplant</h1>`;

	// Focus eggplant perspective
	vscode.commands.executeCommand('workbench.view.extension.eggplant');
}


export function deactivate() { }
