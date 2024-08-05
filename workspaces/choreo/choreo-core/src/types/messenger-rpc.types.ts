/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import type { NotificationType, RequestType } from "vscode-messenger-common";
import type { CreateComponentReq } from "./cli-rpc.types";
import type {
	CommitHistory,
	ComponentEP,
	ComponentKind,
	DeploymentTrack,
	Environment,
	Organization,
	Project,
	WebviewQuickPickItem,
} from "./common.types";
import type { Endpoint } from "./config-file.types";
import type { AuthState, ContextStoreState, WebviewState } from "./store.types";

// Request types
export const GetAuthState: RequestType<void, AuthState> = { method: "getAuthState" };
export const GetContextState: RequestType<void, ContextStoreState> = { method: "getContextState" };
export const GetWebviewStoreState: RequestType<void, WebviewState> = { method: "getWebviewStoreState" };
export const OpenSubDialogRequest: RequestType<OpenDialogOptions, string[]> = { method: "openDialog" };
export const GetGitRemotes: RequestType<string, string[]> = { method: "getGitRemotes" };
export const JoinFilePaths: RequestType<string[], string> = { method: "joinFilePaths" };
export const GetSubPath: RequestType<{ subPath: string; parentPath: string }, string | null> = { method: "getSubPath" };
export const SetWebviewCache: RequestType<SetWebviewCacheRequestParam, void> = { method: "setWebviewCache" };
export const RestoreWebviewCache: RequestType<IDBValidKey, unknown> = { method: "restoreWebviewCache" };
export const ClearWebviewCache: RequestType<IDBValidKey, void> = { method: "clearWebviewCache" };
export const GoToSource: RequestType<string, void> = { method: "goToSource" };
export const ShowErrorMessage: NotificationType<string> = { method: "showErrorMessage" };
export const ShowInfoMessage: NotificationType<string> = { method: "showInfoMessage" };
export const RefreshContextState: NotificationType<void> = { method: "refreshContextState" };
export const DeleteFile: RequestType<string, void> = { method: "deleteFile" };
export const ShowConfirmMessage: RequestType<ShowConfirmBoxReq, boolean> = { method: "showConfirmMessage" };
export const ShowQuickPick: RequestType<ShowWebviewQuickPickItemsReq, WebviewQuickPickItem | undefined> = { method: "showQuickPicks" };
export const ShowInputBox: RequestType<ShowWebviewInputBoxReq, string | undefined> = { method: "showWebviewInputBoxReq" };
export const ReadServiceEndpoints: RequestType<string, ReadEndpointsResp> = { method: "readServiceEndpoints" };
export const ViewBuildsLogs: RequestType<ViewBuildLogsReq, void> = { method: "viewBuildLogs" };
export const ViewRuntimeLogs: RequestType<ViewRuntimeLogsReq, void> = { method: "viewRuntimeLogs" };
export const TriggerGithubAuthFlow: RequestType<string, void> = { method: "triggerGithubAuthFlow" };
export const TriggerGithubInstallFlow: RequestType<string, void> = { method: "triggerGithubInstallFlow" };
export const SubmitComponentCreate: RequestType<SubmitComponentCreateReq, ComponentKind> = { method: "submitComponentCreate" };
export const GetDirectoryFileNames: RequestType<string, string[]> = { method: "getDirectoryFileNames" };
export const FileExists: RequestType<string, boolean> = { method: "fileExists" };
export const OpenTestView: RequestType<OpenTestViewReq, void> = { method: "openTestView" };
export const ExecuteCommandRequest: RequestType<string[], unknown> = { method: "executeCommand" };
export const OpenExternal: RequestType<string, void> = { method: "openExternal" };
export const ShowOpenDialogRequest: RequestType<OpenDialogOptions, string[]> = { method: "showOpenDialog" };
export const SelectCommitToBuild: RequestType<SelectCommitToBuildReq, CommitHistory | undefined> = { method: "selectCommitToBuild" };

const NotificationMethods = {
	onAuthStateChanged: "onAuthStateChanged",
	onWebviewStateChanged: "onWebviewStateChanged",
	onContextStateChanged: "onContextStateChanged",
};

export const WebviewNotificationsMethodList = Object.values(NotificationMethods);

// Notification types
export const SendProjectTelemetryEventNotification: NotificationType<SendTelemetryEventParams> = { method: "sendProjectTelemetryEvent" };
export const SendTelemetryEventNotification: NotificationType<SendTelemetryEventParams> = { method: "sendTelemetryEvent" };
export const SendTelemetryExceptionNotification: NotificationType<SendTelemetryExceptionParams> = { method: "sendTelemetryException" };
export const CloseWebViewNotification: NotificationType<void> = { method: "close" };
export const AuthStoreChangedNotification: NotificationType<AuthState> = { method: NotificationMethods.onAuthStateChanged };
export const WebviewStateChangedNotification: NotificationType<WebviewState> = { method: NotificationMethods.onWebviewStateChanged };
export const ContextStoreChangedNotification: NotificationType<ContextStoreState> = { method: NotificationMethods.onContextStateChanged };

export interface OpenTestViewReq {
	component: ComponentKind;
	project: Project;
	org: Organization;
	env: Environment;
	deploymentTrack: DeploymentTrack;
	endpoints: ComponentEP[];
}

export interface SubmitComponentCreateReq {
	org: Organization;
	project: Project;
	createParams: CreateComponentReq;
	endpoint?: Endpoint;
}

export interface ViewBuildLogsReq {
	orgId: string;
	orgHandler: string;
	componentId: string;
	displayType: string;
	projectId: string;
	buildId: number;
}

export interface ViewRuntimeLogsReq {
	type: "component-application" | "component-gateway";
	orgName: string;
	projectName: string;
	componentName: string;
	deploymentTrackName: string;
	envName: string;
}

export interface ReadEndpointsResp {
	endpoints: Endpoint[];
	filePath: string;
}

export interface OpenDialogOptions {
	title: string;
	canSelectFiles: boolean;
	canSelectFolders: boolean;
	canSelectMany: boolean;
	defaultUri: string;
	filters: { [name: string]: string[] };
}

export interface ShowConfirmBoxReq {
	message: string;
	buttonText: string;
}

export interface ViewComponentDetailsReq {
	organization: Organization;
	project: Project;
	component: ComponentKind;
	componentPath: string;
}

export interface ShowWebviewQuickPickItemsReq {
	items: WebviewQuickPickItem[];
	title: string;
}

export interface ShowWebviewInputBoxReq {
	title: string;
	value?: string;
	placeholder?: string;
	regex?: {
		expression: RegExp;
		message: string;
	};
}

export interface SelectCommitToBuildReq {
	org: Organization;
	component: ComponentKind;
	project: Project;
	deploymentTrack: DeploymentTrack;
}

export interface SetWebviewCacheRequestParam {
	cacheKey: IDBValidKey;
	data: unknown;
}

export interface SendTelemetryExceptionParams {
	error: Error;
	properties?: {
		[key: string]: string;
	};
	measurements?: {
		[key: string]: number;
	};
}

export interface SendTelemetryEventParams {
	eventName: string;
	properties?: {
		[key: string]: string;
	};
	measurements?: {
		[key: string]: number;
	};
}
