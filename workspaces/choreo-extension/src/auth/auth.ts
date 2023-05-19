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
import { AccessToken, ChoreoAuthClient, ChoreoTokenType, KeyChainTokenStorage, ChoreoOrgClient, ChoreoProjectClient, IReadOnlyTokenStorage, ChoreoSubscriptionClient } from "@wso2-enterprise/choreo-client";
import { ChoreoGithubAppClient } from "@wso2-enterprise/choreo-client/lib/github";

import { CHOREO_AUTH_CONFIG_DEV, CHOREO_AUTH_CONFIG_STAGE, ChoreoAuthConfig, ChoreoAuthConfigParams, DEFAULT_CHOREO_AUTH_CONFIG } from "./config";
import { ext } from '../extensionVariables';
import { getLogger } from '../logger/logger';
import { ChoreoAIConfig } from '../services/ai';
import { Organization, SIGN_IN_FROM_EXISITING_SESSION_FAILURE_EVENT } from '@wso2-enterprise/choreo-core';
import { SELECTED_ORG_ID_KEY, STATUS_LOGGED_IN, STATUS_LOGGED_OUT, STATUS_LOGGING_IN } from '../constants';
import { showChoreoProjectOverview } from '../extension';
import { lock } from './lock';
import { sendTelemetryEvent } from '../telemetry/utils';
import { workspace } from 'vscode';

export const CHOREO_AUTH_ERROR_PREFIX = "Choreo Login: ";
const AUTH_CODE_ERROR = "Error while retreiving the authentication code details!";
const APIM_TOKEN_ERROR = "Error while retreiving the apim token details!";
const REFRESH_TOKEN_ERROR = "Error while retreiving the refresh token details!";
const SESSION_EXPIRED = "The session has expired, please login again!";

export const choreoAIConfig = new ChoreoAIConfig();

export const tokenStore = new KeyChainTokenStorage();

const ChoreoEnvironment = workspace.getConfiguration().get("Advanced.ChoreoEnviornment");
let authConfig: ChoreoAuthConfigParams;

switch (ChoreoEnvironment) {
    case 'prod':
        authConfig = DEFAULT_CHOREO_AUTH_CONFIG;
        break;
    case 'stage':
        authConfig = CHOREO_AUTH_CONFIG_STAGE;
        break;
    case 'dev':
        authConfig = CHOREO_AUTH_CONFIG_DEV;
        break;
    default:
        authConfig = DEFAULT_CHOREO_AUTH_CONFIG;
}

export const choreoAuthConfig: ChoreoAuthConfig = new ChoreoAuthConfig(authConfig);

export const readonlyTokenStore: IReadOnlyTokenStorage = {
    getToken: async (key: ChoreoTokenType) => {
        getLogger().debug("Getting token from keychain: " + key);
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

export const orgClient = new ChoreoOrgClient(readonlyTokenStore, choreoAuthConfig.getAPIBaseURL());

export const projectClient = new ChoreoProjectClient(readonlyTokenStore, choreoAuthConfig.getProjectAPI(),
    choreoAIConfig.getPerfAPI(), choreoAIConfig.getSwaggerExamplesAPI());

export const githubAppClient = new ChoreoGithubAppClient(readonlyTokenStore, choreoAuthConfig.getProjectAPI(), choreoAuthConfig.getGHAppConfig());

export const subscriptionClient = new ChoreoSubscriptionClient(readonlyTokenStore, `${choreoAuthConfig.getBillingUrl()}/api`);

export async function initiateInbuiltAuth() {
    const callbackUri = await vscode.env.asExternalUri(
        vscode.Uri.parse(`${vscode.env.uriScheme}://wso2.choreo/signin`)
    );
    const oauthURL = authClient.getAuthURL(callbackUri);
    getLogger().debug("OAuth URL: " + oauthURL);
    return vscode.env.openExternal(vscode.Uri.parse(oauthURL));
}

export async function getChoreoToken(tokenType: ChoreoTokenType): Promise<AccessToken | undefined> {
    await lock.acquire();
    const currentChoreoToken = await tokenStore.getToken("choreo.token");
    if (currentChoreoToken?.accessToken && currentChoreoToken.expirationTime
        && currentChoreoToken.loginTime && currentChoreoToken.refreshToken) {
        getLogger().debug("Found Choreo token in keychain.");
        let tokenDuration = (new Date().getTime() - new Date(currentChoreoToken.loginTime).getTime()) / 1000;
        if (tokenDuration > currentChoreoToken.expirationTime) {
            getLogger().debug("Choreo token expired. Exchanging refresh token.");
            try {
                await exchangeRefreshToken(currentChoreoToken.refreshToken);
                const newChoreoToken = await tokenStore.getToken("choreo.token");
                if (newChoreoToken?.accessToken) {
                    if (ext.api.selectedOrg) {
                        getLogger().debug("Exchanged refresh token.");
                        await exchangeVSCodeToken(newChoreoToken?.accessToken, ext.api.selectedOrg?.handle);
                    } else {
                        getLogger().error("Exchanged refresh token. No selected org found.");
                    }
                } else {
                    throw new Error("New token was not found in token store!");
                }
            } catch (error: any) {
                getLogger().error("Error while exchanging the refresh token! " + error?.message + (error?.cause ? "\nCause: " + error.cause.message : ""));
                vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + " Error while exchanging the refresh token! " + error.message);
                signOut();
            }
        }
    } else {
        getLogger().warn("Choreo token not found in keychain.");
    }
    lock.release();
    return tokenStore.getToken(tokenType);
}

export async function exchangeAuthToken(authCode: string) {
    getLogger().debug("Exchanging auth code to token.");
    if (!authCode) {
        vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + AUTH_CODE_ERROR);
    } else {
        // To bypass the self signed server error.
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
        try {
            var currentTime = Date.now();
            const response = await authClient.exchangeAuthCode(authCode);
            getLogger().info("auth token exchange time: " + (Date.now() - currentTime));

            await tokenStore.setToken("choreo.token", response);
            getLogger().debug("Successfully exchanged auth code to token.");
            await signIn();
            getLogger().info("Total sign in time: " + (Date.now() - currentTime));
            vscode.window.showInformationMessage(`Successfully signed into Choreo!`);
        } catch (error: any) {
            getLogger().error("Error while exchanging the auth code! " + error?.message + (error?.cause ? "\nCause: " + error.cause.message : ""));
            vscode.window.showErrorMessage(error.message);
            signOut();
        }
    }
}

