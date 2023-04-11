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
import { commands, ProgressLocation, Uri, window } from 'vscode';
import { Component, Project, RepoCloneRequestParams, Repository, WorkspaceConfig, WorkspaceItem } from '@wso2-enterprise/choreo-core';
import { ext } from '../extensionVariables';
import { projectClient } from "./../auth/auth";
import { ProjectRegistry } from '../registry/project-registry';
import { getLogger } from '../logger/logger';
import { execSync } from 'child_process';
import { initGit } from '../git/main';
import { executeWithTaskRetryPrompt } from '../retry';

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

export const cloneRepoToCurrentProjectWorkspace = async (params: RepoCloneRequestParams) => {
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
            await executeWithTaskRetryPrompt(() => git.clone(`https://github.com/${repository}.git`, { recursive: true, ref: branch, parentPath: path.dirname(repoPath), progress }, cancellationToken));        
            getLogger().debug("Cloned repository: " + repository + " to " + repoPath);
            success = true;
        } else {
            getLogger().error("Git was not initialized"); 
        }
    });
    return success;
};


export async function askProjectClonePath() {
    return await window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        defaultUri: Uri.file(os.homedir()),
        title: "Select a folder to create the Workspace"
    });
}

export async function createProjectDir(parentDir: string, project: Project): Promise<string> {
    const { name } = project;
    const projectDir = path.join(parentDir, name);
    if (existsSync(projectDir)) {
        // TODO: Optimize the UX. eg: prompt again to change selected path or overwrite or generate a new folder
        throw new Error("A folder already exists at " + projectDir);
    }
    mkdirSync(projectDir);
    // create choreo metadata file
    const projectMetadataFIle = path.join(projectDir, '.choreo-project');
    writeFileSync(projectMetadataFIle, JSON.stringify(project, null, 4));
    return projectDir;
}

export async function cloneRepositoryWithProgress(orgName: string, repoName: string, parentPath: string, ref?: string) {
    return await window.withProgress({
        title: `Cloning ${orgName}/${repoName} repository to Choreo project workspace.`,
        location: ProgressLocation.Notification,
        cancellable: true
    }, async (progress, cancellationToken) => {
        const git = await initGit(ext.context);
        if (git) {
            return await executeWithTaskRetryPrompt(() => git.clone(`https://github.com/${orgName}/${repoName}.git`, { recursive: true, ref, parentPath, progress }, cancellationToken));        
        } else {
            throw new Error("Git was not initialized."); 
        }
    });
}

export async function createProjectWorkspaceFile(projectName: string, projectID: string, orgId: number, projectDir: string, items: WorkspaceItem[], monoRepo?: string ) {
    const workspaceFile: WorkspaceConfig = {
        folders: [
            {
                name: "choreo-project-root",
                path: "."
            },
            ...items
        ],
        metadata: {
            choreo: {
                projectID,
                orgId: orgId,
                monoRepo
            }
        }
    };
    const workspaceFilePath = path.join(projectDir, `${projectName}.code-workspace`);
    writeFileSync(workspaceFilePath, JSON.stringify(workspaceFile, null, 4));
    return workspaceFilePath;
}


async function getProjectRepositories(orgHandle: string, projId: string, orgUuid: string) {
    const components = await executeWithTaskRetryPrompt(() => projectClient.getComponents({ orgHandle, projId, orgUuid }));
    const userManagedComponents = components.filter((cmp) => cmp.repository && cmp.repository.isUserManage);
    const repos = components.map((cmp) => cmp.repository);

    const choreoManagedRepos = repos.filter((repo) => repo && !repo.isUserManage);
    const userManagedRepos = userManagedComponents.map((cmp) => cmp.repository);

    if (choreoManagedRepos.length > 0) {
        getLogger().error("Cloning is omitted for : " + choreoManagedRepos.length + " components as they are managed by Choreo");
        getLogger().debug("Cloning is omitted for : " + choreoManagedRepos.map((cMR) => cMR ? (cMR.organizationApp + "/" + cMR.nameApp) : '').join("\n "));
    }

    getLogger().debug("Cloning " + userManagedRepos.length + " components");

    const userManagedReposWithoutDuplicates: Repository[] = [];

    userManagedRepos.forEach(repo => {
        if (repo && !userManagedReposWithoutDuplicates.find((tarRepo) => tarRepo.organizationApp === repo.organizationApp && tarRepo.nameApp === repo.nameApp)) {
            userManagedReposWithoutDuplicates.push(repo);
        }
    });
    return { userManagedReposWithoutDuplicates, userManagedComponents, choreoManagedRepos };
}


