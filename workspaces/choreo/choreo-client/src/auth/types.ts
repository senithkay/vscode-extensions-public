/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export interface AccessToken {
    accessToken : string;
    expirationTime? : number;
    loginTime : string;
    refreshToken? : string;
}

export interface IReadOnlyTokenStorage {
    getToken(orgId: number): Promise<AccessToken|undefined>;
}
export interface ITokenStorage extends IReadOnlyTokenStorage {
    setToken(orgId: number, token: AccessToken): Promise<void>;
    deleteToken(orgId: number): Promise<void>;
}

export interface AuthClientConfig {
    loginUrl: string;
    clientId: string;
    apimClientId: string;
    vscodeClientId: string;
    redirectUrl: string;
    tokenUrl: string;
    apimTokenUrl: string;
    signUpUrl: string;
    apimScopes: string;
}

export interface IAuthClient {
    exchangeAuthCode(authCode: string): Promise<AccessToken>;
    exchangeVSCodeToken(apiAccessToken: string, orgHandle: string): Promise<AccessToken>;
    exchangeRefreshToken(refreshToken: string): Promise<AccessToken>;
    getAuthURL(callbackUri: string): string;
    getSignUpURL(): string;
}
