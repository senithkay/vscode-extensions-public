/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, ProgressLocation, Uri, commands, window } from "vscode";
import { CommandIds, GitProvider } from "@wso2-enterprise/choreo-core";
import { ext } from "../extensionVariables";
import { getUserInfoForCmd, selectOrg, selectProject } from "./cmd-utils";
import { parseGitURL } from "../git/util";
import * as os from "os";
import { initGit } from "../git/main";

export function cloneRepoCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.CloneProject, async () => {
            try {
                const userInfo = await getUserInfoForCmd("clone project repository");
                if (userInfo) {
                    const selectedOrg = await selectOrg(userInfo, "Select organization");

                    let selectedProject = await selectProject(
                        selectedOrg,
                        `Loading projects from '${selectedOrg.name}'`,
                        `Select the project from '${selectedOrg.name}', that needs to be cloned`
                    );

                    const cloneDir = await window.showOpenDialog({
                        canSelectFolders: true,
                        canSelectFiles: false,
                        canSelectMany: false,
                        title: "Select a folder to clone the project repository",
                        defaultUri: Uri.file(os.homedir()),
                    });

                    if (cloneDir === undefined || cloneDir.length === 0) {
                        throw new Error("Directory is required in order to clone the repository in");
                    }

                    const selectedCloneDir = cloneDir[0];

                    let gitProvider = selectedProject.gitProvider ?? "";
                    let gitOrg = selectedProject.gitOrganization ?? "";
                    let gitRepo = selectedProject.repository ?? "";
                    let gitBranch = selectedProject.branch ?? "";

                    const components = await window.withProgress(
                        {
                            title: `Fetching components of ${selectedProject.name}...`,
                            location: ProgressLocation.Notification,
                        },
                        () =>
                            ext.clients.rpcClient.getComponentList({
                                orgId: selectedOrg.id.toString(),
                                projectHandle: selectedProject.handler,
                            })
                    );

                    if (!gitProvider || !gitOrg || !gitRepo) {
                        if (components.length === 0) {
                            throw new Error(`No components found within ${selectedProject.name}.`);
                        }

                        const repoSet = new Set<string>();
                        for (const component of components) {
                            const repo =
                                component.spec.source.github?.repository || component.spec.source.bitbucket?.repository;
                            if (repo) {
                                repoSet.add(repo);
                            }
                        }

                        if (repoSet.size === 0) {
                            throw new Error(`No repos found to link within ${selectedProject.name}.`);
                        }

                        let [selectedRepoUrl] = repoSet;

                        if (repoSet.size > 1) {
                            const selected = await window.showQuickPick(
                                Array.from(repoSet).map((label) => ({ label })),
                                {
                                    title: "Select a repository associated with the project",
                                    ignoreFocusOut: true,
                                }
                            );

                            if (selected?.label) {
                                selectedRepoUrl = selected?.label;
                            }
                        }

                        const parsedRepo = parseGitURL(selectedRepoUrl);

                        if (!parsedRepo) {
                            throw new Error("Failed to parse selected Git URL");
                        }

                        const matchingComp = components?.find(
                            (item) =>
                                selectedRepoUrl ===
                                (item.spec.source.github?.repository || item.spec.source.bitbucket?.repository)
                        );

                        gitOrg = parsedRepo[0];
                        gitRepo = parsedRepo[1];
                        gitProvider = parsedRepo[2];
                        gitBranch =
                            matchingComp?.spec.source.github?.branch ||
                            matchingComp?.spec.source.bitbucket?.branch ||
                            "";
                    }

                    const { clonedPath, gitUrl } = await cloneRepositoryWithProgress(
                        gitOrg,
                        gitRepo,
                        selectedCloneDir.fsPath,
                        gitProvider,
                        gitBranch
                    );

                    // const { componentMap } = await getComponentMapForLink(
                    //     selectedOrg,
                    //     selectedProject,
                    //     components,
                    //     [gitUrl],
                    //     clonedPath,
                    //     clonedPath
                    // );

                    // await createComponentLinks(selectedOrg, selectedProject, componentMap);

                    await openClonedDirectory(clonedPath);
                }
            } catch (err: any) {
                console.error("Failed to clone project", err);
                window.showErrorMessage(err?.message || "Failed to clone project");
            }
        })
    );
}

async function cloneRepositoryWithProgress(
    orgName: string,
    repoName: string,
    parentPath: string,
    gitProvider?: string,
    ref?: string
) {
    return await window.withProgress(
        {
            title: `Cloning ${orgName}/${repoName} repository within selected directory.`,
            location: ProgressLocation.Notification,
            cancellable: true,
        },
        async (progress, cancellationToken) => {
            const git = await initGit(ext.context);
            if (git) {
                let gitUrl = `https://github.com/${orgName}/${repoName}.git`;
                if (gitProvider === GitProvider.BITBUCKET) {
                    gitUrl = `https://bitbucket.org/${orgName}/${repoName}.git`;
                }

                const clonedPath = await git.clone(
                    gitUrl,
                    { recursive: true, ref, parentPath, progress },
                    cancellationToken
                );
                return { clonedPath, gitUrl };
            } else {
                throw new Error("Git was not initialized.");
            }
        }
    );
}

async function openClonedDirectory(folderPath: string) {
    const openInCurrentWorkspace = await window.showInformationMessage(
        "Where do you want to open the cloned repository?",
        { modal: true },
        "Current Window",
        "New Window"
    );
    if (openInCurrentWorkspace === "Current Window") {
        await commands.executeCommand("vscode.openFolder", Uri.file(folderPath), {
            forceNewWindow: false,
        });
        await commands.executeCommand("workbench.explorer.fileView.focus");
    } else if (openInCurrentWorkspace === "New Window") {
        await commands.executeCommand("vscode.openFolder", Uri.file(folderPath), {
            forceNewWindow: true,
        });
    }
}
