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
import { commands, ProgressLocation, Uri, window, workspace } from 'vscode';
import { Component, Project, RepoCloneRequestParams, Repository, WorkspaceConfig } from '@wso2-enterprise/choreo-core';
import { ext } from '../extensionVariables';
import { projectClient } from "./../auth/auth";
import { ProjectRegistry } from '../registry/project-registry';
import { getLogger } from '../logger/logger';
import { execSync } from 'child_process';
import { initGit } from '../git/main';

export function checkSSHAccessToGitHub() {
    try {
        execSync("ssh -T git@github.com -o \"StrictHostKeyChecking no\"");
        return true;
    } catch (error: any) {
        if (error.message && error.message.includes("You've successfully authenticated")) {
            return true;
        }
        window.showErrorMessage('Cannot access GitHub via SSH. Please check your SSH keys.');
        getLogger().error("Error while checking SSH access to GitHub: " + error);
        return false;
    }
}

export const cloneRepoToCuurentProjectWorkspace = async (params: RepoCloneRequestParams) => {
    const { repository, branch, workspaceFilePath } = params;
    let success = false;
    await window.withProgress({
        title: `Cloning ${repository} repository to Choreo project workspace.`,
        location: ProgressLocation.Notification,
        cancellable: true
    }, async (progress, cancellationToken) => {
        let cancelled: boolean = false;
        cancellationToken.onCancellationRequested(async () => {
            getLogger().debug("Cloning cancelled for " + repository);
            cancelled = true;
        });
        if (!ext.api.isChoreoProject()) {
            getLogger().error("Cannot clone repository to a non-Choreo project");
            window.showErrorMessage('Current workspace is not a Choreo project. Please open a Choreo project to clone a repository.');
            return;
        }
        const projectDir = path.dirname(workspaceFilePath);
        const repoPath = path.join(projectDir, 'repos', repository);
        if (!existsSync(path.dirname(repoPath))) {
            mkdirSync(path.dirname(repoPath), { recursive: true });
            getLogger().debug("Created org directory: " + path.dirname(repoPath));
        }
        if (existsSync(repoPath)) {
            getLogger().debug("Repository already exists: " + repoPath);
            window.showErrorMessage('Repository already exists: ' + repoPath);
            return;
        }
        getLogger().debug("Cloning repository: " + repository + " to " + repoPath);
        if (cancelled) {
            return;
        }
        const git = await initGit(ext.context);
        if (git) {
            await git.clone(`https://github.com/${repository}.git`, { recursive: true, ref: branch, parentPath: path.dirname(repoPath), progress }, cancellationToken);        
            // const _result = await simpleGit().clone(`git@github.com:${repository}.git`, repoPath, ["--recursive", "--branch", branch]);
            getLogger().debug("Cloned repository: " + repository + " to " + repoPath);
            success = true;
        } else {
            getLogger().error("Git was not initialized"); 
        }
    });
    return success;
};



