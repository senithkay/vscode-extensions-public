/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as os from "os";
import { join } from "path";
import { CommandIds, type ComponentKind, GitProvider, type Organization, type Project } from "@wso2-enterprise/choreo-core";
import { type ExtensionContext, ProgressLocation, type QuickPickItem, QuickPickItemKind, Uri, commands, window } from "vscode";
import { ext } from "../extensionVariables";
import { initGit } from "../git/main";
import { parseGitURL } from "../git/util";
import { authStore } from "../stores/auth-store";
import { dataCacheStore } from "../stores/data-cache-store";
import { createDirectory, openDirectory } from "../utils";
import { getUserInfoForCmd, selectOrg, selectProject } from "./cmd-utils";
import { updateContextFile } from "./create-directory-context-cmd";
import { createWorkspaceFile } from "./create-project-workspace-cmd";

export function cloneRepoCommand(context: ExtensionContext) {
	context.subscriptions.push(
		commands.registerCommand(CommandIds.CloneProject, async (params: { organization: Organization; project: Project; componentName: string }) => {
			try {
				const userInfo = await getUserInfoForCmd("clone project repository");
				if (userInfo) {
					const selectedOrg = params?.organization ?? (await selectOrg(userInfo, "Select organization"));

					const selectedProject =
						params?.project ??
						(await selectProject(
							selectedOrg,
							`Loading projects from '${selectedOrg.name}'`,
							`Select the project from '${selectedOrg.name}', that needs to be cloned`,
						));

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
					const projectCache = dataCacheStore.getState().getProjects(selectedOrg.handle);

					const components = await window.withProgress(
						{
							title: `Fetching components of ${selectedProject.name}...`,
							location: ProgressLocation.Notification,
						},
						() =>
							ext.clients.rpcClient.getComponentList({
								orgId: selectedOrg.id.toString(),
								orgHandle: selectedOrg.handle,
								projectId: selectedProject.id,
								projectHandle: selectedProject.handler,
							}),
					);

					if (selectedProject.gitProvider && selectedProject.gitOrganization && selectedProject.repository) {
						// clone project repo
						const clonedResp = await cloneRepositoryWithProgress(selectedCloneDir.fsPath, [
							{
								orgName: selectedProject.gitOrganization,
								repoName: selectedProject.repository,
								branch: selectedProject.branch,
								gitProvider: selectedProject.gitProvider,
							},
						]);

						// set context.yaml
						updateContextFile(clonedResp[0].clonedPath, authStore.getState().state.userInfo!, selectedProject, selectedOrg, projectCache);

						const workspaceFilePath = createWorkspaceFile(
							clonedResp[0].clonedPath,
							selectedProject,
							components?.map((item) => ({
								component: item,
								fsPath: join(clonedResp[0].clonedPath, item.spec.source.github?.path || item.spec.source.bitbucket?.path || ""),
							})) ?? [],
						);

						await openClonedDirectory(workspaceFilePath);
					} else {
						// clone single or multiple repos
						if (components.length === 0) {
							throw new Error(`No components found within ${selectedProject.name}.`);
						}

						const repoSet = new Set<string>();
						for (const component of components) {
							const repo = component.spec.source.github?.repository || component.spec.source.bitbucket?.repository;
							if (repo) {
								if (params?.componentName) {
									if (component.metadata.name === params?.componentName) {
										repoSet.add(repo);
									}
								} else {
									repoSet.add(repo);
								}
							}
						}

						if (repoSet.size === 0) {
							throw new Error(`No repos found to link within ${selectedProject.name}.`);
						}

						if (repoSet.size > 1) {
							const quickPickOptions: QuickPickItem[] = [
								{
									label: "Clone entire project",
									detail: "Clone all the repositories associated with the selected project",
									picked: true,
								},
								{ kind: QuickPickItemKind.Separator, label: "Clone a component of the project" },
								...components.map((item) => ({
									label: item.metadata.name,
									detail: `Repository: ${item.spec.source?.github?.repository || item.spec.source?.bitbucket?.repository}`,
									item,
								})),
							];
							const selection = await window.showQuickPick(quickPickOptions, {
								title: "Select an option",
							});

							if (selection?.label === "Clone entire project") {
								// do nothing
							} else if ((selection as any)?.item) {
								repoSet.clear();
								repoSet.add((selection as any)?.item.spec.source.github?.repository || (selection as any)?.item.spec.source.bitbucket?.repository);
							} else {
								throw new Error("Repository or component selection is required in order to clone the repository");
							}
						}

						let selectedRepoUrl = "";
						if (repoSet.size === 1) {
							[selectedRepoUrl] = repoSet;

							const parsedRepo = parseGitURL(selectedRepoUrl);

							if (!parsedRepo) {
								throw new Error("Failed to parse selected Git URL");
							}

							const matchingComp = components?.find(
								(item) => selectedRepoUrl === (item.spec.source.github?.repository || item.spec.source.bitbucket?.repository),
							);

							const latestDeploymentTrack = matchingComp?.deploymentTracks?.find(item=>item.latest)

							const clonedResp = await cloneRepositoryWithProgress(selectedCloneDir.fsPath, [
								{
									orgName: parsedRepo[0],
									repoName: parsedRepo[1],
									branch: latestDeploymentTrack?.branch,
									gitProvider: parsedRepo[2],
								},
							]);

							// set context.yaml
							updateContextFile(clonedResp[0].clonedPath, authStore.getState().state.userInfo!, selectedProject, selectedOrg, projectCache);

							const workspaceFilePath = createWorkspaceFile(
								clonedResp[0].clonedPath,
								selectedProject,
								components?.map((item) => ({
									component: item,
									fsPath: join(clonedResp[0].clonedPath, item.spec.source.github?.path || item.spec.source.bitbucket?.path || ""),
								})) ?? [],
							);

							await openClonedDirectory(workspaceFilePath);
						} else if (repoSet.size > 1) {
							const parsedRepos = Array.from(repoSet).map((item) => parseGitURL(item));
							if (parsedRepos.some((item) => !item)) {
								throw new Error("Failed to parse selected Git URL");
							}

							const { dirPath: projectDirPath } = createDirectory(selectedCloneDir.fsPath, selectedProject.name);

							const clonedResp = await cloneRepositoryWithProgress(
								projectDirPath,
								Array.from(repoSet).map((selectedRepoUrl) => {
									const parsedRepo = parseGitURL(selectedRepoUrl);

									if (!parsedRepo) {
										throw new Error("Failed to parse selected Git URL");
									}

									const matchingComp = components?.find(
										(item) => selectedRepoUrl === (item.spec.source.github?.repository || item.spec.source.bitbucket?.repository),
									);

									const latestDeploymentTrack = matchingComp?.deploymentTracks?.find(item=>item.latest)

									return {
										orgName: parsedRepo[0],
										repoName: parsedRepo[1],
										branch: latestDeploymentTrack?.branch,
										gitProvider: parsedRepo[2],
									};
								}),
							);

							// set context.yaml
							const workspaceFolders: { component: ComponentKind; fsPath: string }[] = [];
							for (const clonedRespItem of clonedResp) {
								updateContextFile(clonedRespItem.clonedPath, authStore.getState().state.userInfo!, selectedProject, selectedOrg, projectCache);

								for (const item of components) {
									const componentRepo = parseGitURL(item.spec.source.github?.repository || item.spec.source.bitbucket?.repository);
									const dirRepo = parseGitURL(clonedRespItem.gitUrl);
									if (
										componentRepo &&
										dirRepo &&
										componentRepo[0] === dirRepo[0] &&
										componentRepo[1] === dirRepo[1] &&
										componentRepo[2] === dirRepo[2]
									) {
										workspaceFolders.push({
											component: item,
											fsPath: join(clonedRespItem.clonedPath, item.spec.source.github?.path || item.spec.source.bitbucket?.path || ""),
										});
									}
								}
							}

							const workspaceFilePath = createWorkspaceFile(projectDirPath, selectedProject, workspaceFolders);

							await openClonedDirectory(workspaceFilePath);
						}
					}
				}
			} catch (err: any) {
				console.error("Failed to clone project", err);
				window.showErrorMessage(err?.message || "Failed to clone project");
			}
		}),
	);
}

