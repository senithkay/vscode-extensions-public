import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { activateActivityBarWebViews } from './activity-panel/activate';
import { extension } from './eggplantExtentionContext';
import { activateLowCodeWebViews } from './visualizer/activate';
import { StateMachine } from './stateMachine';
import { RPCLayer } from './RPCLayer';



// 1. Render the low code diagram in the webview
// 2. pass ls to eggplant extention
// 3. define state machine 
// 4. populate overview
// 5. populate diagram
// 6. define editing

export function activate(context: vscode.ExtensionContext) {
	// Initialize the eggplant extention context so we do not need to pass the variables around
	extension.context = context;
	RPCLayer.init();
	activateActivityBarWebViews(context);
	activateLowCodeWebViews(context);

	StateMachine.initialize();
	
	const ballerinaExt = vscode.extensions.getExtension('wso2.ballerina');
	if (!ballerinaExt) {
		vscode.window.showErrorMessage('Ballerina extension is required to operate Eggplant extension effectively. Please install it from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=wso2.ballerina).');
	} 
}


export function deactivate() { }
