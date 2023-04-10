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
import { ThemeIcon, window, extensions, ProgressLocation } from 'vscode';

import { activateAuth } from './auth';
import { CHOREO_AUTH_ERROR_PREFIX, exchangeOrgAccessTokens, signIn } from './auth/auth';
import { ChoreoExtensionApi } from './ChoreoExtensionApi';
import { cloneProject, cloneRepoToCurrentProjectWorkspace } from './cmds/clone';
import { choreoAccountTreeId, choreoProjectsTreeId, cloneAllComponentsCmdId, cloneRepoToCurrentProjectWorkspaceCmdId, refreshProjectsTreeViewCmdId, setSelectedOrgCmdId, STATUS_LOGGED_IN } from './constants';
import { ext } from './extensionVariables';
import { GitExtension } from './git';
import { activateRegistry } from './registry/activate';
import { activateStatusBarItem } from './status-bar';
import { activateURIHandlers } from './uri-handlers';
import { AccountTreeProvider } from './views/account/AccountTreeProvider';
import { ChoreoOrgTreeItem } from './views/account/ChoreoOrganizationTreeItem';
import { ProjectsTreeProvider } from './views/project-tree/ProjectTreeProvider';

import { activateWizards } from './wizards/activate';

import { getLogger, initLogger } from "./logger/logger";
import { choreoSignInCmdId } from './constants';

export function activateBallerinaExtension() {
	const ext = extensions.getExtension("wso2.ballerina");
	if (ext && !ext.isActive) {
		ext.activate();
	}
}

export async function activate(context: vscode.ExtensionContext) {
	await initLogger(context);
  	getLogger().debug("Activating Choreo Extension");
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
	activateURIHandlers();
	showChoreoProjectOverview();
	activateStatusBarItem();
	activateRegistry();
	getLogger().debug("Choreo Extension activated");
	return ext.api;
}

export async function showChoreoProjectOverview() {
	getLogger().debug("Show Choreo Project Overview if a Choreo project is opened.");
	const isChoreoProject = await ext.api.isChoreoProject();
	if (isChoreoProject) {
		getLogger().debug("Choreo project is opened. Showing Choreo Project Overview.");
		await window.withProgress({
            title: `Opening Choreo Project Workspace.`,
            location: ProgressLocation.Notification,
            cancellable: true
        }, async (_progress, cancellationToken) => {
            let cancelled: boolean = false;

            cancellationToken.onCancellationRequested(async () => {
				getLogger().debug("Choreo Project Overview loading cancelled.");
                cancelled = true;
            });
			// execute choreo project overview cmd
			try {
				getLogger().debug("Loading Choreo Project Metadata.	");
				// first sign in to Choreo
				const isLoggedIn = await ext.api.waitForLogin();
				if (!isLoggedIn) {
					//TODO: Prompt to sign in as the opened Choreo project is not accessible
					getLogger().debug("Choreo Project Overview loading cancelled as the user is not logged in.");
					window.showInformationMessage("Current workspace is a Choreo project. Please sign in to Choreo to view the project overview.", "Sign In").then((selection) => {
						if (selection === "Sign In") {
							vscode.commands.executeCommand(choreoSignInCmdId);
						}
					});
					return;
				}
				// TODO: Check if the Choreo project is accessible by the logged in user using the access token
				// for current organization, prompt and change the organization if needed
				if (cancelled) {
					return;
				}
				const project = await ext.api.getChoreoProject();
				if (cancelled) {
					return;
				}
				getLogger().debug("Choreo Project Metadata loaded. Opening Choreo Project Overview.");
				if (project) {
					vscode.commands.executeCommand("wso2.choreo.project.overview", project);
				}
			} catch (error: any) {
				getLogger().error("Error while loading Choreo project overview. " + error.message);
				window.showErrorMessage("Error while loading Choreo project overview. " + error.message);
			}
		});
		
	}
}


export function getGitExtensionAPI() {
	getLogger().debug("Getting Git Extension API");
	const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')!.exports;
	return gitExtension.getAPI(1);
}


function createProjectTreeView() {
	getLogger().debug("Creating Choreo Projects Tree View");
	const choreoResourcesProvider = new ProjectsTreeProvider();
	ext.projectsTreeProvider = choreoResourcesProvider;

	vscode.commands.registerCommand(refreshProjectsTreeViewCmdId, () => {
		choreoResourcesProvider.refresh();
	});

	vscode.commands.registerCommand(cloneAllComponentsCmdId, cloneProject);
	vscode.commands.registerCommand(cloneRepoToCurrentProjectWorkspaceCmdId, cloneRepoToCurrentProjectWorkspace);

	const treeView = window.createTreeView(choreoProjectsTreeId, {
		treeDataProvider: choreoResourcesProvider, showCollapseAll: true
	});

	ext.context.subscriptions.push(ext.api.onOrganizationChanged((newOrg) => {
		treeView.description = newOrg?.name;
	}));

	return treeView;
}


function createAccountTreeView() {
	getLogger().debug("Creating Choreo Account Tree View");
	const accountTreeProvider = new AccountTreeProvider();
	vscode.commands.registerCommand(setSelectedOrgCmdId, async (treeItem) => {
		getLogger().debug("Setting selected organization to " + treeItem.org.name);
		if (treeItem instanceof ChoreoOrgTreeItem) {
			treeItem.iconPath = new ThemeIcon('loading~spin');
			accountTreeProvider.refresh(treeItem);
			try {
				getLogger().debug("Exchanging access tokens for the organization " + treeItem.org.name);
				await exchangeOrgAccessTokens(treeItem.org.handle);
			} catch (error: any) {
				getLogger().error("Error while exchanging access tokens for the organization " + treeItem.org.name + ". " + error.message);
				vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + " Error while exchanging access tokens for the organization " + treeItem.org.name + ". " + error.message);
			}
			ext.api.selectedOrg = treeItem.org;
		}
	});

	const treeView = window.createTreeView(choreoAccountTreeId, {
		treeDataProvider: accountTreeProvider, showCollapseAll: false
	});

	ext.context.subscriptions.push(ext.api.onStatusChanged((newStatus) => {
		getLogger().debug("Updating Choreo Account Tree View description based on the new status " + newStatus);
		let description = '';
		if (newStatus === STATUS_LOGGED_IN && ext.api.userName) {
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
