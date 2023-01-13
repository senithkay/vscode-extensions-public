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
import { GraphQLClient, gql } from 'graphql-request';
import { IReadOnlyTokenStorage } from "../auth";
import { GHAppAuthStatus, GHAppConfig, GithubOrgnization, IChoreoGithubAppClient } from "./types";
import { EventEmitter, env, Uri } from 'vscode';

export class ChoreoGithubAppClient implements IChoreoGithubAppClient {

    private _onGHAppAuthCallback = new EventEmitter<GHAppAuthStatus>();
    public readonly onGHAppAuthCallback = this._onGHAppAuthCallback.event;

    constructor(private _tokenStore: IReadOnlyTokenStorage, private _projectsApiUrl: string, private _appConfig: GHAppConfig) {
    }
    
    private async _getClient() {
        const token = await this._tokenStore.getToken("choreo.apim.token");
        if (!token) {
            throw new Error('User is not logged in');
        }
        const client = new GraphQLClient(this._projectsApiUrl, {
            headers: {
                Authorization: 'Bearer ' + token.accessToken,
            },
        });
        return client;
    }

    async triggerAuthFlow(): Promise<boolean> {
        this._onGHAppAuthCallback.fire({ status: 'auth-inprogress'});
        const { authUrl, clientId, redirectUrl }  = this._appConfig;
        const callbackUri = await env.asExternalUri(
            Uri.parse(`${authUrl}?redirect_uri=${redirectUrl}&client_id=${clientId}&state=VSCODE_CHOREO_GH_APP_AUTH`)
        );
        return env.openExternal(callbackUri);
    }

    async obatainAccessToken(authCode: string): Promise<void> {
        const mutation = gql`
            mutation {
                obtainUserToken(authorizationCode:"${authCode}") {
                    success
                    message
                }
            }
        `;
        try {
            const client = await this._getClient();
            const data = await client.request(mutation);
            if(!data.obtainUserToken?.success) {
                this._onGHAppAuthCallback.fire({ status: 'error', error: data.obtainUserToken?.message});
                throw new Error(data.obtainUserToken?.message);
            } else {
                this._onGHAppAuthCallback.fire({ status: 'authorized'});
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            this._onGHAppAuthCallback.fire({ status: 'error', error: error?.message});
            throw new Error("Error while obtaining access token. " , { cause: error });
        }
        
    }

    async triggerInstallFlow(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async getAuthorizedRepositories(): Promise<GithubOrgnization[]> {
        const query = gql`
            query {
                userRepos {
                    orgName
                    repositories {
                        name
                    }
                }
            }
        `;
        try {
            const client = await this._getClient();
            const data = await client.request(query);
            return data.userRepos;
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this._onGHAppAuthCallback.fire({ status: 'error', error: (error as any).message});
            throw new Error("Error while fetching authorized repositories. " , { cause: error });
        }
    }
    
    fireGHAppAuthCallback(status: GHAppAuthStatus): void {
        this._onGHAppAuthCallback.fire(status);
    }
}