const cloneRepositoryWithProgress = async (
	parentPath: string,
	repos: { orgName: string; repoName: string; gitProvider?: string; branch?: string }[],
): Promise<{ clonedPath: string; gitUrl: string }[]> => {
	return await window.withProgress(
		{
			title: `Cloning repository into ${parentPath}.`,
			location: ProgressLocation.Notification,
			cancellable: true,
		},
		async (progress, cancellationToken) => {
			const clonedRepos: { clonedPath: string; gitUrl: string }[] = [];
			for (const { orgName, repoName, branch, gitProvider } of repos) {
				const git = await initGit(ext.context);
				if (git) {
					let gitUrl = `https://github.com/${orgName}/${repoName}.git`;
					if (gitProvider === GitProvider.BITBUCKET) {
						gitUrl = `https://bitbucket.org/${orgName}/${repoName}.git`;
					}

					const clonedPath = await git.clone(
						gitUrl,
						{
							recursive: true,
							ref: branch,
							parentPath,
							progress: {
								report: ({ increment, ...rest }: { increment: number }) =>
									progress.report({
										increment: increment / repos.length,
										message: `Cloning ${orgName}/${repoName} repository into selected directory`,
										...rest,
									}),
							},
						},
						cancellationToken,
					);
					clonedRepos.push({ clonedPath, gitUrl });
				} else {
					throw new Error("Git was not initialized.");
				}
			}
			return clonedRepos;
		},
	);
};

async function openClonedDirectory(openingPath: string) {
	openDirectory(openingPath, "Where do you want to open the cloned repository workspace?");
}
