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
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";
import { CredentialData, GHAppAuthStatus, GithubOrgnization, IChoreoGithubAppClient, UserRepo } from "../types";
import { FireGHAppAuthCallbackRequest, GetAuthorizedRepositoriesRequest, TriggerAuthFlowRequest, TriggerInstallFlowRequest, OnGithubAppAuthCallbackNotification, ObtainAccessTokenRequest, GetRepoBranchesRequest, GetStatusRquest, CheckStatusRquest, GetCredentialsRequest, GetUserReposRequest } from "./types";

export class ChoreoGithubAppClientRPCWebView implements IChoreoGithubAppClient {

    constructor(private _messenger: Messenger) {
    }

    checkAuthStatus(): Promise<void> {
        return this._messenger.sendRequest(CheckStatusRquest, HOST_EXTENSION, undefined);
    }

    get status(): Promise<GHAppAuthStatus> {
        return this._messenger.sendRequest(GetStatusRquest, HOST_EXTENSION, undefined);
    }

    triggerAuthFlow(): Promise<boolean> {
        return this._messenger.sendRequest(TriggerAuthFlowRequest, HOST_EXTENSION, undefined);
    }
    
    obatainAccessToken(authCode: string, choreoOrgId: number): Promise<void> {
        return this._messenger.sendRequest(ObtainAccessTokenRequest, HOST_EXTENSION, { authCode, choreoOrgId });
    }
    triggerInstallFlow(): Promise<boolean> {
        return this._messenger.sendRequest(TriggerInstallFlowRequest, HOST_EXTENSION, undefined);
    }
    getAuthorizedRepositories(choreoOrgId: number): Promise<GithubOrgnization[]> {
        return this._messenger.sendRequest(GetAuthorizedRepositoriesRequest, HOST_EXTENSION, { choreoOrgId});
    }

    getUserRepos(bitbucketCredentialId: string, choreoOrgId: number): Promise<UserRepo[]> {
        return this._messenger.sendRequest(GetUserReposRequest, HOST_EXTENSION, { 
            bitbucketCredentialId,
            choreoOrgId
        });
    }

    getRepoBranches(choreoOrgId: number, orgName: string, repoName: string, bitbucketCredentialId: string): Promise<string[]> {
        return this._messenger.sendRequest(GetRepoBranchesRequest, HOST_EXTENSION, {choreoOrgId, orgName, repoName, bitbucketCredentialId});
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onGHAppAuthCallback(callback: (status: GHAppAuthStatus) => void): any {
        this._messenger.onNotification(OnGithubAppAuthCallbackNotification, callback);
        return {};
    }

    fireGHAppAuthCallback(status: GHAppAuthStatus): void {
        return this._messenger.sendNotification(FireGHAppAuthCallbackRequest, HOST_EXTENSION, status);
    }

    getCredentials(org_uuid: string, orgId: number): Promise<CredentialData[]> {
        return this._messenger.sendRequest(GetCredentialsRequest, HOST_EXTENSION, { org_uuid, orgId });
    }
}
