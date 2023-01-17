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
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as os from 'os';
import path = require('path');
import { simpleGit } from 'simple-git';
import { commands, ProgressLocation, TreeItem, Uri, window, workspace } from 'vscode';
import { Component, Project, Repository, WorkspaceConfig } from '@wso2-enterprise/choreo-core';
import { ext } from '../extensionVariables';
import { ChoreoProjectTreeItem } from './../views/project-tree/ProjectTreeItem';
import { projectClient } from "./../auth/auth";
import { ProjectRegistry } from '../registry/project-registry';

export const cloneProject = async (project: Project) => {
    const workspaceName = workspace.name;
    const workspaceFolders = workspace.workspaceFolders;
    const isWorkspaceExist = workspaceName || workspaceFolders;

    const { id, name: projectName } = project;
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
            window.showErrorMessage('A folder must be selected to start cloning');
            return;
        }

        const parentPath = parentDirs[0].fsPath;
        const workspacePath = path.join(parentPath, projectName);
        if (existsSync(workspacePath)) {
            // TODO: Optimize the UX. eg: prompt again to change selected path or generate
            // a suffix for the project name
            window.showErrorMessage('A folder already exists at ' + workspacePath);
            return;
        }

        mkdirSync(workspacePath);
        
        // Get Mono Repo if configured
        const monoRepo = ProjectRegistry.getInstance().getProjectRepository(project.id);

        const workspaceFile: WorkspaceConfig = {
            folders: [{
                name: "choreo-project-root",
                path: "."
            }],
            metadata: {
                choreo: {
                    projectID: id,
                    orgId: selectedOrg.id,
                    monoRepo: monoRepo
                }
            }
        };

        await window.withProgress({
            title: `Cloning ${projectName} components to workspace.`,
            location: ProgressLocation.Notification,
            cancellable: true
        }, async (_progress, cancellationToken) => {
            let cancelled: boolean = false;
            let currentCloneIndex = 0;

            cancellationToken.onCancellationRequested(async () => {
                cancelled = true;
            });

            const components = await projectClient.getComponents({ orgHandle: selectedOrg.handle, projId: id });
            const userManagedComponents = components.filter((cmp) => cmp.repository && cmp.repository.isUserManage);
            const repos = components.map((cmp) => cmp.repository);

            const choreoManagedRepos = repos.filter((repo) => repo && !repo.isUserManage);
            const userManagedRepos = userManagedComponents.map((cmp) => cmp.repository);
            const userManagedReposWithoutDuplicates: Repository[] = [];

            userManagedRepos.forEach(repo => {
                if (repo && !userManagedReposWithoutDuplicates.find((tarRepo) => tarRepo.organizationApp === repo.organizationApp && tarRepo.nameApp === repo.nameApp)) {
                    userManagedReposWithoutDuplicates.push(repo);
                }
            });

            const folders = userManagedComponents.map(({ name, repository }) => {
                if (repository) {
                    const { organizationApp, nameApp, appSubPath } = repository;
                    return {
                        name: name,
                        path: appSubPath ? path.join("repos", organizationApp, nameApp, appSubPath) : nameApp
                    };
                } else {
                    // TODO: Make repository mandatory in the interface and get rid of this case
                    return {
                        name: name,
                        path: path.join("repos", name)
                    };
                }
            });
            workspaceFile.folders.push(...folders);


            const workspaceFileName = `${projectName}.code-workspace`;
            const workspaceFilePath = path.join(workspacePath, workspaceFileName);

            writeFileSync(workspaceFilePath, JSON.stringify(workspaceFile));

            while (!cancelled && currentCloneIndex < userManagedReposWithoutDuplicates.length) {
                const { organizationApp, nameApp, branchApp } = userManagedReposWithoutDuplicates[currentCloneIndex];
                const repoOrgPath = path.join(workspacePath, "repos", organizationApp);
                mkdirSync(repoOrgPath, { recursive: true });
                const _result = await simpleGit().clone(`git@github.com:${organizationApp}/${nameApp}.git`, path.join(repoOrgPath, nameApp), ["--recursive", "--branch", branchApp]);
                currentCloneIndex = currentCloneIndex + 1;
            }

            // Clone mono repo if not already cloned
            if (monoRepo) {
                const monoRepoSplit = monoRepo.split("/");
                if (monoRepoSplit.length === 2 && !existsSync(path.join(workspacePath, "repos", monoRepoSplit[0], monoRepoSplit[1]))) {
                    const repoOrgPath = path.join(workspacePath, "repos", monoRepoSplit[0]);
                    mkdirSync(repoOrgPath, { recursive: true });
                    const monoRepoURL = `git@github.com:${monoRepo}.git`;
                    const _result = await simpleGit().clone(monoRepoURL, path.join(repoOrgPath, monoRepoSplit[1]), ["--recursive"]);
                }
            }

            // Register the project location in registry
            ProjectRegistry.getInstance().setProjectLocation(id, workspaceFilePath);

            await commands.executeCommand("vscode.openFolder", Uri.file(workspaceFilePath));
            await commands.executeCommand("workbench.explorer.fileView.focus");

            if (choreoManagedRepos.length > 0) {
                console.log(`Could not clone ${choreoManagedRepos.length} Choreo managed repos.\n`);
            }
        });
    }
};

export const cloneComponentCmd = async (component: Component) => {

    const { repository } = component;
    if (!repository) {
        window.showErrorMessage(`Cannot clone repository.`);
        return;
    }
    const { isUserManage, organizationApp, nameApp } = repository;

    if (isUserManage) {

        await window.withProgress({
            title: `Cloning ${organizationApp}/${nameApp} repo locally.`,
            location: ProgressLocation.Notification,
            cancellable: true
        }, async (_progress, cancellationToken) => {

            cancellationToken.onCancellationRequested(async () => {
                // TODO: Cancel
            });

            await commands.executeCommand("git.clone", `https://github.com/${organizationApp}/${nameApp}`);
        });

    } else {
        window.showErrorMessage(`Cannot clone Choreo managed repository.`);
    }

};
