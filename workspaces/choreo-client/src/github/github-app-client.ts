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
import { GraphQLClient } from 'graphql-request';
import { IReadOnlyTokenStorage } from "../auth";
import { GHAppAuthStatus, GithubOrgnization, IChoreoGithubAppClient } from "./types";
import { PROJECTS_API_URL } from "./../project/project-client";
import { EventEmitter, env, Uri } from 'vscode';

export class ChoreoGithubAppClient implements IChoreoGithubAppClient {

    private _onGHAppAuthCallback = new EventEmitter<GHAppAuthStatus>();
    public readonly onGHAppAuthCallback = this._onGHAppAuthCallback.event;

    constructor(private _tokenStore: IReadOnlyTokenStorage, private _baseURL: string = PROJECTS_API_URL) {
    }

    private async _getClient() {
        const token = await this._tokenStore.getToken("choreo.apim.token");
        if (!token) {
            throw new Error('User is not logged in');
        }
        const client = new GraphQLClient(this._baseURL, {
            headers: {
                Authorization: 'Bearer ' + token.accessToken,
            },
        });
        return client;
    }

    async triggerAuthFlow(): Promise<boolean> {
        const callbackUri = await env.asExternalUri(
            Uri.parse("https://github.com/login/oauth/authorize?redirect_uri=https://localhost:3000/ghapp&client_id=Iv1.f6cf2cd585148ee7&state=VSCODE_CHOREO_GH_APP_AUTH")
        );
        return env.openExternal(callbackUri);
    }

    async triggerInstallFlow(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    getAuthorizedRepositories(): Promise<GithubOrgnization[]> {
        this._getClient();
        throw new Error("Method not implemented.");
    }
    
    fireGHAppAuthCallback(status: GHAppAuthStatus): void {
        this._onGHAppAuthCallback.fire(status);
    }
}