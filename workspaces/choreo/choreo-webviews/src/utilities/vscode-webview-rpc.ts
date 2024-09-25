/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
	type AuthState,
	AuthStoreChangedNotification,
	ChoreoRpcWebview,
	ClearWebviewCache,
	CloseComponentViewDrawer,
	CloseWebViewNotification,
	type CommitHistory,
	type ComponentKind,
	ContextStoreChangedNotification,
	type ContextStoreState,
	DeleteFile,
	ExecuteCommandRequest,
	FileExists,
	GetAuthState,
	GetConfigFileDrifts,
	type GetConfigFileDriftsReq,
	GetContextState,
	GetDirectoryFileNames,
	GetLocalGitData,
	type GetLocalGitDataResp,
	GetSubPath,
	GetWebviewStoreState,
	GoToSource,
	HasDirtyLocalGitRepo,
	type IChoreoRPCClient,
	JoinFilePaths,
	OpenComponentViewDrawer,
	type OpenComponentViewDrawerReq,
	type OpenDialogOptions,
	OpenExternal,
	OpenSubDialogRequest,
	OpenTestView,
	type OpenTestViewReq,
	type ReadEndpointsResp,
	ReadServiceEndpoints,
	RefreshContextState,
	RestoreWebviewCache,
	SaveFile,
	type SaveFileReq,
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
	ShowQuickPick,
	type ShowWebviewInputBoxReq,
	type ShowWebviewQuickPickItemsReq,
	SubmitComponentCreate,
	type SubmitComponentCreateReq,
	SubmitEndpointsCreate,
	type SubmitEndpointsCreateReq,
	TriggerGithubAuthFlow,
	TriggerGithubInstallFlow,
	type ViewBuildLogsReq,
	ViewBuildsLogs,
	ViewRuntimeLogs,
	type ViewRuntimeLogsReq,
	type WebviewQuickPickItem,
	type WebviewState,
	WebviewStateChangedNotification,
} from "@wso2-enterprise/choreo-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";
import type { WebviewApi } from "vscode-webview";
import { vscodeApiWrapper } from "./vscode-api-wrapper";

export class ChoreoWebViewAPI {
	private readonly _messenger;
	private static _instance: ChoreoWebViewAPI;
	private _rpcClient: ChoreoRpcWebview;

	constructor(vscodeAPI: WebviewApi<unknown>) {
		this._messenger = new Messenger(vscodeAPI);
		this._messenger.start();
		this._rpcClient = new ChoreoRpcWebview(this._messenger);
	}

	public static getInstance() {
		if (!this._instance) {
			this._instance = new ChoreoWebViewAPI(vscodeApiWrapper);
		}
		return this._instance;
	}

	public getChoreoRpcClient(): IChoreoRPCClient {
		return this._rpcClient;
	}

	// Notifications
	public onAuthStateChanged(callback: (state: AuthState) => void) {
		this._messenger.onNotification(AuthStoreChangedNotification, callback);
	}

	public onWebviewStateChanged(callback: (state: WebviewState) => void) {
		this._messenger.onNotification(WebviewStateChangedNotification, callback);
	}

	public onContextStateChanged(callback: (state: ContextStoreState) => void) {
		this._messenger.onNotification(ContextStoreChangedNotification, callback);
	}

	// Send Notifications
	public showErrorMsg(error: string) {
		this._messenger.sendNotification(ShowErrorMessage, HOST_EXTENSION, error);
	}

	public showInfoMsg(info: string) {
		this._messenger.sendNotification(ShowInfoMessage, HOST_EXTENSION, info);
	}

	public closeWebView() {
		this._messenger.sendNotification(CloseWebViewNotification, HOST_EXTENSION, undefined);
	}

	public refreshContextState() {
		this._messenger.sendNotification(RefreshContextState, HOST_EXTENSION, undefined);
	}

	public sendTelemetryEvent(params: SendTelemetryEventParams) {
		return this._messenger.sendNotification(SendTelemetryEventNotification, HOST_EXTENSION, params);
	}

	public sendTelemetryException(params: SendTelemetryExceptionParams) {
		return this._messenger.sendNotification(SendTelemetryExceptionNotification, HOST_EXTENSION, params);
	}

	// Invoke RPC Calls
	public async getAuthState(): Promise<AuthState> {
		return this._messenger.sendRequest(GetAuthState, HOST_EXTENSION, undefined);
	}

	public async getContextState(): Promise<ContextStoreState> {
		return this._messenger.sendRequest(GetContextState, HOST_EXTENSION, undefined);
	}

	public async getWebviewStoreState(): Promise<WebviewState> {
		return this._messenger.sendRequest(GetWebviewStoreState, HOST_EXTENSION, undefined);
	}

	public async showOpenSubDialog(options: OpenDialogOptions): Promise<string[] | undefined> {
		return this._messenger.sendRequest(OpenSubDialogRequest, HOST_EXTENSION, options);
	}

	public async getLocalGitData(dirPath: string): Promise<GetLocalGitDataResp> {
		return this._messenger.sendRequest(GetLocalGitData, HOST_EXTENSION, dirPath);
	}

	public async joinFilePaths(paths: string[]): Promise<string> {
		return this._messenger.sendRequest(JoinFilePaths, HOST_EXTENSION, paths);
	}

