/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as vscode from 'vscode';
import { ProjectView } from './ProjectView';
import { AccountView } from './AccountView';

export function activateActivityBarWebViews(context: vscode.ExtensionContext) {
	const projectViewProvider = new ProjectView(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ProjectView.viewType, projectViewProvider));

	const accountViewProvider = new AccountView(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(AccountView.viewType, accountViewProvider));
}
