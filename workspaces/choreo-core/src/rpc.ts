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
import { Organization, ChoreoLoginStatus, Project } from './types';

// request types 
export const GetLoginStatusRequest: RequestType<string, ChoreoLoginStatus> = { method: 'getLoginStatus' };
export const GetCurrentOrgRequest: RequestType<string, Organization> = { method: 'getCurrentOrg' };
export const GetAllOrgsRequest: RequestType<string, Organization[]> = { method: 'getAllOrgs' };
export const GetAllProjectsRequest: RequestType<string, Project[]> = { method: 'getAllProjects' };

// notification types
export const LoginStatusChangedNotification: NotificationType<string> = { method: 'loginStatusChanged' };
export const SelectedOrgChangedNotification: NotificationType<Organization> = { method: 'selectedOrgChanged' };
export const ExecuteCommandNotification: NotificationType<string[]> = { method: 'executeCommand' };
