/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { StateMachine } from '../stateMachine';
import { ProjectExplorerEntryProvider } from './project-explorer-provider';
import { ExtensionContext, commands, window, workspace } from 'vscode';
import { SHARED_COMMANDS, EGGPLANT_COMMANDS } from '@wso2-enterprise/ballerina-core';

export function activateProjectExplorer(context: ExtensionContext, isEggplant: boolean) {
	commands.executeCommand('setContext', 'Eggplant.status', 'loading');
	const projectExplorerDataProvider = new ProjectExplorerEntryProvider(isEggplant);
	const projectTree = window.createTreeView(EGGPLANT_COMMANDS.PROJECT_EXPLORER, { treeDataProvider: projectExplorerDataProvider });
	if (isEggplant) {
		commands.registerCommand(EGGPLANT_COMMANDS.REFRESH_COMMAND, () => { projectExplorerDataProvider.refresh(); });
		commands.executeCommand(EGGPLANT_COMMANDS.FOCUS_PROJECT_EXPLORER);
		commands.executeCommand(SHARED_COMMANDS.SHOW_VISUALIZER);
	}
	projectTree.onDidChangeVisibility(res => {
		if (res.visible) {
			if (isEggplant) {
				commands.executeCommand(EGGPLANT_COMMANDS.REFRESH_COMMAND);
			} else {
				commands.executeCommand('setContext', 'Eggplant.status', 'unknownProject');
				commands.executeCommand(SHARED_COMMANDS.OPEN_EGGPLANT_WELCOME);
			}
		}
	});
	context.subscriptions.push(workspace.onDidDeleteFiles(() => {
		projectExplorerDataProvider.refresh();
	}));
}
