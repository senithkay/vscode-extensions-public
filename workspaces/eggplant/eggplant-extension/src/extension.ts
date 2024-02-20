import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { activateActivityBarWebViews } from './activity-panel/activate';
import { ext } from './eggplantExtentionContext';
import { activateLowCodeWebViews } from './visualizer/activate';
import { StateMachine } from './stateMachine';



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

	StateMachine.initialize();
}


export function deactivate() { }
