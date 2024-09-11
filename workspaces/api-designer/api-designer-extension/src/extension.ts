/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { StateMachine } from './stateMachine';
import { extension } from './APIDesignerExtensionContext';
import { activate as activateHistory } from './history';
import { activateVisualizer } from './visualizer/activate';
import { RPCLayer } from './RPCLayer';

export async function activate(context: vscode.ExtensionContext) {
	extension.context = context;
	checkDocumentForOpenAPI(vscode.window.activeTextEditor?.document);
	RPCLayer.init();
	activateHistory();
	activateVisualizer(context);
	StateMachine.initialize();
}

function checkDocumentForOpenAPI(document?: vscode.TextDocument) {
	if (document) {
		// check if document is yaml or json
		const fileName = document.fileName;
		if (fileName.endsWith('.yaml') || fileName.endsWith('.yml') || fileName.endsWith('.json')) {
			// check if document contains openapi
			const fileContent = document.getText();
			const isOpenAPI = fileContent.includes('openapi');
			vscode.commands.executeCommand('setContext', 'isFileOpenAPI', isOpenAPI);
		} else {
			vscode.commands.executeCommand('setContext', 'isFileOpenAPI', false);
		}
	}
}
