import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { activateActivityBarWebViews } from './ActivityBar/activate';
import { ext } from './eggplantExtentionContext';
import { activateLowCodeWebViews } from './LowCode/activate';


// 1. Render the low code diagram in the webview
// 2. pass ls to eggplant extention
// 3. define state machine 
// 4. populate overview
// 5. populate diagram
// 6. define editing

export function activate(context: vscode.ExtensionContext) {
	// Initialize the eggplant extention context so we do not need to pass the variables around
	ext.context = context;
	activateActivityBarWebViews(context);
	activateLowCodeWebViews(context);

	// Get Ballerina extension
	const ballerinaExt = vscode.extensions.getExtension('wso2.ballerina');
	if (!ballerinaExt) {
		console.error('Cannot find Ballerina extension');
		return;
	}

	// Activate Ballerina extension if not activated
	if (!ballerinaExt.isActive) {
		ballerinaExt.activate().then(() => {
			let workspaceUri = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri : null;
			// @ts-ignore
			ballerinaExt.exports.langClient.getBallerinaProjectComponents({
				documentIdentifiers: [{ uri: workspaceUri?.path + "/main.bal" }]
				// @ts-ignore
			}).then((componentResponse: BallerinaProjectComponents) => {
				console.log(componentResponse);
			});
			console.log('Ballerina extension activated');
		}, error => {
			console.error('Failed to activate Ballerina extension:', error);
		});
	}

	vscode.workspace.findFiles('**/Ballerina.toml', '**/node_modules/**', 1).then(files => {
		if (files.length > 0) {
			fs.readFile(files[0].fsPath, 'utf8', (err, data) => {
				if (err) {
					console.error(err);
					return;
				}
				if (data.includes('eggplant')) {
					vscode.commands.executeCommand('workbench.view.extension.eggplant');
					vscode.commands.executeCommand('eggplant.openLowCode');
				}
			});
		}
	});


}


export function deactivate() { }
