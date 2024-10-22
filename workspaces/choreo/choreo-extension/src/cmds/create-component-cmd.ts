/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import * as os from "os";
import * as path from "path";
import { join } from "path";
import {
	ChoreoComponentType,
	CommandIds,
	type ICreateComponentParams,
	type SubmitComponentCreateReq,
	type WorkspaceConfig,
	getComponentTypeText,
} from "@wso2-enterprise/choreo-core";
import { type ExtensionContext, ProgressLocation, type QuickPickItem, Uri, commands, window, workspace } from "vscode";
import { ext } from "../extensionVariables";
import { getGitRoot } from "../git/util";
import { authStore } from "../stores/auth-store";
import { contextStore } from "../stores/context-store";
import { dataCacheStore } from "../stores/data-cache-store";
import { delay, getSubPath, goTosource } from "../utils";
import { showComponentDetailsView } from "../webviews/ComponentDetailsView";
import { ComponentFormView } from "../webviews/ComponentFormView";
import { getUserInfoForCmd, selectOrg, selectProjectWithCreateNew } from "./cmd-utils";
import { updateContextFile } from "./create-directory-context-cmd";

let componentWizard: ComponentFormView;

export function createNewComponentCommand(context: ExtensionContext) {
	context.subscriptions.push(
		commands.registerCommand(CommandIds.CreateNewComponent, async (params: ICreateComponentParams) => {
			try {
				const userInfo = await getUserInfoForCmd("create a component");
				if (userInfo) {
					const selected = contextStore.getState().state.selected;
					let selectedProject = selected?.project;
					let selectedOrg = selected?.org;

					if (!selectedProject || !selectedOrg) {
						selectedOrg = await selectOrg(userInfo, "Select organization");

						const createdProjectRes = await selectProjectWithCreateNew(
							selectedOrg,
							`Loading projects from '${selectedOrg.name}'`,
							`Select the project from '${selectedOrg.name}', to create the component in`,
						);
						selectedProject = createdProjectRes.selectedProject;
					}

					let selectedType: string | undefined = params?.initialValues?.type;
					if (!selectedType) {
						const typeQuickPicks: (QuickPickItem & { value: string })[] = [
							{ label: getComponentTypeText(ChoreoComponentType.Service), value: ChoreoComponentType.Service },
							{ label: getComponentTypeText(ChoreoComponentType.WebApplication), value: ChoreoComponentType.WebApplication },
							{ label: getComponentTypeText(ChoreoComponentType.ApiProxy), value: ChoreoComponentType.ApiProxy },
							{ label: getComponentTypeText(ChoreoComponentType.ScheduledTask), value: ChoreoComponentType.ScheduledTask },
							{ label: getComponentTypeText(ChoreoComponentType.ManualTrigger), value: ChoreoComponentType.ManualTrigger },
						];
						const selectedTypePick = await window.showQuickPick(typeQuickPicks, { title: "Select Component Type" });
						if (selectedTypePick?.value) {
							selectedType = selectedTypePick?.value;
						}
					}

					if (!selectedType) {
						throw new Error("Component type is required");
					}

					let subPath: string | null = null;

					if (params?.initialValues?.componentDir) {
						const workspaceDir = workspace.workspaceFolders?.find((item) => !!getSubPath(params?.initialValues?.componentDir!, item.uri.path));
						if (workspaceDir) {
							subPath = getSubPath(params?.initialValues?.componentDir!, workspaceDir?.uri.path);
						}
					}

					// todo: ask for the directory here itself
					// if directory is outside of the vscode workspace, open it after creating the component


					let dirName = "";
					let dirPath = "";
					let dirFsPath = "";
					if (workspace.workspaceFile && workspace.workspaceFile.scheme !== "untitled") {
						dirFsPath = path.dirname(workspace.workspaceFile.fsPath);
						dirPath = path.dirname(workspace.workspaceFile.path);
						dirName = path.basename(path.dirname(workspace.workspaceFile.path));
					} else if (workspace.workspaceFolders && workspace.workspaceFolders?.length > 0) {
						if (workspace.workspaceFolders?.length === 1) {
							const firstFolder = workspace.workspaceFolders[0];
							dirFsPath = firstFolder.uri.fsPath;
							dirPath = firstFolder.uri.path;
							dirName = firstFolder.name;
						} else {
							dirFsPath = Uri.file(os.homedir()).fsPath;
							dirPath = Uri.file(os.homedir()).path;
						}
					} else {
						dirFsPath = Uri.file(os.homedir()).fsPath;
						dirPath = Uri.file(os.homedir()).path;
					}

					if (componentWizard) {
						componentWizard.dispose();
					}

					componentWizard = new ComponentFormView(ext.context.extensionUri, {
						directoryUriPath: dirPath,
						directoryFsPath: dirFsPath,
						directoryName: dirName,
						organization: selectedOrg!,
						project: selectedProject!,
						initialValues: {
							type: selectedType,
							buildPackLang: params?.initialValues?.buildPackLang,
							subPath: subPath || "",
							name: params?.initialValues?.name,
						},
					});
					componentWizard.getWebview()?.reveal();
				}
			} catch (err: any) {
				console.error("Failed to create component", err);
				window.showErrorMessage(err?.message || "Failed to create component");
			}
		}),
	);
}

