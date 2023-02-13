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
import { GHAppAuthStatus, GithubOrgnization  } from '../types';

export const GetStatusRquest: RequestType<void, GHAppAuthStatus> = { method: 'ghapp/getStatus' };
export const TriggerAuthFlowRequest: RequestType<void, boolean> = { method: 'ghapp/triggerAuthFlow' };
export const ObtainAccessTokenRequest: RequestType<string, void> = { method: 'ghapp/obatainAccessToken' };
export const TriggerInstallFlowRequest: RequestType<void, boolean> = { method: 'ghapp/triggerInstallFlow' };
export const GetAuthorizedRepositoriesRequest: RequestType<void, GithubOrgnization[]> = { method: 'ghapp/getAuthorizedRepositories' };
export const FireGHAppAuthCallbackRequest: NotificationType<GHAppAuthStatus> = { method: 'ghapp/fireGHAppAuthCallback' };
export const GetRepoBranchesRequest: RequestType<{orgName: string, repoName: string}, string[]> = { method: 'ghapp/getRepoBranches' };

export const OnGithubAppAuthCallbackNotification: NotificationType<GHAppAuthStatus> = { method: 'ghapp/onGHAppAuthCallback' };
