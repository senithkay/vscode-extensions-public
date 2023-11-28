import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { activateActivityBarWebViews } from './ActivityBar/activate';
import { ext } from './eggplantExtentionContext';
import { activateLowCodeWebViews } from './LowCode/activate';



// 1. load webview inside the activity bra and lowcode panels 
// 2. define a state machine 
// 3. render the overview 
// 4 render the lowcode view 

export function activate(context: vscode.ExtensionContext) {
	// Initialize the eggplant extention context so we do not need to pass the variables around
	ext.context = context;
	activateActivityBarWebViews(context);
	activateLowCodeWebViews(context);

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