export const submitCreateComponentHandler = async ({ createParams, org, project, autoBuildOnCommit, type }: SubmitComponentCreateReq) => {
	const createdComponent = await window.withProgress(
		{
			title: `Creating new component ${createParams.displayName}...`,
			location: ProgressLocation.Notification,
		},
		() => ext.clients.rpcClient.createComponent(createParams),
	);

	if (createdComponent) {
		if (type !== ChoreoComponentType.ApiProxy && autoBuildOnCommit) {
			const envs = dataCacheStore.getState().getEnvs(org.handle, project.handler);
			const matchingTrack = createdComponent?.deploymentTracks.find((item) => item.branch === createParams.branch);
			if (matchingTrack && envs.length > 0) {
				try{
					await window.withProgress(
						{ title: `Enabling auto build on commit for component ${createParams.displayName}...`, location: ProgressLocation.Notification },
						() =>
							ext.clients.rpcClient.enableAutoBuildOnCommit({
								componentId: createdComponent?.metadata?.id,
								orgId: org.id.toString(),
								versionId: matchingTrack.id,
								envId: envs[0]?.id,
							}),
					);
				}catch{
					console.log("Failed to enable auto build on commit", )
				}
			}
		}

		showComponentDetailsView(org, project, createdComponent, createParams?.componentDir);

		const compCache = dataCacheStore.getState().getComponents(org.handle, project.handler);
		dataCacheStore.getState().setComponents(org.handle, project.handler, [createdComponent, ...compCache]);

		// update the context file if needed
		try {
			const gitRoot = await getGitRoot(ext.context, createParams.componentDir);
			const projectCache = dataCacheStore.getState().getProjects(org.handle);
			if (gitRoot) {
				updateContextFile(gitRoot, authStore.getState().state.userInfo!, project, org, projectCache);
			}
		} catch (err) {
			console.error("Failed to get git details of ", createParams.componentDir);
		}

		if (workspace.workspaceFile) {
			const workspaceContent: WorkspaceConfig = JSON.parse(readFileSync(workspace.workspaceFile.fsPath, "utf8"));
			workspaceContent.folders = [
				...workspaceContent.folders,
				{
					name: createdComponent.metadata.name,
					path: path.normalize(path.relative(path.dirname(workspace.workspaceFile.fsPath), createParams.componentDir)),
				},
			];

			if (workspace.workspaceFile.scheme !== "untitled" && path.basename(workspace.workspaceFile.path) === `${project?.handler}.code-workspace`) {
				// Automatically update the workspace if user is within a project workspace
				writeFileSync(workspace.workspaceFile!.fsPath, JSON.stringify(workspaceContent, null, 4));
				await delay(1000);
				contextStore.getState().refreshState();
			} else {
				// Else manfully ask and update the workspace
				window
					.showInformationMessage(`Do you want update your workspace with the directory of ${createdComponent.metadata.name}`, "Continue")
					.then(async (resp) => {
						if (resp === "Continue") {
							writeFileSync(workspace.workspaceFile!.fsPath, JSON.stringify(workspaceContent, null, 4));
							await delay(1000);
							contextStore.getState().refreshState();
						}
					});
			}
		} else {
			contextStore.getState().refreshState();
		}
	}

	return createdComponent;
};
