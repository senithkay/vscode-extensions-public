/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { RequestType, NotificationType } from 'vscode-messenger-common';
import { GetComponentModelResponse } from '@wso2-enterprise/ballerina-languageclient';
import {
   Organization,
   ChoreoLoginStatus,
   ChoreoWorkspaceMetaData,
   Project,
   Component,
   PushedComponent,
   ComponentCount,
   ChoreoComponentCreationParams,
   getLocalComponentDirMetaDataRequest,
   LocalComponentDirMetaDataRes,
   GitRepo,
   BuildStatus,
   Deployment,
   Endpoint,
   UserInfo,
   EndpointData,
   Buildpack,
   AuthState,
   LinkedDirectoryState,
   ComponentKind,
   WebviewQuickPickItem,
} from './types';

export const GetAuthState: RequestType<void, AuthState> = { method: 'getAuthState' };
export const GetLinkedDirState: RequestType<void, LinkedDirectoryState> = { method: 'getLinkedState' };
export const OpenSubDialogRequest: RequestType<OpenDialogOptions, string[]> = { method: 'openDialog' };
export const GetGetRemotes: RequestType<string[], string[]> = { method: 'getGitRemotes' };
export const JoinFilePaths: RequestType<string[], string> = { method: 'joinFilePaths' };
export const SetWebviewCache: RequestType<SetWebviewCacheRequestParam, void> = { method: 'setWebviewCache' };
export const RestoreWebviewCache: RequestType<IDBValidKey, unknown> = { method: 'restoreWebviewCache' };
export const ClearWebviewCache: RequestType<IDBValidKey, void> = { method: 'clearWebviewCache' };
export const GoToSource: RequestType<string, void> = { method: 'goToSource' };
export const ShowErrorMessage: NotificationType<string> = { method: 'showErrorMessage' };
export const ShowInfoMessage: NotificationType<string> = { method: 'showInfoMessage' };
export const RefreshLinkedDirState: NotificationType<void> = { method: 'refreshLinkedDirState' };
export const DeleteFile: RequestType<string, void> = { method: 'deleteFile' };
export const ShowConfirmMessage: RequestType<ShowConfirmBoxReq, boolean> = { method: 'showConfirmMessage' };
export const ShowQuickPick: RequestType<ShowWebviewQuickPickItemsReq, WebviewQuickPickItem | undefined> = { method: 'showQuickPicks' };
export const OpenComponentInConsole: RequestType<OpenComponentInConsoleReq, void> = { method: 'openComponentInConsole' };
export const ViewComponentDetails: RequestType<ViewComponentDetailsReq, void> = { method: 'viewComponentDetails' };
export const ReadServiceEndpoints: RequestType<string, ReadEndpointsResp> = { method: 'readServiceEndpoints' };
export const ViewBuildsLogs: RequestType<ViewBuildLogsReq, void> = { method: 'viewBuildLogs' };
export const ViewRuntimeLogs: RequestType<ViewRuntimeLogsReq, void> = { method: 'viewRuntimeLogs' };

