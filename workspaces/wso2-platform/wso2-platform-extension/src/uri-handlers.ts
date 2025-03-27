/*
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { join } from "path";
import { CommandIds, type Organization, type Project, getComponentKindRepoSource, parseGitURL } from "@wso2-enterprise/wso2-platform-core";
import { ProgressLocation, type ProviderResult, type QuickPickItem, type Uri, commands, window, workspace } from "vscode";
import { ResponseError } from "vscode-jsonrpc";
import { ErrorCode } from "./choreo-rpc/constants";
import { getUserInfoForCmd } from "./cmds/cmd-utils";
import { ext } from "./extensionVariables";
import { getGitRemotes, getGitRoot } from "@wso2-enterprise/git-vscode";
import { getLogger } from "./logger/logger";
import { authStore } from "./stores/auth-store";
import { contextStore, getContextKey, waitForContextStoreToLoad } from "./stores/context-store";
import { dataCacheStore } from "./stores/data-cache-store";
import { locationStore } from "./stores/location-store";
import { delay, openDirectory } from "./utils";
import { webviewStateStore } from "./stores/webview-state-store";
import { choreoEnvConfig } from "./config";

export function activateURIHandlers() {
	window.registerUriHandler({
		handleUri(uri: Uri): ProviderResult<void> {
			getLogger().debug(`Handling URI: ${uri.toString()}`);
			const extName = webviewStateStore.getState().state.extensionName;

			if (uri.path === "/signin") {
				getLogger().info("WSO2 Platform Login Callback hit");
				const urlParams = new URLSearchParams(uri.query);
				const authCode = urlParams.get("code");
				if (authCode) {
					getLogger().debug("Initiating WSO2 Platform sign in flow from auth code");
					// TODO: Check if status is equal to STATUS_LOGGING_IN, if not, show error message.
					// It means that the login was initiated from somewhere else or an old page was opened/refreshed in the browser
					window.withProgress(
						{
							title: `Verifying user details and logging into ${extName}...`,
							location: ProgressLocation.Notification,
						},
						async () => {
							try {
								const orgId = contextStore?.getState().state?.selected?.org?.id?.toString();
								const callbackUrl = extName === 'Devant' ? `${choreoEnvConfig.getDevantUrl()}/vscode-auth` : undefined
								const clientId = extName === 'Devant' ? choreoEnvConfig.getDevantAsguadeoClientId() : undefined
								const userInfo = await ext.clients.rpcClient.signInWithAuthCode(authCode, orgId, callbackUrl, clientId);
								if (userInfo) {
									await delay(1000);
									authStore.getState().loginSuccess(userInfo);
									window.showInformationMessage(`Successfully signed into ${extName}`)
								}
							} catch (error: any) {
								if (!(error instanceof ResponseError) || error.code !== ErrorCode.NoOrgsAvailable) {
									window.showErrorMessage("Sign in failed. Please check the logs for more details.");
								}
								getLogger().error(`WSO2 Platform sign in Failed: ${error.message}`);
							}
						},
					);
				} else {
					getLogger().error("WSO2 Platform Login Failed: Authorization code not found!");
					window.showErrorMessage("WSO2 Platform Login Failed: Authorization code not found!");
				}
			} else if (uri.path === "/ghapp") {
				getLogger().info("WSO2 Platform Githup auth Callback hit");
				const urlParams = new URLSearchParams(uri.query);
				const authCode = urlParams.get("code");
				// const installationId = urlParams.get("installationId");
				const orgId = urlParams.get("orgId");
				if (authCode && orgId) {
					ext.clients.rpcClient.obtainGithubToken({ code: authCode, orgId });
				}
			} else if (uri.path === "/open") {
				const urlParams = new URLSearchParams(uri.query);
				const orgHandle = urlParams.get("org");
				const projectHandle = urlParams.get("project");
				const componentName = urlParams.get("component");
				const technology = urlParams.get("technology");
				const integrationType = urlParams.get("integrationType");
				const integrationDisplayType = urlParams.get("integrationDisplayType");
				if (!orgHandle || !projectHandle) {
					return;
				}
				getUserInfoForCmd("open project").then(async (userInfo) => {
					const org = userInfo?.organizations.find((item) => item.handle === orgHandle);
					if (!org) {
						window.showErrorMessage(`Failed to find project organization for ${orgHandle}`);
						return;
					}
					const cacheProjects = dataCacheStore.getState().getProjects(orgHandle);
					let project = cacheProjects?.find((item) => item.handler === projectHandle);
					if (!project) {
						const projects = await window.withProgress(
							{ title: `Fetching projects of organization ${org.name}...`, location: ProgressLocation.Notification },
							() => ext.clients.rpcClient.getProjects(org.id.toString()),
						);
						project = projects?.find((item) => item.handler === projectHandle);
					}
					if (!project) {
						window.showErrorMessage(`Failed to find project for ${projectHandle}`);
						return;
					}

					await waitForContextStoreToLoad();

					await cloneOrOpenDir(org, project, componentName, technology, integrationType, integrationDisplayType);
				});
			}
		},
	});
}

export const cloneOrOpenDir = async (
	org: Organization,
	project: Project,
	componentName: string | null,
	technology: string | null,
	integrationType: string | null,
	integrationDisplayType: string | null,
) => {
	// TODO: following only checks if you are within matching project but we need to check if matching component also exists
	/*
	const contextItems = contextStore.getState().getValidItems();
	const isWithinDir = contextItems.find((item) => item.orgHandle === org.handle && item.projectHandle === project.handler);
	if (isWithinDir) {
		const selectedContext = contextStore.getState().state.selected;
		if (selectedContext?.orgHandle !== org.handle || selectedContext?.projectHandle !== project.handler) {
			contextStore.getState().onSetNewContext(org, project, isWithinDir.contextDirs[0]);
		}
		window.showInformationMessage(`You are already within the ${componentName ? "component" : "project"} directory`);
		return;
	}
	*/

	const projectLocations = locationStore.getState().getLocations(project.handler, org.handle);

	if (componentName) {
		const componentCache = dataCacheStore?.getState().getComponents(org.handle, project.handler);
		let matchingComp = componentCache?.find((item) => item.metadata.name === componentName);
		if (!matchingComp) {
			matchingComp = await window.withProgress({ title: "Fetching component details...", location: ProgressLocation.Notification }, () =>
				ext.clients.rpcClient.getComponentItem({ componentName, orgId: org.id.toString(), projectHandle: project.handler }),
			);
		}
		if (!matchingComp) {
			window.showErrorMessage(`Failed to find component matching ${componentName}`);
			return;
		}

		const selectedPaths = new Set<string>();
		const subDir = matchingComp?.spec?.source ? getComponentKindRepoSource(matchingComp?.spec?.source)?.path || "" : "";
		const repoUrl = getComponentKindRepoSource(matchingComp.spec.source).repo;
		const parsedRepoUrl = parseGitURL(repoUrl);
		if (parsedRepoUrl) {
			const [repoOrg, repoName, repoProvider] = parsedRepoUrl;
			for (const projectLocation of projectLocations) {
				if (projectLocation.componentItems.some((item) => item.component?.metadata?.name === componentName)) {
					const gitRoot = await getGitRoot(ext.context, projectLocation.fsPath);
					if (gitRoot) {
						const remotes = await getGitRemotes(ext.context, gitRoot);
						const hasMatchingRemote = remotes.some((remote) => {
							const parsedRemoteUrl = parseGitURL(remote.fetchUrl);
							if (parsedRemoteUrl) {
								const [remoteRepoOrg, remoteRepoName, remoteRepoProvider] = parsedRemoteUrl;
								return remoteRepoOrg === repoOrg && remoteRepoName === repoName && remoteRepoProvider === repoProvider;
							}
						});
						if (hasMatchingRemote) {
							selectedPaths.add(projectLocation.fsPath);
						}
					}
				}
			}
		}
		if (selectedPaths.size > 0) {
			const selectedPath = await getSelectedPath(Array.from(selectedPaths));
			if (selectedPath) {
				openProjectDirectory(join(selectedPath, subDir), !!matchingComp);
			}
		} else {
			commands.executeCommand(CommandIds.CloneProject, {
				organization: org,
				project,
				componentName,
				component: matchingComp,
				technology,
				integrationType,
				integrationDisplayType,
			});
		}
	} else if (projectLocations.length > 0) {
		const selectedPath = await getSelectedPath(projectLocations.map((item) => item.fsPath));
		if (selectedPath) {
			openProjectDirectory(selectedPath);
		}
	} else {
		commands.executeCommand(CommandIds.CloneProject, {
			organization: org,
			project,
			componentName,
			technology,
			integrationType,
			integrationDisplayType,
		});
	}
};

const openProjectDirectory = async (openingPath: string, isComponent = false) => {
	openDirectory(openingPath, `Where do you want to open the ${isComponent ? "component" : "project"} directory ${openingPath} ?`);
};

const cloneOrOpenDirectory = (organization: Organization, project: Project, componentName = "") => {
	window
		.showInformationMessage(
			`Unable to find a local clone of the ${componentName ? "component" : "project"} directory.`,
			{ modal: true },
			"Clone Repository",
			"Open Directory",
		)
		.then((resp) => {
			if (resp === "Open Directory") {
				ext.context.globalState.update("open-local-repo", getContextKey(organization, project));
				commands.executeCommand("vscode.openFolder");
			} else if (resp === "Clone Repository") {
				commands.executeCommand(CommandIds.CloneProject, { organization, project, componentName });
			}
		});
};

const getSelectedPath = async (paths: string[]): Promise<string | undefined | null> => {
	if (paths.length === 0) {
		return null;
	}
	if (paths?.length === 1) {
		return paths[0];
	}
	const items: QuickPickItem[] = paths.map((item) => ({ label: item }));
	const directorySelection = await window.showQuickPick(items, { title: "Multiple directories detected", ignoreFocusOut: true });
	return directorySelection?.label;
};
