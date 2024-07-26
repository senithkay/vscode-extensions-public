/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Messenger } from "vscode-messenger";
import { BROADCAST } from "vscode-messenger-common";
import { IChoreoGithubAppClient } from "../types";
import { FireGHAppAuthCallbackRequest, GetAuthorizedRepositoriesRequest, TriggerAuthFlowRequest, TriggerInstallFlowRequest, OnGithubAppAuthCallbackNotification, ObtainAccessTokenRequest, GetRepoBranchesRequest, GetStatusRquest, CheckStatusRquest, GetCredentialsRequest, GetUserReposRequest } from "./types";

export function registerChoreoGithubRPCHandlers(messenger: Messenger, githubAppClient: IChoreoGithubAppClient ) {
   messenger.onRequest(CheckStatusRquest, () => githubAppClient.checkAuthStatus());
   messenger.onRequest(GetStatusRquest, () => githubAppClient.status);
   messenger.onNotification(FireGHAppAuthCallbackRequest, (params) => githubAppClient.fireGHAppAuthCallback(params));
   messenger.onRequest(GetAuthorizedRepositoriesRequest, (params) => githubAppClient.getAuthorizedRepositories(params.choreoOrgId));
   messenger.onRequest(GetRepoBranchesRequest, (params) => githubAppClient.getRepoBranches(params.choreoOrgId, params.orgName, params.repoName, params.bitbucketCredentialId));
   messenger.onRequest(ObtainAccessTokenRequest, (params) => githubAppClient.obatainAccessToken(params.authCode, params.choreoOrgId));
   messenger.onRequest(TriggerAuthFlowRequest, () => githubAppClient.triggerAuthFlow());
   messenger.onRequest(TriggerInstallFlowRequest, () => githubAppClient.triggerInstallFlow());
   messenger.onRequest(GetCredentialsRequest, (params) => githubAppClient.getCredentials(params.org_uuid, params.orgId));
   messenger.onRequest(GetUserReposRequest, (params) => githubAppClient.getUserRepos(params.bitbucketCredentialId, params.choreoOrgId));
   githubAppClient.onGHAppAuthCallback((params) => messenger.sendNotification(OnGithubAppAuthCallbackNotification, BROADCAST ,params));
}
