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
import { Event } from "vscode";

export interface GHAppConfig {
    appUrl: string;
    installUrl: string;
    authUrl: string;
    clientId: string;
    redirectUrl: string;
}

export interface IChoreoGithubAppClient {
    triggerAuthFlow(): Promise<boolean>;
    obatainAccessToken(authCode: string): Promise<void>;
    triggerInstallFlow(): Promise<boolean>;
    getAuthorizedRepositories(): Promise<GithubOrgnization[]>;
    onGHAppAuthCallback: Event<GHAppAuthStatus>;
    fireGHAppAuthCallback(status: GHAppAuthStatus): void;
}

export type GHAppAuthStatus = {
    status: 'authorized' | 'installed' | 'error';
    authCode?: string;
    installationId?: string;
};

export interface GithubRepository {
    name: string;
}

export interface GithubOrgnization {
    name: string;
    repositories: GithubRepository[];
}