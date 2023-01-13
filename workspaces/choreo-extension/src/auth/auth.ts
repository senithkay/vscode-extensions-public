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
import * as vscode from 'vscode';
import { AccessToken, ChoreoAuthClient, ChoreoTokenType, KeyChainTokenStorage, ChoreoOrgClient, ChoreoProjectClient, IReadOnlyTokenStorage } from "@wso2-enterprise/choreo-client";
import { ChoreoAuthConfig } from "./config";
import { ext } from '../extensionVariables';

export const CHOREO_AUTH_ERROR_PREFIX = "Choreo Login: ";
const AUTH_CODE_ERROR = "Error while retreiving the authentication code details!";
const ACCESS_TOKEN_ERROR = "Error while retreiving the access token details!";
const APIM_TOKEN_ERROR = "Error while retreiving the apim token details!";
const REFRESH_TOKEN_ERROR = "Error while retreiving the refresh token details!";
const SESSION_EXPIRED = "The session has expired, please login again!";

export const choreoAuthConfig: ChoreoAuthConfig = new ChoreoAuthConfig();

export const tokenStore = new KeyChainTokenStorage();

export const readonlyTokenStore: IReadOnlyTokenStorage = {
    getToken: async (key: ChoreoTokenType) => {
        return await getChoreoToken(key);
    }
};

export const authClient = new ChoreoAuthClient({
    loginUrl: choreoAuthConfig.getLoginUrl(),
    redirectUrl: choreoAuthConfig.getRedirectUri(),
    apimTokenUrl: choreoAuthConfig.getApimTokenUri(),
    clientId: choreoAuthConfig.getClientId(),
    apimClientId: choreoAuthConfig.getApimClientId(),
    vscodeClientId: choreoAuthConfig.getVscodeClientId(),
    tokenUrl: choreoAuthConfig.getTokenUri(),
});

export const orgClient = new ChoreoOrgClient(readonlyTokenStore);

export const projectClient = new ChoreoProjectClient(readonlyTokenStore);

export async function initiateInbuiltAuth() {
    const callbackUri = await vscode.env.asExternalUri(
        vscode.Uri.parse(authClient.getAuthURL())
    );
    return vscode.env.openExternal(callbackUri);
}

export async function getChoreoToken(tokenType: ChoreoTokenType): Promise<AccessToken | undefined> {
    const currentChoreoToken = await tokenStore.getToken("choreo.token");
    if (currentChoreoToken?.accessToken && currentChoreoToken.expirationTime
        && currentChoreoToken.loginTime && currentChoreoToken.refreshToken) {

        let tokenDuration = (new Date().getTime() - new Date(currentChoreoToken.loginTime).getTime()) / 1000;
        if (tokenDuration > currentChoreoToken.expirationTime) {
            try {
                await exchangeRefreshToken(currentChoreoToken.refreshToken);
                const newChoreoToken = await tokenStore.getToken("choreo.token");
                if (newChoreoToken?.accessToken && ext.api.selectedOrg) {
                    await exchangeApimToken(newChoreoToken?.accessToken, ext.api.selectedOrg?.handle);
                }
            } catch (error: any) {
                vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + " Error while exchanging the refresh token! " + error.message);
            }
        }
    }
    return tokenStore.getToken(tokenType);
}

export async function exchangeAuthToken(authCode: string) {
    if (!authCode) {
        vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + AUTH_CODE_ERROR);
    } else {
        // To bypass the self signed server error.
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
        try {
            const response = await authClient.exchangeAuthCode(authCode);
            await tokenStore.setToken("choreo.token", response);
            await signIn();
            vscode.window.showInformationMessage(`Successfully signed into Choreo!`);
        } catch (error: any) {
            vscode.window.showErrorMessage(error.message);
        }
    }
}

export async function exchangeApimToken(token: string, orgHandle: string) {
    if (!token) {
        vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + ACCESS_TOKEN_ERROR);
        return;
    }
    try {
        const response = await authClient.exchangeApimToken(token, orgHandle);
        await tokenStore.setToken("choreo.apim.token", response);
        await exchangeVSCodeToken(response.accessToken);
    } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
    }
}

export async function exchangeVSCodeToken(apimToken: string) {
    if (!apimToken) {
        vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + APIM_TOKEN_ERROR);
        return;
    }
    try {
        const response = await authClient.exchangeVSCodeToken(apimToken);
        await tokenStore.setToken("choreo.vscode.token", response);
    } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
    }
}

export async function exchangeRefreshToken(refreshToken: string) {
    if (!refreshToken) {
        vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + REFRESH_TOKEN_ERROR);
        signOut();
        return;
    }
    try {
        const response = await authClient.exchangeRefreshToken(refreshToken);
        await tokenStore.setToken("choreo.token", response);
    } catch (error: any) {
        vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + SESSION_EXPIRED);
        signOut();
    }
}

export async function signIn() {
    ext.api.status = 'LoggingIn';
    const choreoTokenInfo = await tokenStore.getToken("choreo.token");
    if (choreoTokenInfo?.accessToken && choreoTokenInfo.expirationTime
        && choreoTokenInfo.loginTime && choreoTokenInfo.refreshToken) {
            try {
                const userInfo = await orgClient.getUserInfo();
                await exchangeApimToken(choreoTokenInfo?.accessToken, userInfo.organizations[0].handle);
                ext.api.userName = userInfo.displayName;
                ext.api.selectedOrg = userInfo.organizations[0];
                ext.api.status = "LoggedIn";
            } catch (error: any) {
                vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + error.message);
                signOut();
            }
    } 
}

export async function exchangeOrgAccessTokens(orgHandle: string) {
    const choreoTokenInfo = await getChoreoToken("choreo.token");
    if (choreoTokenInfo?.accessToken) {
        await exchangeApimToken(choreoTokenInfo?.accessToken, orgHandle);
    }
}

export async function signOut() {
    await tokenStore.deleteToken("choreo.token");
    await tokenStore.deleteToken("choreo.apim.token");
    await tokenStore.deleteToken("choreo.vscode.token");
    ext.api.status = "LoggedOut";
    ext.api.userName = undefined;
    ext.api.selectedOrg = undefined;
}
