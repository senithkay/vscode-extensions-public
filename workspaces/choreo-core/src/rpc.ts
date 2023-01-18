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
import { Organization, ChoreoLoginStatus, Project, ComponentWizardInput, Component } from './types';

// request types 
export const GetLoginStatusRequest: RequestType<string, ChoreoLoginStatus> = { method: 'getLoginStatus' };
export const GetCurrentOrgRequest: RequestType<string, Organization> = { method: 'getCurrentOrg' };
export const GetAllOrgsRequest: RequestType<string, Organization[]> = { method: 'getAllOrgs' };
export const GetAllProjectsRequest: RequestType<string, Project[]> = { method: 'getAllProjects' };
export const GetProject: RequestType<string, Project> = { method: 'getProject' };
export const CreateComponentRequest: RequestType<ComponentWizardInput, boolean> = { method: 'createComponent' };
export const GetComponents: RequestType<string, Component[]> = { method: 'getComponents' };
export const GetProjectLocation: RequestType<string, string | undefined> = { method: 'getProjectLocation' };
export const OpenExternal: RequestType<string, void> = { method: 'openExternal' };
export const OpenChoreoProject: RequestType<string, void> = { method: 'openChoreoProject' };
export const CloneChoreoProject: RequestType<string, void> = { method: 'cloneChoreoProject' };
export const setProjectRepository: RequestType<{ projId: string, repo: string }, void> = { method: 'setProjectRepository' };
export const getProjectRepository: RequestType<string, string> = { method: 'getProjectRepository' };
export const isChoreoProject: RequestType<void, boolean> = { method: 'isChoreoProject' };
export const getChoreoProject: RequestType<void, Project> = { method: 'getChoreoProject' };
export const PushLocalComponentsToChoreo: RequestType<string, void> = { method: 'pushLocalComponentsToChoreo' };
export const OpenArchitectureView: RequestType<string, void> = { method: 'openArchitectureView' };


// notification types
export const LoginStatusChangedNotification: NotificationType<string> = { method: 'loginStatusChanged' };
export const SelectedOrgChangedNotification: NotificationType<Organization> = { method: 'selectedOrgChanged' };
export const SelectedProjectChangedNotification: NotificationType<string> = { method: 'selectedProjectChanged' };
export const ExecuteCommandNotification: NotificationType<string[]> = { method: 'executeCommand' };
export const CloseWebViewNotification: NotificationType<void> = { method: 'close' };
export const ShowErrorMessage: NotificationType<string> = { method: 'showErrorMessage' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeError(err: any) {
   return {
      message: err.message,
      cause: err.cause ? err.cause.message : ""
   };
}
