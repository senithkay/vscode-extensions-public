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

export type AsgardioToken = "asgardio.token";

// org scoped token type which starts with text "choreo.apim.token" and ends with org id (e.g. choreo.apim.token.org.1234)
export type ChoreoAPIMToken = `choreo.apim.token.org.${string}`;

export type ChoreoTokenType = AsgardioToken | ChoreoAPIMToken;

export interface IReadOnlyTokenStorage {
    getToken(tokenType: ChoreoTokenType): Promise<AccessToken|undefined>;
    getTokenForOrg(orgId: number): Promise<AccessToken|undefined>;
}
export interface ITokenStorage extends IReadOnlyTokenStorage {
    setToken(tokenType: ChoreoTokenType, token: AccessToken): Promise<void>;
    setTokenForOrg(orgId: number, token: AccessToken): Promise<void>;
    deleteToken(tokenType: ChoreoTokenType): Promise<void>;
    deleteTokenForOrg(orgId: number): Promise<void>;
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