export const cloneProject = async (project: Project) => {
    getLogger().debug("Cloning project: " + project.name);
    const workspaceName = workspace.name;
    const workspaceFolders = workspace.workspaceFolders;
    const isWorkspaceExist = workspaceName || workspaceFolders;

    const { id, name: projectName } = project;
    const selectedOrg = ext.api.selectedOrg;

    if (selectedOrg) {
        getLogger().debug("getting folder path to clone project: " + project.name);
        const parentDirs = await window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            defaultUri: Uri.file(os.homedir()),
            title: "Select a folder to create the Workspace"
        });

        if (!parentDirs || parentDirs.length === 0) {
            getLogger().debug("No folder selected to clone project: " + project.name);
            window.showErrorMessage('A folder must be selected to start cloning');
            return;
        }

        const parentPath = parentDirs[0].fsPath;
        const workspacePath = path.join(parentPath, projectName);
        getLogger().debug("folder path to clone project: " + project.name + " is " + workspacePath);
        if (existsSync(workspacePath)) {
            // TODO: Optimize the UX. eg: prompt again to change selected path or generate
            // a suffix for the project name
            getLogger().error("A folder already exists at " + workspacePath);
            window.showErrorMessage('A folder already exists at ' + workspacePath);
            return;
        }
        getLogger().debug("creating folder to clone project: " + project.name + " at " + workspacePath);
        mkdirSync(workspacePath);
        
        // Get Mono Repo if configured
        const monoRepo = ProjectRegistry.getInstance().getProjectRepository(project.id);
        if (monoRepo) {
            getLogger().debug("Mono Repo configured for project: " + project.name + " at " + monoRepo);
        }

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
            getLogger().debug("Starting cloning project: " + project.name);
            let cancelled: boolean = false;
            let currentCloneIndex = 0;

            cancellationToken.onCancellationRequested(async () => {
                getLogger().debug("Cloning cancelled for project: " + project.name);
                cancelled = true;
            });

            const components = await projectClient.getComponents({ orgHandle: selectedOrg.handle, projId: id });
            const userManagedComponents = components.filter((cmp) => cmp.repository && cmp.repository.isUserManage);
            const repos = components.map((cmp) => cmp.repository);

            const choreoManagedRepos = repos.filter((repo) => repo && !repo.isUserManage);
            const userManagedRepos = userManagedComponents.map((cmp) => cmp.repository);
            const userManagedReposWithoutDuplicates: Repository[] = [];
            
            if (choreoManagedRepos.length > 0) {
                getLogger().error("Cloning is omitted for : " + choreoManagedRepos.length + " components as they are managed by Choreo");
                getLogger().debug("Cloning is omitted for : " + choreoManagedRepos.map((cMR) => cMR ? (cMR.organizationApp + "/" + cMR.nameApp) : '').join("\n "));
            }

            getLogger().debug("Cloning " + userManagedRepos.length + " components");

            userManagedRepos.forEach(repo => {
                if (repo && !userManagedReposWithoutDuplicates.find((tarRepo) => tarRepo.organizationApp === repo.organizationApp && tarRepo.nameApp === repo.nameApp)) {
                    userManagedReposWithoutDuplicates.push(repo);
                }
            });

            getLogger().debug("Cloning " + userManagedReposWithoutDuplicates.length + " repositories without duplicates");

            const folders = userManagedComponents.map(({ name, repository }) => {
                if (repository) {
                    const { organizationApp, nameApp, appSubPath } = repository;
                    const rootPath = path.join("repos", organizationApp, nameApp);
                    return {
                        name: name,
                        path: appSubPath ? path.join(rootPath, appSubPath) : rootPath
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

            writeFileSync(workspaceFilePath, JSON.stringify(workspaceFile, null, 4));
            getLogger().info("Workspace file created at " + workspaceFilePath);
            getLogger().debug("Workspace file content: " + JSON.stringify(workspaceFile));

            while (!cancelled && currentCloneIndex < userManagedReposWithoutDuplicates.length) {
                const { organizationApp, nameApp, branchApp } = userManagedReposWithoutDuplicates[currentCloneIndex];
                const repoOrgPath = path.join(workspacePath, "repos", organizationApp);
                getLogger().info("Cloning " + organizationApp + "/" + nameApp + " to " + repoOrgPath);
                mkdirSync(repoOrgPath, { recursive: true });
                await window.withProgress({
                    title: `Cloning ${organizationApp}/${nameApp} repository to Choreo project workspace.`,
                    location: ProgressLocation.Notification,
                    cancellable: true
                }, async (progress, cancellationToken) => {
                    const git = await initGit(ext.context);
                    if (git) {
                        await git.clone(`https://github.com/${organizationApp}/${nameApp}.git`, { recursive: true, ref: branchApp, parentPath: repoOrgPath, progress }, cancellationToken);        
                        // const _result = await simpleGit().clone(`git@github.com:${repository}.git`, repoPath, ["--recursive", "--branch", branch]);
                        getLogger().debug("Cloned " + organizationApp + "/" + nameApp + " to " + repoOrgPath);
                    } else {
                        getLogger().error("Git was not initialized"); 
                    }
                });
                currentCloneIndex = currentCloneIndex + 1;
            }

            // Clone mono repo if not already cloned
            if (monoRepo) {
                const monoRepoSplit = monoRepo.split("/");
                if (monoRepoSplit.length === 2 && !existsSync(path.join(workspacePath, "repos", monoRepoSplit[0], monoRepoSplit[1]))) {
                    const repoOrgPath = path.join(workspacePath, "repos", monoRepoSplit[0]);
                    getLogger().info("Cloning Mono Repo " + monoRepo + " to " + repoOrgPath);
                    mkdirSync(repoOrgPath, { recursive: true });
                    const monoRepoURL = `git@github.com:${monoRepo}.git`;
                    const _result = await simpleGit().clone(monoRepoURL, path.join(repoOrgPath, monoRepoSplit[1]), ["--recursive"]);
                    getLogger().debug("Cloned Mono Repo " + monoRepo + " to " + repoOrgPath);
                }
            }

            getLogger().debug("Cloning completed for project: " + project.name);
            // Register the project location in registry
            ProjectRegistry.getInstance().setProjectLocation(id, workspaceFilePath);

            getLogger().debug("Opening workspace in current window: " + workspaceFilePath);
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