export async function exchangeVSCodeToken(apimToken: string, orgHandle: string) {
    getLogger().debug("Exchanging apim token to vscode token.");
    if (!apimToken) {
        vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + APIM_TOKEN_ERROR);
        return;
    }
    try {
        const response = await authClient.exchangeVSCodeToken(apimToken, orgHandle);
        getLogger().debug("Successfully exchanged apim token to vscode token.");
        await tokenStore.setToken("choreo.vscode.token", response);
    } catch (error: any) {
        getLogger().error("Error while exchanging the vscode token! " + error?.message + (error?.cause ? "\nCause: " + error.cause.message : ""));
        vscode.window.showErrorMessage(error.message);
    }
}

export async function exchangeRefreshToken(refreshToken: string) {
    getLogger().debug("Exchanging refresh token to access token.");
    if (!refreshToken) {
        vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + REFRESH_TOKEN_ERROR);
        signOut();
        return;
    }
    try {
        const response = await authClient.exchangeRefreshToken(refreshToken);
        getLogger().debug("Successfully exchanged refresh token to access token.");
        await tokenStore.setToken("choreo.token", response);
        await tokenStore.setToken("choreo.token", response);
    } catch (error: any) {
        getLogger().error("Error while exchanging the refresh token! " + error?.message + (error?.cause ? "\nCause: " + error.cause.message : ""));
        vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + SESSION_EXPIRED);
        signOut();
    }
}

export async function signIn(isExistingSession?: boolean) {
    getLogger().debug("Signing in to Choreo.");
    ext.api.status = STATUS_LOGGING_IN;
    const choreoTokenInfo = await tokenStore.getToken("choreo.token");
    if (choreoTokenInfo?.accessToken && choreoTokenInfo.expirationTime
        && choreoTokenInfo.loginTime && choreoTokenInfo.refreshToken) {
        try {
            var currentTime = Date.now();
            const userInfo = await orgClient.getUserInfo();
            getLogger().info("get user info request time: " + (Date.now() - currentTime));
            getLogger().debug("Successfully retrived user info.");
            ext.api.userInfo = userInfo;
            const selectedOrg = await getDefaultSelectedOrg(userInfo.organizations);
            await exchangeVSCodeToken(choreoTokenInfo?.accessToken, selectedOrg.handle);
            ext.api.selectedOrg = selectedOrg;
            ext.api.status = STATUS_LOGGED_IN;
            showChoreoProjectOverview();
        } catch (error: any) {
            if (isExistingSession) {
                sendTelemetryEvent(SIGN_IN_FROM_EXISITING_SESSION_FAILURE_EVENT, { cause: error?.message });
            }
            getLogger().error("Error while signing in! " + error?.message + (error?.cause ? "\nCause: " + error.cause.message : "")); 
            getLogger().debug("Attempting to access sign in error payload!" + (error.cause?.response ? "\nPayload: " + JSON.stringify(error.cause?.response?.data) : ""));
            vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + error.message);
            signOut();
        }
    }
}

export async function getDefaultSelectedOrg(userOrgs: Organization[]) {
    if (userOrgs.length === 0) {
        throw new Error("No organizations found for the user.");
    }
    const currentSelectedOrgId = ext.context.globalState.get(SELECTED_ORG_ID_KEY);
    if (currentSelectedOrgId) {
        const foundOrg = userOrgs.find(org => org.id === currentSelectedOrgId);
        if (foundOrg) {
            return foundOrg;
        }
    }
    return userOrgs[0];
}

export async function exchangeOrgAccessTokens( orgHandle: string) {
    getLogger().debug("Exchanging apim token for the org " + orgHandle);
    const choreoTokenInfo = await getChoreoToken("choreo.token");
    if (choreoTokenInfo?.accessToken) {
        await exchangeVSCodeToken(choreoTokenInfo?.accessToken, orgHandle);
    } else {
        throw new Error("Choreo token not found in token store!");
    }
}

export async function signOut() {
    getLogger().debug("Clear current Choreo session.");
    await tokenStore.deleteToken("choreo.token");
    await tokenStore.deleteToken("choreo.vscode.token");
    ext.api.status = STATUS_LOGGED_OUT;
    ext.api.userInfo = undefined;
    ext.api.selectedOrg = undefined;
}