	public async getSubPath(params: { subPath: string; parentPath: string }): Promise<string | null> {
		return this._messenger.sendRequest(GetSubPath, HOST_EXTENSION, params);
	}

	public triggerCmd(cmdId: string, ...args: any) {
		return this._messenger.sendRequest(ExecuteCommandRequest, HOST_EXTENSION, [cmdId, ...args]);
	}

	public async setWebviewCache(cacheKey: IDBValidKey, data: unknown): Promise<void> {
		return this._messenger.sendRequest(SetWebviewCache, HOST_EXTENSION, { cacheKey, data });
	}

	public async restoreWebviewCache(cacheKey: IDBValidKey): Promise<unknown> {
		return this._messenger.sendRequest(RestoreWebviewCache, HOST_EXTENSION, cacheKey);
	}

	public async clearWebviewCache(cacheKey: IDBValidKey): Promise<unknown> {
		return this._messenger.sendRequest(ClearWebviewCache, HOST_EXTENSION, cacheKey);
	}

	public async deleteFile(filePath: string): Promise<void> {
		return this._messenger.sendRequest(DeleteFile, HOST_EXTENSION, filePath);
	}

	public async showConfirmMessage(params: ShowConfirmBoxReq): Promise<boolean> {
		return this._messenger.sendRequest(ShowConfirmMessage, HOST_EXTENSION, params);
	}

	public async readServiceEndpoints(componentPath: string): Promise<ReadEndpointsResp> {
		return this._messenger.sendRequest(ReadServiceEndpoints, HOST_EXTENSION, componentPath);
	}

	public async showQuickPicks(params: ShowWebviewQuickPickItemsReq): Promise<WebviewQuickPickItem | undefined> {
		return this._messenger.sendRequest(ShowQuickPick, HOST_EXTENSION, params);
	}

	public async showInputBox(params: ShowWebviewInputBoxReq): Promise<string | undefined> {
		return this._messenger.sendRequest(ShowInputBox, HOST_EXTENSION, params);
	}

	public async viewBuildLogs(params: ViewBuildLogsReq): Promise<void> {
		return this._messenger.sendRequest(ViewBuildsLogs, HOST_EXTENSION, params);
	}

	public async viewRuntimeLogs(params: ViewRuntimeLogsReq): Promise<void> {
		return this._messenger.sendRequest(ViewRuntimeLogs, HOST_EXTENSION, params);
	}

	public async triggerGithubAuthFlow(orgId: string): Promise<void> {
		return this._messenger.sendRequest(TriggerGithubAuthFlow, HOST_EXTENSION, orgId);
	}

	public async triggerGithubInstallFlow(orgId: string): Promise<void> {
		return this._messenger.sendRequest(TriggerGithubInstallFlow, HOST_EXTENSION, orgId);
	}

	public async submitComponentCreate(params: SubmitComponentCreateReq): Promise<ComponentKind> {
		return this._messenger.sendRequest(SubmitComponentCreate, HOST_EXTENSION, params);
	}

	public async submitEndpointsCreate(params: SubmitEndpointsCreateReq): Promise<void> {
		return this._messenger.sendRequest(SubmitEndpointsCreate, HOST_EXTENSION, params);
	}

	public async getDirectoryFileNames(path: string): Promise<string[]> {
		return this._messenger.sendRequest(GetDirectoryFileNames, HOST_EXTENSION, path);
	}

	public async fileExist(path: string): Promise<boolean> {
		return this._messenger.sendRequest(FileExists, HOST_EXTENSION, path);
	}

	public async openTestView(params: OpenTestViewReq): Promise<void> {
		return this._messenger.sendRequest(OpenTestView, HOST_EXTENSION, params);
	}

	public async goToSource(filePath: string): Promise<void> {
		return this._messenger.sendRequest(GoToSource, HOST_EXTENSION, filePath);
	}

	public async saveFile(params: SaveFileReq): Promise<string> {
		return this._messenger.sendRequest(SaveFile, HOST_EXTENSION, params);
	}

	public async selectCommitToBuild(params: SelectCommitToBuildReq): Promise<CommitHistory | undefined> {
		return this._messenger.sendRequest(SelectCommitToBuild, HOST_EXTENSION, params);
	}

	public async openExternal(url: string): Promise<void> {
		this._messenger.sendRequest(OpenExternal, HOST_EXTENSION, url);
	}

	public async openComponentViewDrawer(params: OpenComponentViewDrawerReq): Promise<void> {
		return this._messenger.sendRequest(OpenComponentViewDrawer, HOST_EXTENSION, params);
	}

	public async closeComponentViewDrawer(componentKey: string): Promise<void> {
		return this._messenger.sendRequest(CloseComponentViewDrawer, HOST_EXTENSION, componentKey);
	}

	public async hasDirtyLocalGitRepo(componentPath: string): Promise<boolean> {
		return this._messenger.sendRequest(HasDirtyLocalGitRepo, HOST_EXTENSION, componentPath);
	}

	public async getConfigFileDrifts(componentPath: GetConfigFileDriftsReq): Promise<string[]> {
		return this._messenger.sendRequest(GetConfigFileDrifts, HOST_EXTENSION, componentPath);
	}
}
