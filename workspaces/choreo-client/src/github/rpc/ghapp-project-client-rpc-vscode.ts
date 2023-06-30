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
import { Messenger } from "vscode-messenger";
import { BROADCAST } from "vscode-messenger-common";
import { IChoreoGithubAppClient } from "../types";
import { FireGHAppAuthCallbackRequest, GetAuthorizedRepositoriesRequest, TriggerAuthFlowRequest, TriggerInstallFlowRequest, OnGithubAppAuthCallbackNotification, ObtainAccessTokenRequest, GetRepoBranchesRequest, GetStatusRquest, CheckStatusRquest, GetCredentialsRequest, GetUserReposRequest } from "./types";

export function registerChoreoGithubRPCHandlers(messenger: Messenger, githubAppClient: IChoreoGithubAppClient ) {
   messenger.onRequest(CheckStatusRquest, () => githubAppClient.checkAuthStatus());
   messenger.onRequest(GetStatusRquest, () => githubAppClient.status);
   messenger.onNotification(FireGHAppAuthCallbackRequest, (params) => githubAppClient.fireGHAppAuthCallback(params));
   messenger.onRequest(GetAuthorizedRepositoriesRequest, () => githubAppClient.getAuthorizedRepositories());
   messenger.onRequest(GetRepoBranchesRequest, (params) => githubAppClient.getRepoBranches(params.orgName, params.repoName, params.bitbucketCredentialId));
   messenger.onRequest(ObtainAccessTokenRequest, (authCode) => githubAppClient.obatainAccessToken(authCode));
   messenger.onRequest(TriggerAuthFlowRequest, () => githubAppClient.triggerAuthFlow());
   messenger.onRequest(TriggerInstallFlowRequest, () => githubAppClient.triggerInstallFlow());
   messenger.onRequest(GetCredentialsRequest, (org_uuid) => githubAppClient.getCredentials(org_uuid));
   messenger.onRequest(GetUserReposRequest, (bitbucketCredentialId) => githubAppClient.getUserRepos(bitbucketCredentialId));
   githubAppClient.onGHAppAuthCallback((params) => messenger.sendNotification(OnGithubAppAuthCallbackNotification, BROADCAST ,params));
}
