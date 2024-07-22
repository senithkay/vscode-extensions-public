/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { StateMachine } from './stateMachine';
import { extension } from './MIExtensionContext';
import { activate as activateHistory } from './history';
import { activateVisualizer } from './visualizer/activate';
import { activateAiPanel } from './ai-panel/activate';
import { RPCLayer } from './RPCLayer';

import { activateDebugger } from './debugger/activate';
import { activateMigrationSupport } from './migration';
import { activateRuntimeService } from './runtime-services-panel/activate';

export async function activate(context: vscode.ExtensionContext) {
	extension.context = context;
	
	// Latest root URL for MI Copilot backend
	const latestCopilotRootUrl = "https://e95488c8-8511-4882-967f-ec3ae2a0f86f-prod.e1-us-east-azure.choreoapis.dev/miaideployments/micopilot/mi-copilot-backend-be2/v1.0";
	
	const config = vscode.workspace.getConfiguration('MI');
	
	// Update the root URL if it is not the latest
	const currentRootUrl = config.get<string>('rootUrl');
	if (currentRootUrl !== latestCopilotRootUrl) {
		await config.update('rootUrl', latestCopilotRootUrl, vscode.ConfigurationTarget.Global);
	}

	RPCLayer.init();
	activateHistory();

	activateDebugger(context);
	activateMigrationSupport(context);
	// activateActivityPanel(context);
	// activateAiPrompt(context);
	activateRuntimeService(context);
	activateVisualizer(context);
	activateAiPanel(context);
	StateMachine.initialize();
}
