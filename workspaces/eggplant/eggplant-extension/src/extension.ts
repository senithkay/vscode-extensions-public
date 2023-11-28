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
