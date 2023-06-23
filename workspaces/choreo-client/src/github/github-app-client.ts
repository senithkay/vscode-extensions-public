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
import { EventEmitter, env, Uri, window } from 'vscode';

const extensionId = 'wso2.choreo';

export class ChoreoGithubAppClient implements IChoreoGithubAppClient {

    private _status: GHAppAuthStatus = { status: 'not-authorized' };
    private _onGHAppAuthCallback = new EventEmitter<GHAppAuthStatus>();
    public readonly onGHAppAuthCallback = this._onGHAppAuthCallback.event;

    constructor(private _tokenStore: IReadOnlyTokenStorage, private _projectsApiUrl: string, private _appConfig: GHAppConfig) {
        this.onGHAppAuthCallback((status) => {
            this._status = status;
        });
        this.checkAuthStatus();
    }

    async checkAuthStatus(): Promise<void> {
        try {
            // Check if the token is valid by trying to get the authorized repositories
            await this.getAuthorizedRepositories();
            this._onGHAppAuthCallback.fire({ status: 'authorized' });
        } catch (error) {
            this._onGHAppAuthCallback.fire({ status: 'not-authorized' });
        }
    }

    private async _getClient() {
        const token = await this._tokenStore.getToken("choreo.vscode.token");
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

    get status(): Promise<GHAppAuthStatus> {
        return Promise.resolve(this._status);
    }

    private async _getAuthState(): Promise<string> {
        const callbackUri = await env.asExternalUri(
            Uri.parse(`${env.uriScheme}://${extensionId}/ghapp`)
        );
        const state = {
            origin: "vscode.choreo.ext",
            callbackUri: callbackUri.toString()
        };
        return Buffer.from(JSON.stringify(state), 'binary').toString('base64');
    }

    async triggerAuthFlow(): Promise<boolean> {
        this._onGHAppAuthCallback.fire({ status: 'auth-inprogress' });
        const { authUrl, clientId, redirectUrl } = this._appConfig;
        const state = await this._getAuthState()
        const ghURL = Uri.parse(`${authUrl}?redirect_uri=${redirectUrl}&client_id=${clientId}&state=${state}`);
        return env.openExternal(ghURL);
    }

    async triggerInstallFlow(): Promise<boolean> {
        const { installUrl } = this._appConfig;
        const state = await this._getAuthState()
        const ghURL = Uri.parse(`${installUrl}?state=${state}`);
        const success = await env.openExternal(ghURL);
        window.showInformationMessage(`Please check your browser for Choreo Github App installation page.`, "Copy URL").then((selection) => {
            if (selection === "Copy URL") {
                env.clipboard.writeText(ghURL.toString());
            }
        });
        return success;
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
            this._onGHAppAuthCallback.fire({ status: 'error', error: error?.message });
            throw new Error("Error while obtaining access token. ", { cause: error });
        }
    }

    async getCredentials(org_uuid: string) {
        
        const query = gql`
            query {
                commonCredentials(orgUuid: "${org_uuid}") {
                    id,
                    name,
                    createdAt,
                    organizationUuid,
                    type,
                    referenceToken
                }
            }
        `;

        try {
            const client = await this._getClient();
            const data = await client.request(query);
            return data.commonCredentials;
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this._onGHAppAuthCallback.fire({ status: 'error', error: (error as any).message });
            throw new Error("Error while fetching credentials. ", { cause: JSON.stringify(error) });
        }
    }

    async getCredentialById(org_uuid: string, credentialId: string) {
        const query = gql`
            query {
                commonCredential(orgUuid: "${org_uuid}", credentialId: "${credentialId}") {
                    id,
                    name,
                    type,
                    createdAt,
                    organizationUuid,
                    referenceToken,
                }
            }
        `;

        try {
            const client = await this._getClient();
            const data = await client.request(query);
            return data;
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this._onGHAppAuthCallback.fire({ status: 'error', error: (error as any).message });
            throw new Error("Error while fetching credentials. ", { cause: error });
        }
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
            this._onGHAppAuthCallback.fire({ status: 'error', error: (error as any).message });
            throw new Error("Error while fetching authorized repositories. ", { cause: error });
        }
    }

    async getUserBitBucketRepos(bitbucketCredentialId: string) {
        const query = gql`
            query {
                userRepos(secretRef :"${bitbucketCredentialId}") {
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
            this._onGHAppAuthCallback.fire({ status: 'error', error: (error as any).message });
            throw new Error("Error while fetching authorized repositories. ", { cause: error });
        }
    }

    async getRepoBranches(orgName: string, repoName: string, bitbucketCredentialId: string): Promise<string[]> {
        const query = gql`
            query {
                repoBranchList(secretRef: "${bitbucketCredentialId}", repositoryOrganization: "${orgName}", repositoryName: "${repoName}") {
                    name
                }
            }
        `;
        try {
            const client = await this._getClient();
            const data = await client.request(query);
            return data.repoBranchList.map((branch: { name: string }) => branch.name);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            throw new Error("Error while fetching branches for repository. ", { cause: error });
        }
    }

    async getBitBucketRepoBranches(
        repositoryOrganization: string,
        repositoryName: string,
        bitbucketCredentialId: string
    ): Promise<string[]> {
        const query = gql`
            query {
                repoBranchList(
                    secretRef: "${bitbucketCredentialId}"
                    repositoryOrganization: "${repositoryOrganization}", 
                    repositoryName: "${repositoryName}",
                    ) {
                      name
                      isDefault
                  }
            }
        `;
        try {
            const client = await this._getClient();
            const data = await client.request(query);
            return data.repoBranchList.map((branch: { name: string }) => branch.name);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            throw new Error("Error while fetching branches for repository. ", { cause: error });
        }
    }

    fireGHAppAuthCallback(status: GHAppAuthStatus): void {
        this._onGHAppAuthCallback.fire(status);
    }
}
