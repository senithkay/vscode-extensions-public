/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import * as vscode from 'vscode';
import { ThemeIcon, window, extensions } from 'vscode';

import { activateAuth } from './auth';
import { CHOREO_AUTH_ERROR_PREFIX, exchangeOrgAccessTokens } from './auth/auth';
import { ChoreoExtensionApi } from './ChoreoExtensionApi';
import { cloneAllComponentsCmd, cloneComponentCmd } from './cmds/clone';
import { choreoAccountTreeId, choreoProjectsTreeId, cloneAllComponentsCmdId, cloneComponentCmdId, refreshProjectsListCmdId, setSelectedOrgCmdId } from './constants';
import { ext } from './extensionVariables';
import { GitExtension } from './git';
import { AccountTreeProvider } from './views/account/AccountTreeProvider';
import { ChoreoOrgTreeItem } from './views/account/ChoreoOrganizationTreeItem';
import { ProjectsTreeProvider } from './views/project-tree/ProjectTreeProvider';

import { activateWizards } from './wizards/activate';

export function activateBallerinaExtension() {
	const ext = extensions.getExtension("wso2.ballerina");
	if (ext && !ext.isActive) {
		ext.activate();
	}
}

export function activate(context: vscode.ExtensionContext) {
	ext.isPluginStartup = true;
	ext.context = context;
	ext.api = new ChoreoExtensionApi();
	setupEvents();
	ext.projectsTreeView = createProjectTreeView();
	ext.accountTreeView = createAccountTreeView();
	activateAuth();
	ext.isPluginStartup = false;
	activateBallerinaExtension();
	activateWizards();
	return ext.api;
}


export function getGitExtensionAPI() {
	const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')!.exports;
	return gitExtension.getAPI(1);
}


function createProjectTreeView() {
	const choreoResourcesProvider = new ProjectsTreeProvider();

	vscode.commands.registerCommand(refreshProjectsListCmdId, async () => {
		choreoResourcesProvider.refresh();
	});

	vscode.commands.registerCommand(cloneAllComponentsCmdId, cloneAllComponentsCmd);

	vscode.commands.registerCommand(cloneComponentCmdId, cloneComponentCmd);

	const treeView = window.createTreeView(choreoProjectsTreeId, {
		treeDataProvider: choreoResourcesProvider, showCollapseAll: true
	});

	ext.context.subscriptions.push(ext.api.onOrganizationChanged((newOrg) => {
		treeView.description = newOrg?.name;
	}));

	return treeView;
}


function createAccountTreeView() {

	const accountTreeProvider = new AccountTreeProvider();
	vscode.commands.registerCommand(setSelectedOrgCmdId, async (treeItem) => {
		if (treeItem instanceof ChoreoOrgTreeItem) {
			treeItem.iconPath = new ThemeIcon('loading~spin');
			accountTreeProvider.refresh(treeItem);
			try {
				await exchangeOrgAccessTokens(treeItem.org.handle);
			} catch (error: any) {
				vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + " Error while exchanging access tokens for the organization " + treeItem.org.name + ". " + error.message);
			}
			ext.api.selectedOrg = treeItem.org;
		}
	});

	const treeView = window.createTreeView(choreoAccountTreeId, {
		treeDataProvider: accountTreeProvider, showCollapseAll: false
	});

	ext.context.subscriptions.push(ext.api.onStatusChanged((newStatus) => {
		let description = '';
		if (newStatus === "LoggedIn" && ext.api.userName) {
			description = ext.api.userName;
		}
		treeView.description = description;
	}));

	return treeView;
}

function setupEvents() {
	const subscription: vscode.Disposable = ext.api.onStatusChanged(async (newStatus) => {
		vscode.commands.executeCommand("setContext", "choreoLoginStatus", newStatus);
	});
	ext.context.subscriptions.push(subscription);
}


export function deactivate() { }
