import { Component, Organization, Project, Repository, UserInfo } from "@wso2-enterprise/choreo-core";

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
export interface AccessToken {
    accessToken : string;
    expirationTime? : number;
    loginTime : string;
    refreshToken? : string;
}

export type ChoreoToken = "choreo.token";
export type ChoreoApimToken = "choreo.apim.token";
export type ChoreoVscodeToken = "choreo.vscode.token";

export type ChoreoTokenType = ChoreoToken | ChoreoApimToken | ChoreoVscodeToken;

export interface ITokenStorage {
    getToken(tokenType: ChoreoTokenType): Promise<AccessToken|undefined>;
    setToken(tokenType: ChoreoTokenType, token: AccessToken): Promise<void>;
    deleteToken(tokenType: ChoreoTokenType): Promise<void>;
}

export interface AuthClientConfig {
    loginUrl: string;
    clientId: string;
    apimClientId: string;
    vscodeClientId: string;
    redirectUrl: string;
    tokenUrl: string;
    apimTokenUrl: string;
}

export interface IAuthClient {
    exchangeAuthCode(authCode: string): Promise<AccessToken>;
    exchangeApimToken(choreoAccessToken: string, orgHandle: string): Promise<AccessToken>;
    exchangeVSCodeToken(apiAccessToken: string): Promise<AccessToken>;
    exchangeRefreshToken(refreshToken: string): Promise<AccessToken>;
    getAuthURL(): string;
}

export interface ProjectMutationParams {
    orgId: string;
    name: string;
    description: string;
}

export interface ComponentMutationParams {
    projectId: string;
    name: string;
    description: string;
}

export interface LinkRepoMutationParams {
    componentId: string;
    repoOwner: string;
    repoName: string;
    repoPath: string;
}

export interface IChoreoProjectClient  {
    // queries
    getProjects(orgId: string): Promise<Project[]>;
    getComponents(orgHandle: string, projId: string): Promise<Component[]>;

    // mutations
    createProject(params: ProjectMutationParams): Promise<Project[]>;
    createComponent(params: ComponentMutationParams): Promise<Component>;
    linkRepo(params: LinkRepoMutationParams): Promise<Repository>;
}


export interface IChoreoOrgClient  {
    getOrganizations(): Promise<Organization[]>;
    getUserInfo(): Promise<UserInfo>;
}