export interface ViewBuildLogsReq { orgId: string; orgHandler: string; componentName: string; projectId: string; buildId: number;}
export interface ViewRuntimeLogsReq {
   type: {label: string, flag: "component-application" | "component-gateway"};
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
export interface OpenDialogOptions {   // here
   title: string,
   canSelectFiles: boolean, 
   canSelectFolders: boolean, 
   canSelectMany: boolean, 
   defaultUri: string, 
   filters: { [name: string]: string[] }
}

export interface ShowConfirmBoxReq {
   message: string;
   buttonText: string;
}

export interface OpenComponentInConsoleReq {
   orgHandler: string;
   projectHandler: string;
   componentHandler: string;
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
/////////////////////////////////////
/////////////////////////////////////
// TODO: remove OLD /////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface SubpathAvailableRequest {
      subpath: string;
      orgName: string;
      repoName: string;
      projectID: string;
}
export interface IsBareRepoRequestParams {
      orgName: string;
      repoName: string;
      projectID: string;
}

export interface SendTelemetryEventParams {
   eventName: string,
   properties?: { [key: string]: string; },
   measurements?: { [key: string]: number; }
}

export interface SendTelemetryExceptionParams {
   error: Error,
   properties?: { [key: string]: string; },
   measurements?: { [key: string]: number; }
}

export interface GetComponentsRequestParams {
   orgId: number;
   projectId: string;
}

export interface CheckProjectDeletedParams {
   orgId: number; 
   projectId: string;
}

export interface GetBuildPackParams {
   orgId: number;
   componentType: string;
}

export interface GetDeletedComponentsParams {
   orgId: number;
   projectId: string;
}

export interface GetComponentCountParams {
   orgId: number;
   projectId: string;
}

export interface HasChoreoSubscriptionParams {
   orgId: number;
}

export interface CloneChoreoProjectParams {
   orgId: number;
   projectId: string;
}

export interface PushLocalComponentsToChoreoParams {
   orgId: number;
   projectId: string;
   componentNames: string[];
}

export interface SetWebviewCacheRequestParam {
   cacheKey: IDBValidKey;
   data: unknown;
}

// request types 
export const SendProjectTelemetryEventNotification: NotificationType<SendTelemetryEventParams> = { method: 'sendProjectTelemetryEvent' };
export const SendTelemetryEventNotification: NotificationType<SendTelemetryEventParams> = { method: 'sendTelemetryEvent' };
export const SendTelemetryExceptionNotification: NotificationType<SendTelemetryExceptionParams> = { method: 'sendTelemetryException' };
export const GetUserInfoRequest: RequestType<void, UserInfo> = { method: 'getUserInfo' };
export const GetLoginStatusRequest: RequestType<string, ChoreoLoginStatus> = { method: 'getLoginStatus' };
export const GetCurrentOrgRequest: RequestType<string, Organization> = { method: 'getCurrentOrg' };
export const GetAllProjectsRequest: RequestType<number, Project[]> = { method: 'getAllProjects' };
export const GetProject: RequestType<string, Project> = { method: 'getProject' };
export const GetComponents: RequestType<GetComponentsRequestParams, Component[]> = { method: 'getComponents' };
export const GetDeletedComponents: RequestType<GetDeletedComponentsParams, PushedComponent[]> = { method: 'getDeletedComponents' };
export const RemoveDeletedComponents: RequestType<{projectId: string, components: PushedComponent[]}, void> = { method: 'removeDeletedComponents' };
export const GetComponentBuildStatus: RequestType<Component, BuildStatus> = { method: 'getComponentBuildStatus' };
export const GetComponentDevDeployment: RequestType<Component, Deployment> = { method: 'getComponentDevDeployment' };
export const DeleteComponent: RequestType<{projectId: string, component: Component}, Component | null> = { method: 'deleteComponent' };
export const PullComponent: RequestType<{projectId: string, componentId: string}, void> = { method: 'pullComponent' };
export const GetProjectLocation: RequestType<string, string | undefined> = { method: 'getProjectLocation' };
export const OpenExternal: RequestType<string, void> = { method: 'openExternal' };
export const OpenChoreoProject: RequestType<string, void> = { method: 'openChoreoProject' };
export const CloneChoreoProject: RequestType<CloneChoreoProjectParams, void> = { method: 'cloneChoreoProject' };
export const CloneChoreoProjectWithDir: RequestType<{ project: Project, dirPath: string, askOpeningOptions?: boolean }, void> = { method: 'cloneChoreoProjectWithDir' };
export const AskProjectDirPath: RequestType<void, string | undefined> = { method: 'askProjectDirPath' };
export const setPreferredProjectRepository: RequestType<{ projId: string, repo: GitRepo }, void> = { method: 'setPreferredProjectRepository' };
export const getPreferredProjectRepository: RequestType<string, GitRepo> = { method: 'getPreferredProjectRepository' };
export const SetExpandedComponents: RequestType<{ projId: string, componentNames: string[] }, void> = { method: 'setExpandedComponents' };
export const GetExpandedComponents: RequestType<string, string[]> = { method: 'getExpandedComponents' };
export const CheckProjectDeleted: RequestType<CheckProjectDeletedParams, boolean> = { method: 'CheckProjectDeleted' };
export const isChoreoProject: RequestType<void, boolean> = { method: 'isChoreoProject' };
export const GetChoreoWorkspaceMetadata: RequestType<void, ChoreoWorkspaceMetaData> = { method: 'getChoreoWorkspaceMetadata' };
export const isSubpathAvailable: RequestType<SubpathAvailableRequest, boolean> = { method: 'isSubpathAvailable' };
export const ReadEndpointsYaml: RequestType<SubpathAvailableRequest, Endpoint | undefined> = { method: 'readEndpointsYaml' };
export const OpenBillingPortal: RequestType<string, void> = { method: 'openBillingPortal' };
export const GetLocalComponentDirMetaData: RequestType<getLocalComponentDirMetaDataRequest, LocalComponentDirMetaDataRes> = { method: 'getLocalComponentDirMetaData' };
export const SetChoreoInstallOrg: RequestType<number, void> = { method: 'setChoreoInstallOrg' };
export const ClearChoreoInstallOrg: RequestType<void, void> = { method: 'clearChoreoInstallOrg' };
export const getChoreoProject: RequestType<void, Project> = { method: 'getChoreoProject' };
export const getConsoleUrl: RequestType<void, string> = { method: 'getConsoleUrl' };
export const PushLocalComponentsToChoreo: RequestType<PushLocalComponentsToChoreoParams, string[]> = { method: 'pushLocalComponentsToChoreo' };
export const PushLocalComponentToChoreo: RequestType<{projectId: string; componentName: string }, void> = { method: 'pushLocalComponentToChoreo' };
export const OpenCellView: RequestType<string, void> = { method: 'openCellView' };
export const getEndpointsForVersion: RequestType<{componentId: string, versionId: string, orgId: number}, EndpointData | null> = { method: 'getEndpointsForVersion' };
export const getDiagramComponentModel: RequestType<{ projId: string, orgId: number }, GetComponentModelResponse> = { method: 'getDiagramComponentModel' };
export const ExecuteCommandRequest: RequestType<string[], unknown> = { method: 'executeCommand' };
export const UpdateProjectOverview: RequestType<string, void> = { method: 'updateProjectOverview' };
export const showOpenDialogRequest: RequestType<OpenDialogOptions, string[]> = { method: 'showOpenDialog' };   // here
export const GetComponentCount: RequestType<GetComponentCountParams, ComponentCount> = { method: 'getComponentCount' };
export const IsBareRepoRequest: RequestType<IsBareRepoRequestParams, boolean> = { method: 'isBareRepo' };
export const HasChoreoSubscription: RequestType<HasChoreoSubscriptionParams, boolean> = { method: 'hasChoreoSubscription' };
export const CreateNonBalLocalComponent: RequestType<ChoreoComponentCreationParams, void> = { method: 'createNonBalLocalComponent' };
export const CreateNonBalLocalComponentFromExistingSource: RequestType<ChoreoComponentCreationParams, void> = { method: 'createNonBalLocalComponentFromExistingSource' };
export const CreateBalLocalComponentFromExistingSource: RequestType<ChoreoComponentCreationParams, void> = { method: 'CreateBalLocalComponentFromExistingSource' };
export const GetBuildpack: RequestType<GetBuildPackParams, Buildpack[]> = { method: 'getBuildpack' };
export const FireRefreshComponentList: RequestType<void, void> = { method: 'fireRefreshComponentList' };
export const FireRefreshWorkspaceMetadata: RequestType<void, void> = { method: 'fireRefreshWorkspaceMetadata' };


// notification types
export const LoginStatusChangedNotification: NotificationType<string> = { method: 'loginStatusChanged' };
export const SelectedOrgChangedNotification: NotificationType<Organization> = { method: 'selectedOrgChanged' };
export const SelectedProjectChangedNotification: NotificationType<string> = { method: 'selectedProjectChanged' };
export const CloseWebViewNotification: NotificationType<void> = { method: 'close' };
export const RefreshComponentsNotification: NotificationType<void> = { method: 'refreshComponents' };
export const RefreshWorkspaceNotification: NotificationType<void> = { method: 'refreshWorkspace' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeError(err: any) {
   return {
      message: err.message,
      cause: err.cause ? err.cause.message : ""
   };
}
