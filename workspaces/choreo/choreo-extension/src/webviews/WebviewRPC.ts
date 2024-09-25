/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { existsSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import {
	AuthStoreChangedNotification,
	ClearWebviewCache,
	CloseComponentViewDrawer,
	CloseWebViewNotification,
	type CommitHistory,
	type ComponentYamlContent,
	ContextStoreChangedNotification,
	DeleteFile,
	ExecuteCommandRequest,
	FileExists,
	GetAuthState,
	GetConfigFileDrifts,
	type GetConfigFileDriftsReq,
	GetContextState,
	GetDirectoryFileNames,
	GetLocalGitData,
	GetSubPath,
	GetWebviewStoreState,
	GoToSource,
	HasDirtyLocalGitRepo,
	JoinFilePaths,
	OpenComponentViewDrawer,
	type OpenComponentViewDrawerReq,
	type OpenDialogOptions,
	OpenExternal,
	OpenSubDialogRequest,
	OpenTestView,
	type OpenTestViewReq,
	ReadServiceEndpoints,
	RefreshContextState,
	RestoreWebviewCache,
	SaveFile,
	SelectCommitToBuild,
	type SelectCommitToBuildReq,
	SendTelemetryEventNotification,
	type SendTelemetryEventParams,
	SendTelemetryExceptionNotification,
	type SendTelemetryExceptionParams,
	SetWebviewCache,
	type ShowConfirmBoxReq,
	ShowConfirmMessage,
	ShowErrorMessage,
	ShowInfoMessage,
	ShowInputBox,
	ShowOpenDialogRequest,
	ShowQuickPick,
	SubmitComponentCreate,
	SubmitComponentCreateReq,
	SubmitEndpointsCreate,
	type SubmitEndpointsCreateReq,
	TriggerGithubAuthFlow,
	TriggerGithubInstallFlow,
	ViewBuildsLogs,
	ViewRuntimeLogs,
	WebviewNotificationsMethodList,
	type WebviewQuickPickItem,
	WebviewStateChangedNotification,
	deepEqual,
	getShortenedHash,
} from "@wso2-enterprise/choreo-core";
import * as yaml from "js-yaml";
import { ProgressLocation, QuickPickItemKind, Uri, type WebviewPanel, type WebviewView, commands, env, window } from "vscode";
import * as vscode from "vscode";
import { Messenger } from "vscode-messenger";
import { BROADCAST } from "vscode-messenger-common";
import { registerChoreoRpcResolver } from "../choreo-rpc";
import { getChoreoEnv, getChoreoExecPath } from "../choreo-rpc/cli-install";
import { quickPickWithLoader } from "../cmds/cmd-utils";
import { submitCreateComponentHandler } from "../cmds/create-component-cmd";
import { choreoEnvConfig } from "../config";
import { ext } from "../extensionVariables";
import { getConfigFileDrifts, getGitHead, getGitRemotes, hasDirtyRepo, removeCredentialsFromGitURL } from "../git/util";
import { getLogger } from "../logger/logger";
import { authStore } from "../stores/auth-store";
import { contextStore } from "../stores/context-store";
import { dataCacheStore } from "../stores/data-cache-store";
import { webviewStateStore } from "../stores/webview-state-store";
import { sendTelemetryEvent, sendTelemetryException } from "../telemetry/utils";
import { getSubPath, goTosource, readEndpoints, saveFile } from "../utils";
import { showComponentTestView } from "./ComponentTestView";

// Register handlers
function registerWebviewRPCHandlers(messenger: Messenger, view: WebviewPanel | WebviewView) {
	authStore.subscribe((store) => messenger.sendNotification(AuthStoreChangedNotification, BROADCAST, store.state));
	webviewStateStore.subscribe((store) => messenger.sendNotification(WebviewStateChangedNotification, BROADCAST, store.state));
	contextStore.subscribe((store) => messenger.sendNotification(ContextStoreChangedNotification, BROADCAST, store.state));

	messenger.onRequest(GetAuthState, () => authStore.getState().state);
	messenger.onRequest(GetWebviewStoreState, async () => webviewStateStore.getState().state);
	messenger.onRequest(GetContextState, async () => contextStore.getState().state);

	messenger.onRequest(OpenSubDialogRequest, async (options: OpenDialogOptions) => {
		try {
			const result = await window.showOpenDialog({ ...options, defaultUri: Uri.parse(options.defaultUri) });
			return result?.map((file) => file.path);
		} catch (error: any) {
			getLogger().error(error.message);
			return [];
		}
	});
	messenger.onRequest(GetLocalGitData, async (dirPath: string) => {
		try {
			const remotes = await getGitRemotes(ext.context, dirPath);
			const head = await getGitHead(ext.context, dirPath);
			let headRemoteUrl = "";
			const remotesSet = new Set<string>();
			remotes.forEach((remote) => {
				if (remote.fetchUrl) {
					const sanitized = removeCredentialsFromGitURL(remote.fetchUrl);
					remotesSet.add(sanitized);
					if (head?.upstream?.remote === remote.name) {
						headRemoteUrl = sanitized;
					}
				}
			});

			return {
				remotes: Array.from(remotesSet),
				upstream: { name: head?.name, remote: head?.upstream?.remote, remoteUrl: headRemoteUrl },
			};
		} catch (error: any) {
			getLogger().error(error.message);
			return undefined;
		}
	});
	messenger.onRequest(JoinFilePaths, (files: string[]) => join(...files));
	messenger.onRequest(GetSubPath, (params: { subPath: string; parentPath: string }) => getSubPath(params.subPath, params.parentPath));
	messenger.onRequest(ExecuteCommandRequest, async (args: string[]) => {
		if (args.length >= 1) {
			const cmdArgs = args.length > 1 ? args.slice(1) : [];
			const result = await commands.executeCommand(args[0], ...cmdArgs);
			return result;
		}
	});
	messenger.onRequest(OpenExternal, (url: string) => {
		vscode.env.openExternal(vscode.Uri.parse(url));
	});
	messenger.onRequest(SetWebviewCache, async (params) => {
		await ext.context.workspaceState.update(params.cacheKey, params.data);
	});
	messenger.onRequest(RestoreWebviewCache, async (cacheKey) => {
		return ext.context.workspaceState.get(cacheKey);
	});
	messenger.onRequest(ClearWebviewCache, async (cacheKey) => {
		await ext.context.workspaceState.update(cacheKey, undefined);
	});
	messenger.onRequest(GoToSource, async (filePath): Promise<void> => {
		await goTosource(filePath, false);
	});
	messenger.onRequest(SaveFile, async (params): Promise<string> => {
		return saveFile(
			params.fileName,
			params.fileContent,
			params.baseDirectory,
			params.successMessage,
			params.isOpenApiFile,
			params.shouldPromptDirSelect,
			params.dialogTitle,
			params.shouldOpen,
		);
	});
	messenger.onRequest(DeleteFile, async (filePath) => {
		unlinkSync(filePath);
	});
	messenger.onRequest(ShowConfirmMessage, async (params: ShowConfirmBoxReq) => {
		const response = await window.showInformationMessage(params.message, { modal: true }, params.buttonText);
		return response === params.buttonText;
	});
	messenger.onRequest(ReadServiceEndpoints, async (componentPath: string) => readEndpoints(componentPath));
	messenger.onRequest(ShowQuickPick, async (params) => {
		const itemSelection = await window.showQuickPick(params.items as vscode.QuickPickItem[], {
			title: params.title,
		});
		return itemSelection as WebviewQuickPickItem;
	});
	messenger.onRequest(ShowInputBox, async ({ regex, ...rest }) => {
		return window.showInputBox({
			...rest,
			validateInput: (val) => {
				if (regex && !new RegExp(regex.expression).test(val)) {
					return regex.message;
				}
				return null;
			},
		});
	});
	let buildLogsOutputChannel: vscode.OutputChannel;
	messenger.onRequest(ViewBuildsLogs, async (params) => {
		const logs = await window.withProgress(
			{ title: `Fetching build logs for build ID ${params.buildId}`, location: ProgressLocation.Notification },
			() => ext.clients.rpcClient.getBuildLogs(params),
		);
		if (!buildLogsOutputChannel) {
			buildLogsOutputChannel = window.createOutputChannel("Choreo: Build Logs");
		}
		buildLogsOutputChannel.replace(logs);
		buildLogsOutputChannel.show();
	});
	messenger.onRequest(ViewRuntimeLogs, async ({ orgName, projectName, componentName, deploymentTrackName, envName, type }) => {
		if (getChoreoEnv() !== "prod") {
			window.showErrorMessage("Choreo extension currently displays runtime logs is only if 'Advanced.ChoreoEnvironment' is set to 'prod'");
			return;
		}
		const args = ["logs", "-t", type, "-o", orgName, "-p", projectName, "-c", componentName, "-d", deploymentTrackName, "-e", envName, "-f"];
		window.createTerminal(`${componentName}:${type.replace("component-", "")}-logs`, getChoreoExecPath(), args).show();
	});
	const _getGithubUrlState = async (orgId: string): Promise<string> => {
		const callbackUrl = await env.asExternalUri(Uri.parse(`${env.uriScheme}://wso2.choreo/ghapp`));
		const state = { origin: "vscode.choreo.ext", orgId, callbackUri: callbackUrl.toString() };
		return Buffer.from(JSON.stringify(state), "binary").toString("base64");
	};
	messenger.onRequest(TriggerGithubAuthFlow, async (orgId: string) => {
		const { authUrl, clientId, redirectUrl } = choreoEnvConfig.getGHAppConfig();
		const state = await _getGithubUrlState(orgId);
		const ghURL = Uri.parse(`${authUrl}?redirect_uri=${redirectUrl}&client_id=${clientId}&state=${state}`);
		await env.openExternal(ghURL);
	});
	messenger.onRequest(TriggerGithubInstallFlow, async (orgId: string) => {
		const { installUrl } = choreoEnvConfig.getGHAppConfig();
		const state = await _getGithubUrlState(orgId);
		const ghURL = Uri.parse(`${installUrl}?state=${state}`);
		await env.openExternal(ghURL);
	});
	messenger.onRequest(SubmitComponentCreate, submitCreateComponentHandler);
	messenger.onRequest(GetDirectoryFileNames, (dirPath: string) => {
		return readdirSync(dirPath)?.filter((fileName) => statSync(join(dirPath, fileName)).isFile());
	});
	messenger.onRequest(SubmitEndpointsCreate, (params: SubmitEndpointsCreateReq) => {
		if (existsSync(join(params.componentDir, ".choreo", "endpoints.yaml"))) {
			rmSync(join(params.componentDir, ".choreo", "endpoints.yaml"));
		}
		// todo: delete component-config.yaml when we migrate to component.yaml
		const componentConfigYamlPath = join(params.componentDir, ".choreo", "component-config.yaml");
		if (existsSync(componentConfigYamlPath)) {
			const endpointFileContent: ComponentYamlContent = yaml.load(readFileSync(componentConfigYamlPath, "utf8")) as any;
			endpointFileContent.spec.inbound = params.endpoints;
			const originalContent: ComponentYamlContent = yaml.load(readFileSync(componentConfigYamlPath, "utf8")) as any;
			if (!deepEqual(originalContent, endpointFileContent)) {
				writeFileSync(componentConfigYamlPath, yaml.dump(endpointFileContent));
			}
		} else {
			const endpointFileContent: ComponentYamlContent = {
				apiVersion: "core.choreo.dev/v1beta1",
				kind: "ComponentConfig",
				spec: { inbound: params.endpoints },
			};
			writeFileSync(componentConfigYamlPath, yaml.dump(endpointFileContent));
		}
	});
	messenger.onRequest(FileExists, (filePath: string) => {
		try {
			return statSync(filePath).isFile();
		} catch (err) {
			return false;
		}
	});
	messenger.onRequest(OpenTestView, (props: OpenTestViewReq) => {
		showComponentTestView(props);
	});
	messenger.onRequest(ShowOpenDialogRequest, async (options: OpenDialogOptions) => {
		try {
			const result = await window.showOpenDialog({ ...options, defaultUri: Uri.parse(options.defaultUri) });
			return result?.map((file) => file.fsPath);
		} catch (error: any) {
			getLogger().error(error.message);
			return [];
		}
	});
	messenger.onRequest(SelectCommitToBuild, async (params: SelectCommitToBuildReq) => {
		const getQuickPickItems = (commits: CommitHistory[]) => {
			if (commits?.length > 0) {
				const latestCommit = commits?.find((item) => item.isLatest) ?? commits[0];
				return [
					{ kind: QuickPickItemKind.Separator, label: "Latest Commit" },
					{ label: "Build Latest", detail: latestCommit.message, description: getShortenedHash(latestCommit.sha), item: latestCommit },
					{ kind: QuickPickItemKind.Separator, label: "Previous Commits" },
					...commits.filter((item) => !item.isLatest).map((item) => ({ label: item.message, description: getShortenedHash(item.sha), item })),
				];
			}
			return [];
		};

		const selectedComponent = await quickPickWithLoader({
			cacheQuickPicks: getQuickPickItems(
				dataCacheStore
					.getState()
					.getCommits(params.org.handle, params.project.handler, params.component.metadata.name, params.deploymentTrack.branch),
			),
			loadQuickPicks: async () => {
				const commits = await ext.clients.rpcClient.getCommits({
					branch: params.deploymentTrack.branch,
					componentId: params.component.metadata.id,
					orgHandler: params.org.handle,
					orgId: params.org.id.toString(),
				});
				dataCacheStore
					.getState()
					.setCommits(params.org.handle, params.project.handler, params.component.metadata.name, params.deploymentTrack.branch, commits);
				return getQuickPickItems(commits);
			},
			loadingTitle: `Loading commits from branch ${params.deploymentTrack.branch}...`,
			selectTitle: `Select Commit from branch ${params.deploymentTrack.branch}, to Build`,
			placeholder: "Select Commit",
		});
		return selectedComponent;
	});
	messenger.onNotification(RefreshContextState, () => {
		contextStore.getState().refreshState();
	});
	messenger.onNotification(ShowErrorMessage, (error: string) => {
		window.showErrorMessage(error);
	});
	messenger.onNotification(ShowInfoMessage, (info: string) => {
		window.showInformationMessage(info);
	});
	messenger.onNotification(SendTelemetryEventNotification, (event: SendTelemetryEventParams) => {
		sendTelemetryEvent(event.eventName, event.properties, event.measurements);
	});
	messenger.onNotification(SendTelemetryExceptionNotification, (event: SendTelemetryExceptionParams) => {
		sendTelemetryException(event.error, event.properties, event.measurements);
	});
	messenger.onNotification(CloseWebViewNotification, () => {
		if ("dispose" in view) {
			view.dispose();
		}
	});
	messenger.onRequest(OpenComponentViewDrawer, (params: OpenComponentViewDrawerReq) => {
		webviewStateStore.getState().onOpenComponentDrawer(params.componentKey, params.drawer, params.params);
	});
	messenger.onRequest(CloseComponentViewDrawer, (componentKey: string) => {
		webviewStateStore.getState().onCloseComponentDrawer(componentKey);
	});
	messenger.onRequest(HasDirtyLocalGitRepo, async (componentPath: string) => {
		return hasDirtyRepo(componentPath, ext.context);
	});
	messenger.onRequest(GetConfigFileDrifts, async (params: GetConfigFileDriftsReq) => {
		return getConfigFileDrifts(params.repoUrl, params.branch, params.repoDir, ext.context);
	});

	// Register Choreo CLL RPC handler
	registerChoreoRpcResolver(messenger, ext.clients.rpcClient);
}

export class WebViewPanelRpc {
	private _messenger = new Messenger();
	private _panel: WebviewPanel | undefined;

	constructor(view: WebviewPanel) {
		this.registerPanel(view);
		registerWebviewRPCHandlers(this._messenger, view);
	}

	public get panel(): WebviewPanel | undefined {
		return this._panel;
	}

	public registerPanel(view: WebviewPanel) {
		if (!this._panel) {
			this._messenger.registerWebviewPanel(view, {
				broadcastMethods: [...WebviewNotificationsMethodList],
			});
			this._panel = view;
		} else {
			throw new Error("Panel already registered");
		}
	}

	public dispose() {
		if (this._panel) {
			this._panel.dispose();
			this._panel = undefined;
		}
	}
}

export class WebViewViewRPC {
	private _messenger = new Messenger();
	private _view: WebviewView | undefined;

	constructor(view: WebviewView) {
		this.registerView(view);
		try {
			registerWebviewRPCHandlers(this._messenger, view);
		} catch (err) {
			console.log("registerWebviewRPCHandlers error:", err);
		}
	}

	public get view(): WebviewView | undefined {
		return this._view;
	}

	public registerView(view: WebviewView) {
		if (!this._view) {
			this._messenger.registerWebviewView(view, {
				broadcastMethods: [...WebviewNotificationsMethodList],
			});
			this._view = view;
		} else {
			throw new Error("View already registered");
		}
	}
}
