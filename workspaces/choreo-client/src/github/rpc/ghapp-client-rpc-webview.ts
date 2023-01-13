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
import { GHAppAuthStatus, GithubOrgnization, IChoreoGithubAppClient } from "../types";
import { FireGHAppAuthCallbackRequest, GetAuthorizedRepositoriesRequest, TriggerAuthFlowRequest, TriggerInstallFlowRequest, OnGithubAppAuthCallbackNotification, ObtainAccessTokenRequest } from "./types";

export class ChoreoGithubAppClientRPCWebView implements IChoreoGithubAppClient {

    constructor(private _messenger: Messenger) {
    }
    triggerAuthFlow(): Promise<boolean> {
        return this._messenger.sendRequest(TriggerAuthFlowRequest, HOST_EXTENSION, undefined);
    }
    
    obatainAccessToken(authCode: string): Promise<void> {
        return this._messenger.sendRequest(ObtainAccessTokenRequest, HOST_EXTENSION, authCode);
    }
    triggerInstallFlow(): Promise<boolean> {
        return this._messenger.sendRequest(TriggerInstallFlowRequest, HOST_EXTENSION, undefined);
    }
    getAuthorizedRepositories(): Promise<GithubOrgnization[]> {
        return this._messenger.sendRequest(GetAuthorizedRepositoriesRequest, HOST_EXTENSION, undefined);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onGHAppAuthCallback(callback: (status: GHAppAuthStatus) => void): any {
        this._messenger.onNotification(OnGithubAppAuthCallbackNotification, callback);
        return {};
    }

    fireGHAppAuthCallback(status: GHAppAuthStatus): void {
        return this._messenger.sendNotification(FireGHAppAuthCallbackRequest, HOST_EXTENSION, status);
    }


}
