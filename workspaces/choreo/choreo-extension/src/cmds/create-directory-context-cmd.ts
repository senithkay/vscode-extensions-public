import { existsSync, mkdirSync, readFileSync, readdirSync, rmdirSync, unlinkSync, writeFileSync } from "fs";
import * as os from "os";
import * as path from "path";
import { dirname } from "path";
import { CommandIds, type ContextItem, type Organization, type Project, type UserInfo } from "@wso2-enterprise/choreo-core";
import * as yaml from "js-yaml";
/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { type ExtensionContext, Uri, commands, window, workspace } from "vscode";
import { getGitRemotes, getGitRoot } from "../git/util";
import { contextStore, waitForContextStoreToLoad } from "../stores/context-store";
import { isSubpath } from "../utils";
import { getUserInfoForCmd, resolveWorkspaceDirectory, selectOrg, selectProjectWithCreateNew } from "./cmd-utils";

export function createDirectoryContextCommand(context: ExtensionContext) {
	context.subscriptions.push(
		commands.registerCommand(CommandIds.CreateDirectoryContext, async () => {
			try {
				const userInfo = await getUserInfoForCmd("link a directory with a Choreo project");
				let gitRoot: string | undefined = "";
				if (userInfo) {
					let directoryUrl: Uri;
					if (!workspace.workspaceFile) {
						// is within a standard directory
						if (workspace.workspaceFolders?.length === 1) {
							directoryUrl = workspace.workspaceFolders[0].uri;

							try {
								gitRoot = await getGitRoot(context, directoryUrl.fsPath);
							} catch (err) {
								// ignore error
							}

							if (!gitRoot) {
								// if user is not within a git repo,
								// let user pick a sub directory
								const componentDir = await window.showOpenDialog({
									canSelectFolders: true,
									canSelectFiles: false,
									canSelectMany: false,
									title: "Select directory that needs to be linked with Choreo",
									defaultUri: Uri.file(directoryUrl.fsPath),
								});

								if (componentDir === undefined || componentDir.length === 0) {
									throw new Error("Directory is required to link with Choreo");
								}

								directoryUrl = componentDir[0];

								if (!isSubpath(workspace.workspaceFolders[0].uri.fsPath, componentDir[0].fsPath)) {
									throw new Error("Selected directory is not a sub directory within the opened workspace");
								}
							}
						} else {
							const wd = await resolveWorkspaceDirectory();
							directoryUrl = wd.uri;
						}
					} else {
						// let user pick the directory
						const componentDir = await window.showOpenDialog({
							canSelectFolders: true,
							canSelectFiles: false,
							canSelectMany: false,
							title: "Select directory that needs to be linked with Choreo",
							defaultUri: Uri.file(os.homedir()),
						});

						if (componentDir === undefined || componentDir.length === 0) {
							throw new Error("Directory is required to link with Choreo");
						}

						directoryUrl = componentDir[0];
					}

					gitRoot = await getGitRoot(context, directoryUrl.fsPath);
					if (!gitRoot) {
						throw new Error("Selected directory is not within a git repository");
					}

					const remotes = await getGitRemotes(context, gitRoot);
					if (remotes.length === 0) {
						throw new Error("The directory does not any Git remotes");
					}

					const selectedOrg = await selectOrg(userInfo, "Select organization");

					const { projectList, selectedProject } = await selectProjectWithCreateNew(
						selectedOrg,
						`Loading projects from '${selectedOrg.name}'`,
						`Select project from '${selectedOrg.name}'`,
					);

					const contextFilePath = updateContextFile(gitRoot, userInfo, selectedProject, selectedOrg, projectList);

					await waitForContextStoreToLoad();

					contextStore.getState().onSetNewContext(selectedOrg, selectedProject, {
						contextFileFsPath: contextFilePath,
						dirFsPath: directoryUrl.fsPath,
						workspaceName: path.basename(gitRoot),
						projectRootFsPath: path.dirname(path.dirname(contextFilePath)),
					});
				}
			} catch (err: any) {
				console.error("Failed to link directory with Choreo project", err);
				window.showErrorMessage(`Failed to link directory with Choreo project. ${err?.message}`);
			}
		}),
	);
}

export const updateContextFile = (
	gitRoot: string,
	userInfo: UserInfo,
	selectedProject: Project,
	selectedOrg: Organization,
	projectList: Project[],
) => {
	const contextFilePath = path.join(gitRoot, ".choreo", "context.yaml");
	if (existsSync(contextFilePath)) {
		let parsedData: ContextItem[] = yaml.load(readFileSync(contextFilePath, "utf8")) as any;
		if (!Array.isArray(parsedData) && (parsedData as any).org && (parsedData as any).project) {
			parsedData = [{ org: (parsedData as any).org, project: (parsedData as any).project }];
		}

		const newList = parsedData.filter(
			(item) =>
				userInfo.organizations.some((org) => org.handle === item.org) ||
				(item.org === selectedOrg.handle && projectList.some((project) => project.handler === item.project)),
		);
		if (!newList.some((item) => item.org === selectedOrg.handle && item.project === selectedProject.handler)) {
			newList.push({ org: selectedOrg.handle, project: selectedProject.handler });
		}
		writeFileSync(contextFilePath, yaml.dump(newList));
	} else {
		const choreoDir = path.join(gitRoot, ".choreo");
		if (!existsSync(choreoDir)) {
			mkdirSync(choreoDir);
		}
		const contextYamlData: ContextItem[] = [{ org: selectedOrg.handle, project: selectedProject.handler }];
		writeFileSync(path.join(choreoDir, "context.yaml"), yaml.dump(contextYamlData));
	}

	return contextFilePath;
};

export const removeContext = (selectedProject: Project, selectedOrg: Organization, projectRootsFsPaths: string[]) => {
	for (const projectRootPath of projectRootsFsPaths) {
		const contextFilePath = path.join(projectRootPath, ".choreo", "context.yaml");
		if (existsSync(contextFilePath)) {
			let parsedData: ContextItem[] = yaml.load(readFileSync(contextFilePath, "utf8")) as any;
			if (!Array.isArray(parsedData) && (parsedData as any).org && (parsedData as any).project) {
				parsedData = [{ org: (parsedData as any).org, project: (parsedData as any).project }];
			}

			const newList = parsedData.filter((item) => item.project !== selectedProject.handler && item.org !== selectedOrg.handle);
			if (newList.length > 0) {
				writeFileSync(contextFilePath, yaml.dump(newList));
			} else {
				unlinkSync(contextFilePath);
				const choreoDirPath = dirname(contextFilePath);
				const choreoDirFiles = readdirSync(choreoDirPath);
				if (choreoDirFiles.length === 0) {
					rmdirSync(choreoDirPath);
				}
			}
		}
	}
};
