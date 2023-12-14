/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { RequestType, NotificationType } from 'vscode-messenger-common';
import { CredentialData, GHAppAuthStatus, GithubOrgnization, UserRepo  } from '../types';

export interface GetUserReposRequestParams {
    bitbucketCredentialId: string;
    choreoOrgId: number;
}

export interface GetCredentialsRequestParams {
    org_uuid: string;
    orgId: number;
}

export interface GetRepoBranchesRequestParams {
    choreoOrgId: number;
    orgName: string;
    repoName: string;
    bitbucketCredentialId: string;
}

export interface ObtainAccessTokenRequestParams {
    authCode: string;
    choreoOrgId: number;
}

export interface GetAuthorizedRepositoriesRequestParams {
    choreoOrgId: number;
}

export const CheckStatusRquest: RequestType<void, void> = { method: 'ghapp/checkStatus' };
export const GetStatusRquest: RequestType<void, GHAppAuthStatus> = { method: 'ghapp/getStatus' };
export const TriggerAuthFlowRequest: RequestType<void, boolean> = { method: 'ghapp/triggerAuthFlow' };
export const ObtainAccessTokenRequest: RequestType<ObtainAccessTokenRequestParams, void> = { method: 'ghapp/obatainAccessToken' };
export const TriggerInstallFlowRequest: RequestType<void, boolean> = { method: 'ghapp/triggerInstallFlow' };
export const GetAuthorizedRepositoriesRequest: RequestType<GetAuthorizedRepositoriesRequestParams, GithubOrgnization[]> = { method: 'ghapp/getAuthorizedRepositories' };
export const FireGHAppAuthCallbackRequest: NotificationType<GHAppAuthStatus> = { method: 'ghapp/fireGHAppAuthCallback' };
export const GetRepoBranchesRequest: RequestType<GetRepoBranchesRequestParams, string[]> = { method: 'ghapp/getRepoBranches' };
export const GetCredentialsRequest: RequestType<GetCredentialsRequestParams, CredentialData[]> = { method: 'ghapp/getCredentials' };
export const GetUserReposRequest: RequestType<GetUserReposRequestParams, UserRepo[]> = { method: 'ghapp/getUserRepos' };
export const OnGithubAppAuthCallbackNotification: NotificationType<GHAppAuthStatus> = { method: 'ghapp/onGHAppAuthCallback' };
