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
import { SHARED_COMMANDS, BI_COMMANDS } from '@wso2-enterprise/ballerina-core';
import { extension } from '../biExtentionContext';

export function activateProjectExplorer(context: ExtensionContext, isBI: boolean) {
	if (extension.langClient) {
		commands.executeCommand('setContext', 'BI.status', 'loading');
	}
	const projectExplorerDataProvider = new ProjectExplorerEntryProvider(isBI);
	const projectTree = window.createTreeView(BI_COMMANDS.PROJECT_EXPLORER, { treeDataProvider: projectExplorerDataProvider });
	if (isBI) {
		commands.registerCommand(BI_COMMANDS.REFRESH_COMMAND, () => { projectExplorerDataProvider.refresh(); });
		commands.executeCommand(BI_COMMANDS.FOCUS_PROJECT_EXPLORER);
		commands.executeCommand(SHARED_COMMANDS.SHOW_VISUALIZER);
		commands.executeCommand('setContext', 'BI.project', true);
	}
	projectTree.onDidChangeVisibility(res => {
		if (res.visible) {
			if (isBI) {
				projectExplorerDataProvider.refresh();
			} else {
				if (extension.langClient) {
					commands.executeCommand('setContext', 'BI.status', 'unknownProject');
				}
				commands.executeCommand(SHARED_COMMANDS.OPEN_BI_WELCOME);
			}
		}
	});
	context.subscriptions.push(workspace.onDidDeleteFiles(() => {
		projectExplorerDataProvider.refresh();
	}));
}