function generateWorkspaceItems(userManagedComponents: Component[]) {
    return userManagedComponents.filter(({ repository }) => (repository !== undefined)).map(({ name, repository }) => {
        const { organizationApp, nameApp, appSubPath } = repository as Repository;
        const rootPath = path.join("repos", organizationApp, nameApp);
        return {
            name: name,
            path: appSubPath ? path.join(rootPath, appSubPath) : rootPath
        };
    });
}

export const cloneProject = async (project: Project) => {
    await window.withProgress({
        title: `Cloning ${project.name} components to workspace.`,
        location: ProgressLocation.Notification,
        cancellable: true
    }, async (progress, cancellationToken) => {

        let cancelled: boolean = false;
        cancellationToken.onCancellationRequested(async () => {
            getLogger().debug("Cloning cancelled for project: " + project.name);
            cancelled = true;
        });

        getLogger().debug("Cloning project: " + project.name);

        const { id, name: projectName, orgId } = project;
        const selectedOrg = ext.api.selectedOrg;

        if (selectedOrg) {
            getLogger().debug("getting folder path to clone project: " + project.name);
            
            try {
                const selectedDir = await askProjectClonePath();
                if (!selectedDir || selectedDir.length === 0) {
                    getLogger().debug("No folder selected to clone project: " + project.name);
                    window.showErrorMessage('A folder must be selected to start cloning');
                    return;
                }

                const parentDir = selectedDir[0].fsPath;
                const projectDir = await createProjectDir(parentDir, project);

                getLogger().debug("folder path to clone project: " + projectName + " is " + projectDir);

                // Get Mono Repo if configured
                const monoRepo = ProjectRegistry.getInstance().getProjectRepository(project.id);
                if (monoRepo) {
                    getLogger().debug("Mono Repo configured for project: " + project.name + " at " + monoRepo);
                }


                getLogger().debug("Starting cloning project: " + project.name);

                progress.report({ message: "Retrieving details on component repositories of project: " + projectName });
                const { userManagedReposWithoutDuplicates, userManagedComponents, choreoManagedRepos } = await getProjectRepositories(selectedOrg.handle, id, selectedOrg.uuid);

                getLogger().debug("Cloning " + userManagedReposWithoutDuplicates.length + " repositories without duplicates");

                progress.report({ message: "Generating workspace file for the project: " + projectName });
                const folders = generateWorkspaceItems(userManagedComponents);

                const workspaceFilePath = await createProjectWorkspaceFile(projectName, id, selectedOrg.id, projectDir, folders, monoRepo);
                getLogger().debug("Workspace file created at " + workspaceFilePath);
                
                let currentCloneIndex = 0;
                while (!cancelled && currentCloneIndex < userManagedReposWithoutDuplicates.length) {
                    const { organizationApp, nameApp, branchApp } = userManagedReposWithoutDuplicates[currentCloneIndex];
                    const repoOrgPath = path.join(projectDir, "repos", organizationApp);
                    getLogger().info("Cloning " + organizationApp + "/" + nameApp + " to " + repoOrgPath);
                    const repoPath = await cloneRepositoryWithProgress(organizationApp, nameApp, repoOrgPath, branchApp);
                    getLogger().debug("Cloned " + organizationApp + "/" + nameApp + " to " + repoPath);
                    currentCloneIndex = currentCloneIndex + 1;
                }

                // Clone project mono repo if not already cloned
                if (monoRepo) {
                    const monoRepoSplit = monoRepo.split("/");
                    if (monoRepoSplit.length === 2 && !existsSync(path.join(projectDir, "repos", monoRepoSplit[0], monoRepoSplit[1]))) {
                        const parentDir = path.join(projectDir, "repos", monoRepoSplit[0]);
                        getLogger().info("Cloning " + monoRepoSplit[0] + "/" + monoRepoSplit[1] + " to " + parentDir);
                        const repoPath = await cloneRepositoryWithProgress(monoRepoSplit[0], monoRepoSplit[1], parentDir);
                        getLogger().debug("Cloned " + monoRepoSplit[0] + "/" + monoRepoSplit[1] + " to " + repoPath);
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
            } catch (error: any) {
                getLogger().error("Error while cloning project: " + project.name + " " + error);
                window.showErrorMessage(`Error while cloning project: ${project.name}. ${error.message}`);
            } 
        } else {
            getLogger().error("No organization selected to clone project: " + project.name);
            window.showErrorMessage('Check your organization selection and try again.');
        }
    });
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


