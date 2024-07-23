/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { COMMANDS, VIEWS } from '../constants';
import { ProjectExplorerEntryProvider } from './project-explorer-provider';
import { ExtensionContext, commands, window } from 'vscode';

export function activateProjectExplorer(context: ExtensionContext) {
	const projectExplorerDataProvider = new ProjectExplorerEntryProvider();
	const projectTree = window.createTreeView(VIEWS.PROJECT_EXPLORER, { treeDataProvider: projectExplorerDataProvider });
	commands.registerCommand(COMMANDS.REFRESH_COMMAND, () => { projectExplorerDataProvider.refresh(); });
	commands.executeCommand(COMMANDS.FOCUS_PROJECT_EXPLORER);
}
