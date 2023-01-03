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
import * as os from 'os';
import * as vscode from 'vscode';
import { ThemeIcon, Uri, window, extensions } from 'vscode';
import { simpleGit } from 'simple-git';
import { getComponentsByProject } from './api/queries';
import { activateAuth } from './auth';
import { exchangeOrgAccessTokens } from './auth/inbuilt-impl';
import { ChoreoExtensionApi } from './ChoreoExtensionApi';
import { choreoAccountTreeId, choreoProjectsTreeId, cloneAllComponentsCmdId, cloneComponentCmdId, refreshProjectsListCmdId, setSelectedOrgCmdId } from './constants';
import { ext } from './extensionVariables';
import { GitExtension } from './git';
import { AccountTreeProvider } from './views/account/AccountTreeProvider';
import { ChoreoOrgTreeItem } from './views/account/ChoreoOrganizationTreeItem';
import { ChoreoComponentTreeItem } from './views/project-tree/ComponentTreeItem';
import { ChoreoProjectTreeItem } from './views/project-tree/ProjectTreeItem';
import { ProjectsTreeProvider } from './views/project-tree/ProjectTreeProvider';
import path = require('path');
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { Repository, WorkspaceConfig } from './api/types';
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

	vscode.commands.registerCommand(cloneAllComponentsCmdId, async (treeItem) => {
		if (treeItem instanceof ChoreoProjectTreeItem) {

			const workspaceName = vscode.workspace.name;
			const workspaceFolders = vscode.workspace.workspaceFolders;
			const isWorkspaceExist = workspaceName || workspaceFolders;

			const { id, name: projectName } = treeItem.project;
			const selectedOrg = ext.api.selectedOrg;
			
			if (selectedOrg) {
				const parentDirs = await window.showOpenDialog({
					canSelectFiles: false,
					canSelectFolders: true,
					canSelectMany: false,
					defaultUri: Uri.file(os.homedir()),
					title: "Select a folder to create the Workspace"
				});

				if (!parentDirs || parentDirs.length === 0) {
					vscode.window.showErrorMessage('A folder must be selected to start cloning');
					return;
				}

				const parentPath = parentDirs[0].fsPath;
				const workspacePath = path.join(parentPath, projectName);
				if (existsSync(workspacePath)) {
					// TODO: Optimize the UX. eg: prompt again to change selected path or generate
					// a suffix for the project name
					vscode.window.showErrorMessage('A folder already exists at ' + workspacePath);
					return;
				}

				mkdirSync(workspacePath);
				
				const workspaceFile: WorkspaceConfig = {
					folders: []
				};
				
				await window.withProgress({
					title: `Cloning ${projectName} components to workspace.`,
					location: vscode.ProgressLocation.Notification,
					cancellable: true
				}, async (_progress, cancellationToken) => {
					let cancelled: boolean = false;
					let currentCloneIndex = 0;

					cancellationToken.onCancellationRequested(async () => {
						cancelled = true;
					});
					const components = await getComponentsByProject(selectedOrg.handle, id);
					const userManagedComponents = components.filter((cmp) => cmp.repository.isUserManage);
					const repos = components.map((cmp) => cmp.repository);

					const choreoManagedRepos = repos.filter((repo) => !repo.isUserManage);
					const userManagedRepos = userManagedComponents.map((cmp) => cmp.repository);
					const userManagedReposWithoutDuplicates: Repository[] = [];

					userManagedRepos.forEach(repo => {
						if (!userManagedReposWithoutDuplicates.find((tarRepo) => tarRepo.organizationApp === repo.organizationApp && tarRepo.nameApp === repo.nameApp)) {
							userManagedReposWithoutDuplicates.push(repo);
						}
					});

					workspaceFile.folders = userManagedComponents.map(({ name, repository: { appSubPath, nameApp }}) => ({
						name: name,
						path: appSubPath ? path.join(nameApp, appSubPath) : nameApp
					}));
					const workspaceFileName = `${projectName}.code-workspace`;
					const workspaceFilePath = path.join(workspacePath, workspaceFileName);

					writeFileSync(workspaceFilePath, JSON.stringify(workspaceFile));

					while (!cancelled && currentCloneIndex < userManagedReposWithoutDuplicates.length) {
						const { organizationApp, nameApp, branchApp } = userManagedReposWithoutDuplicates[currentCloneIndex];
						const _result = await simpleGit().clone(`git@github.com:${organizationApp}/${nameApp}.git`, path.join(workspacePath, nameApp), ["--recursive", "--branch", branchApp]);
						currentCloneIndex = currentCloneIndex + 1;
					}

					await vscode.commands.executeCommand("vscode.openFolder", Uri.file(workspaceFilePath));
					await vscode.commands.executeCommand("workbench.explorer.fileView.focus");

					if (choreoManagedRepos.length > 0) {
						console.log(`Could not clone ${choreoManagedRepos.length} Choreo managed repos.\n`);
					}

				});

			}
		}
	});

	vscode.commands.registerCommand(cloneComponentCmdId, async (treeItem) => {
		if (treeItem instanceof ChoreoComponentTreeItem) {

			const { repository } = treeItem.component;
			const { isUserManage, organizationApp, nameApp } = repository;

			if (isUserManage) {

				await window.withProgress({
					title: `Cloning ${organizationApp}/${nameApp} repo locally.`,
					location: vscode.ProgressLocation.Notification,
					cancellable: true
				}, async (_progress, cancellationToken) => {

					cancellationToken.onCancellationRequested(async () => {
						// TODO: Cancel
					});

					await vscode.commands.executeCommand("git.clone", `https://github.com/${organizationApp}/${nameApp}`);
				});

			} else {
				vscode.window.showErrorMessage(`Cannot clone Choreo managed repository.`);
			}
		}
	});

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
			await exchangeOrgAccessTokens(treeItem.org.handle);
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
