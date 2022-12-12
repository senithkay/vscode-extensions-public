/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
import * as vscode from 'vscode';
import { ThemeIcon, window } from 'vscode';
import { activateAuth } from './auth';
import { exchangeOrgAccessTokens } from './auth/inbuilt-impl';
import { ChoreoExtensionApi } from './ChoreoExtensionApi';
import { choreoAccountTreeId, choreoProjectsTreeId, cloneComponentCmdId, refreshProjectsListCmdId, setSelectedOrgCmdId } from './constants';
import { ext } from './extensionVariables';
import { AccountTreeProvider } from './views/account/AccountTreeProvider';
import { ChoreoOrgTreeItem } from './views/account/ChoreoOrganizationTreeItem';
import { ChoreoComponentTreeItem } from './views/project-tree/ComponentTreeItem';
import { ProjectsTreeProvider } from './views/project-tree/ProjectTreeProvider';

export function activate(context: vscode.ExtensionContext) {
	ext.isPluginStartup = true;
	ext.context = context;
	ext.api = new ChoreoExtensionApi();
	setupEvents();
	ext.projectsTreeView = createProjectTreeView();
	ext.accountTreeView = createAccountTreeView();
	activateAuth();
	ext.isPluginStartup = false;
	return ext.api;
}


function createProjectTreeView() {
	const choreoResourcesProvider = new ProjectsTreeProvider();
	vscode.commands.registerCommand(refreshProjectsListCmdId, async () => {
		choreoResourcesProvider.refresh();
	});
	vscode.commands.registerCommand(cloneComponentCmdId, async (treeItem) => {
		if (treeItem instanceof ChoreoComponentTreeItem) {
			const { repository } = treeItem.component;
			const { isUserManage, organizationApp, nameApp } = repository;
			if (isUserManage) {
				const mockDelay = () => {
					return new Promise((resolve) => {
						setTimeout(() => { resolve(true); }, 3000);
					});
				};
				await window.withProgress({
                    title: `Cloning ${organizationApp}/${nameApp} repo locally.`,
                    location: vscode.ProgressLocation.Notification,
                    cancellable: true
                }, async (_progress, cancellationToken) => {
                    cancellationToken.onCancellationRequested(async () => {
                        // TODO: Cancel
                    });
                    await mockDelay();
                });
			} else {
				vscode.window.showErrorMessage(`Cannot clone Choreo managed repository.`);
			}
		}
	});
    return window.createTreeView(choreoProjectsTreeId, {
        treeDataProvider: choreoResourcesProvider, showCollapseAll: true
    });
}


function createAccountTreeView() {

	const accountTreeProvider = new AccountTreeProvider();
	vscode.commands.registerCommand(setSelectedOrgCmdId, async (treeItem) => {
		if (treeItem instanceof ChoreoOrgTreeItem) {
			treeItem.iconPath = new ThemeIcon('loading~spin');
			accountTreeProvider.refresh(treeItem);
			await exchangeOrgAccessTokens(treeItem.org.handle);
			ext.api.selectedOrg = treeItem.org;
		}
	});
    return window.createTreeView(choreoAccountTreeId, {
        treeDataProvider: accountTreeProvider, showCollapseAll: false
    });

	
}

function setupEvents() {
	const subscription: vscode.Disposable = ext.api.onStatusChanged(async (newStatus) => {
		vscode.commands.executeCommand("setContext", "choreoLoginStatus", newStatus);
	});
	ext.context.subscriptions.push(subscription);
}


export function deactivate() {}
