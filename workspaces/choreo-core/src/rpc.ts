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
import { RequestType, NotificationType } from 'vscode-messenger-common';
import { GetComponentModelResponse } from '@wso2-enterprise/ballerina-languageclient';
import { Organization, ChoreoLoginStatus, Project, Component, PushedComponent, ComponentCount, ChoreoComponentCreationParams, getLocalComponentDirMetaDataRequest, getLocalComponentDirMetaDataRes, GitRepo } from './types';

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

// request types 
export const SendProjectTelemetryEventNotification: NotificationType<SendTelemetryEventParams> = { method: 'sendProjectTelemetryEvent' };
export const SendTelemetryEventNotification: NotificationType<SendTelemetryEventParams> = { method: 'sendTelemetryEvent' };
export const SendTelemetryExceptionNotification: NotificationType<SendTelemetryExceptionParams> = { method: 'sendTelemetryException' };
export const GetLoginStatusRequest: RequestType<string, ChoreoLoginStatus> = { method: 'getLoginStatus' };
export const GetCurrentOrgRequest: RequestType<string, Organization> = { method: 'getCurrentOrg' };
export const GetAllOrgsRequest: RequestType<string, Organization[]> = { method: 'getAllOrgs' };
export const GetAllProjectsRequest: RequestType<string, Project[]> = { method: 'getAllProjects' };
export const GetProject: RequestType<string, Project> = { method: 'getProject' };
export const GetComponents: RequestType<string, Component[]> = { method: 'getComponents' };
export const GetDeletedComponents: RequestType<string, PushedComponent[]> = { method: 'getDeletedComponents' };
export const RemoveDeletedComponents: RequestType<{projectId: string, components: PushedComponent[]}, void> = { method: 'removeDeletedComponents' };
export const GetEnrichedComponents: RequestType<string, Component[]> = { method: 'getEnrichedComponents' };
export const GetEnrichedComponent: RequestType<Component, Component> = { method: 'getEnrichedComponent' };
export const DeleteComponent: RequestType<{projectId: string, component: Component}, Component | null> = { method: 'deleteComponent' };
export const PullComponent: RequestType<{projectId: string, componentId: string}, void> = { method: 'pullComponent' };
export const GetProjectLocation: RequestType<string, string | undefined> = { method: 'getProjectLocation' };
export const OpenExternal: RequestType<string, void> = { method: 'openExternal' };
export const OpenChoreoProject: RequestType<string, void> = { method: 'openChoreoProject' };
export const CloneChoreoProject: RequestType<string, void> = { method: 'cloneChoreoProject' };
export const CloneChoreoProjectWithDir: RequestType<{ project: Project, dirPath: string }, void> = { method: 'cloneChoreoProjectWithDir' };
export const AskProjectDirPath: RequestType<void, string | undefined> = { method: 'askProjectDirPath' };
export const setProjectRepository: RequestType<{ projId: string, repo: GitRepo }, void> = { method: 'setProjectRepository' };
export const getProjectRepository: RequestType<string, GitRepo> = { method: 'getProjectRepository' };
export const setPreferredProjectRepository: RequestType<{ projId: string, repo: GitRepo }, void> = { method: 'setPreferredProjectRepository' };
export const getPreferredProjectRepository: RequestType<string, GitRepo> = { method: 'getPreferredProjectRepository' };
export const CheckProjectDeleted: RequestType<string, boolean> = { method: 'CheckProjectDeleted' };
export const isChoreoProject: RequestType<void, boolean> = { method: 'isChoreoProject' };
export const isSubpathAvailable: RequestType<SubpathAvailableRequest, boolean> = { method: 'isSubpathAvailable' };
export const GetLocalComponentDirMetaData: RequestType<getLocalComponentDirMetaDataRequest, getLocalComponentDirMetaDataRes> = { method: 'getLocalComponentDirMetaData' };
export const getChoreoProject: RequestType<void, Project> = { method: 'getChoreoProject' };
export const getConsoleUrl: RequestType<void, string> = { method: 'getConsoleUrl' };
export const PushLocalComponentsToChoreo: RequestType<string, void> = { method: 'pushLocalComponentsToChoreo' };
export const PushLocalComponentToChoreo: RequestType<{projectId: string; componentName: string }, void> = { method: 'pushLocalComponentToChoreo' };
export const OpenArchitectureView: RequestType<string, void> = { method: 'openArchitectureView' };
export const getDiagramComponentModel: RequestType<{ projId: string, orgHandler: string }, GetComponentModelResponse> = { method: 'getDiagramComponentModel' };
export const ExecuteCommandRequest: RequestType<string[], unknown> = { method: 'executeCommand' };
export const UpdateProjectOverview: RequestType<string, void> = { method: 'updateProjectOverview' };
export const showOpenDialogRequest: RequestType<OpenDialogOptions, string[]> = { method: 'showOpenDialog' };
export const GetComponentCount: RequestType<number, ComponentCount> = { method: 'getComponentCount' };
export const IsBareRepoRequest: RequestType<IsBareRepoRequestParams, boolean> = { method: 'isBareRepo' };
export const HasChoreoSubscription: RequestType<string, boolean> = { method: 'hasChoreoSubscription' };
export const CreateNonBalLocalComponent: RequestType<ChoreoComponentCreationParams, void> = { method: 'createNonBalLocalComponent' };
export const CreateNonBalLocalComponentFromExistingSource: RequestType<ChoreoComponentCreationParams, void> = { method: 'createNonBalLocalComponentFromExistingSource' };

export interface OpenDialogOptions {
   title: string,
   canSelectFiles: boolean, 
   canSelectFolders: boolean, 
   canSelectMany: boolean, 
   defaultUri: string, 
   filters: { [name: string]: string[] }
}

// notification types
export const LoginStatusChangedNotification: NotificationType<string> = { method: 'loginStatusChanged' };
export const SelectedOrgChangedNotification: NotificationType<Organization> = { method: 'selectedOrgChanged' };
export const SelectedProjectChangedNotification: NotificationType<string> = { method: 'selectedProjectChanged' };
export const CloseWebViewNotification: NotificationType<void> = { method: 'close' };
export const ShowErrorMessage: NotificationType<string> = { method: 'showErrorMessage' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeError(err: any) {
   return {
      message: err.message,
      cause: err.cause ? err.cause.message : ""
   };
}
