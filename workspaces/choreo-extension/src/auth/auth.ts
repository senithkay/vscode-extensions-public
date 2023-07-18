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
import { AccessToken, ChoreoAuthClient, ChoreoTokenType, ChoreoOrgClient, ChoreoProjectClient, IReadOnlyTokenStorage, ChoreoSubscriptionClient, ComponentManagementClient, ChoreoUserManagementClient } from "@wso2-enterprise/choreo-client";
import { ChoreoGithubAppClient } from "@wso2-enterprise/choreo-client/lib/github";

import { CHOREO_ENV_CONFIG_DEV, CHOREO_ENV_CONFIG_STAGE, ChoreoEnvConfig, IChoreoEnvConfig, DEFAULT_CHOREO_ENV_CONFIG } from "./config";
import { ext } from '../extensionVariables';
import { getLogger } from '../logger/logger';
import { ChoreoAIConfig } from '../services/ai';
import { Organization, SIGN_IN_FROM_EXISITING_SESSION_FAILURE_EVENT } from '@wso2-enterprise/choreo-core';
import { STATUS_LOGGED_IN, STATUS_LOGGED_OUT } from '../constants';
import { lock } from './lock';
import { sendTelemetryEvent } from '../telemetry/utils';
import { workspace } from 'vscode';
import { get } from 'lodash';

export const CHOREO_AUTH_ERROR_PREFIX = "Choreo Login: ";
const AUTH_CODE_ERROR = "Error while retreiving the authentication code details!";
const APIM_TOKEN_ERROR = "Error while retreiving the apim token details!";
const REFRESH_TOKEN_ERROR = "Error while retreiving the refresh token details!";
const SESSION_EXPIRED = "The session has expired, please login again!";

export const choreoAIConfig = new ChoreoAIConfig();

// eslint-disable-next-line @typescript-eslint/naming-convention
const choreoEnv = workspace.getConfiguration().get("Advanced.ChoreoEnvironment");

let pickedEnvConfig: IChoreoEnvConfig;

switch (choreoEnv) {
    case 'prod':
        pickedEnvConfig = DEFAULT_CHOREO_ENV_CONFIG;
        break;
    case 'stage':
        pickedEnvConfig = CHOREO_ENV_CONFIG_STAGE;
        break;
    case 'dev':
        pickedEnvConfig = CHOREO_ENV_CONFIG_DEV;
        break;
    default:
        pickedEnvConfig = DEFAULT_CHOREO_ENV_CONFIG;
}

export const choreoEnvConfig: ChoreoEnvConfig = new ChoreoEnvConfig(pickedEnvConfig);

export async function activateClients(): Promise<void> {

    const readonlyTokenStore: IReadOnlyTokenStorage = {
        getToken: async (key: ChoreoTokenType) => {
            getLogger().debug("Getting token from keychain: " + key);
            return await getTokenWithAutoRefresh(key);
        },
        getTokenForOrg : async (orgId: number) => {
            if (orgId) {
                return await getTokenWithAutoRefresh(`choreo.apim.token.org.${orgId}`);
            }
            throw new Error("Organization ID is not provided.");
        }
    };

    const authClient = new ChoreoAuthClient({
        loginUrl: choreoEnvConfig.getLoginUrl(),
        redirectUrl: choreoEnvConfig.getRedirectUri(),
        signUpUrl: choreoEnvConfig.getSignUpUri(),
        apimTokenUrl: choreoEnvConfig.getApimTokenUri(),
        clientId: choreoEnvConfig.getClientId(),
        apimClientId: choreoEnvConfig.getApimClientId(),
        vscodeClientId: choreoEnvConfig.getVscodeClientId(),
        tokenUrl: choreoEnvConfig.getTokenUri(),
        apimScopes: choreoEnvConfig.getApimEnvScopes()
    });

    const orgClient = new ChoreoOrgClient(readonlyTokenStore, choreoEnvConfig.getOrgsAPI());

    const userManagementClient = new ChoreoUserManagementClient(readonlyTokenStore, choreoEnvConfig.getUserManagementUrl());

    const projectClient = new ChoreoProjectClient(readonlyTokenStore, choreoEnvConfig.getProjectAPI(),
        choreoAIConfig.getPerfAPI(), choreoAIConfig.getSwaggerExamplesAPI());

    const githubAppClient = new ChoreoGithubAppClient(
        readonlyTokenStore, choreoEnvConfig.getProjectAPI(), choreoEnvConfig.getGHAppConfig());

    const subscriptionClient = new ChoreoSubscriptionClient(readonlyTokenStore, `${choreoEnvConfig.getBillingUrl()}/api`);

    const componentManagementClient = new ComponentManagementClient(readonlyTokenStore, choreoEnvConfig.getComponentManagementUrl());

    ext.clients = {
        authClient,
        orgClient,
        githubAppClient,
        userManagementClient,
        projectClient,
        subscriptionClient,
        componentManagementClient
    };
}

export async function initiateInbuiltAuth() {
    const callbackUri = await vscode.env.asExternalUri(
        vscode.Uri.parse(`${vscode.env.uriScheme}://wso2.choreo/signin`)
    );
    const oauthURL = ext.clients.authClient.getAuthURL(callbackUri.toString());
    getLogger().debug("OAuth URL: " + oauthURL);
    return vscode.env.openExternal(vscode.Uri.parse(oauthURL));
}

export async function getTokenWithAutoRefresh(tokenType: ChoreoTokenType): Promise<AccessToken | undefined> {
    let token: AccessToken | undefined;
    await lock.acquire();
    const currentAsgardioToken = await ext.tokenStorage.getToken("asgardio.token");
    if (currentAsgardioToken?.accessToken && currentAsgardioToken.expirationTime
        && currentAsgardioToken.loginTime && currentAsgardioToken.refreshToken) {
        getLogger().debug("Found Asgardio token in keychain. Checking if it is expired.");
        let tokenDuration = (new Date().getTime() - new Date(currentAsgardioToken.loginTime).getTime()) / 1000;
        if (tokenDuration > (currentAsgardioToken.expirationTime - (60 * 5) )) { // 5 minutes before expiry, we refresh the token
            getLogger().debug("Asgardio token expired. Exchanging with refresh token.");
            try {
                await exchangeRefreshToken(currentAsgardioToken.refreshToken);
                const newAsgardioToken = await ext.tokenStorage.getToken("asgardio.token");
                if (newAsgardioToken?.accessToken) {
                    getLogger().debug("New Asgardio token found in token store.");
                    
                    // get org id from tokenType, get the org from the id
                    if (tokenType.startsWith("choreo.apim.token.org.")) {
                        getLogger().debug("Exchanging APIM token for org: " + tokenType);
                        const orgId = tokenType.split("choreo.apim.token.org.")[1];
                        const org = ext.api.getOrgById(parseInt(orgId));
                        if (org) {
                            await exchangeChoreoAPIMToken(newAsgardioToken.accessToken, org.handle, org.id);
                            token = await ext.tokenStorage.getToken(tokenType);
                        } else {
                            throw new Error("Organization was not found in user orgs!");
                        }
                    }
                } else {
                    throw new Error("New Asgardio token was not found in token store!");
                }
            } catch (error: any) {
                getLogger().error("Error while exchanging the refresh token! " + error?.message + (error?.cause ? "\nCause: " + error.cause.message : ""));
                vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + error.message);
                signOut();
            }
        } else {
            token = await ext.tokenStorage.getToken(tokenType);
            if (!token) {
                getLogger().debug("Token not found in keychain. Trying to exchange with Asgardio token.");
                // possible that token for this particular org was not requested before
                // so we request a new token for this org
                if (tokenType.startsWith("choreo.apim.token.org.")) {
                    const orgId = tokenType.split("choreo.apim.token.org.")[1];
                    const org = ext.api.getOrgById(parseInt(orgId));
                    if (org) {
                        await exchangeChoreoAPIMToken(currentAsgardioToken.accessToken, org.handle, org.id);
                        token = await ext.tokenStorage.getToken(tokenType);
                    } else {
                        getLogger().error("Organization was not found in user orgs!, token exchange failed for org id: " + orgId);
                    }
                }
            } else {
                getLogger().debug("Token found in keychain. " + tokenType);
            }
        } 
    } else {
        getLogger().warn("Asgardio token not found in keychain.");
    }
    lock.release();
    return token;
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
            const response = await ext.clients.authClient.exchangeAuthCode(authCode);
            getLogger().info("auth token exchange time: " + (Date.now() - currentTime));

            await ext.tokenStorage.setToken("asgardio.token", response);
            getLogger().debug("Successfully exchanged auth code to asgardio token.");
            await signin();
            vscode.window.showInformationMessage("Successfully signed in to Choreo.");
            getLogger().info("Total sign in time: " + (Date.now() - currentTime));
        } catch (error: any) {
            const errMsg = "Error while exchanging the auth code! " + error?.message + (error?.cause ? "\nCause: " + error.cause.message : "");
            getLogger().error(errMsg);
            vscode.window.showErrorMessage("Error while signing in to Choreo! " + error.message);
            signOut();
        }
    }
}

export async function exchangeChoreoAPIMToken(asgardioToken: string, orgHandle: string, orgId: number) {
    getLogger().debug("Exchanging asgardio token to Choreo APIM token.");
    if (!asgardioToken) {
        vscode.window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX + APIM_TOKEN_ERROR);
        return;
    }
    try {
        const response = await ext.clients.authClient.exchangeVSCodeToken(asgardioToken, orgHandle);
        getLogger().debug("Successfully exchanged asgardio token to Choreo APIM token.");
        await ext.tokenStorage.setToken(`choreo.apim.token.org.${orgId}`, response);
    } catch (error: any) {
        getLogger().error("Error while exchanging the Choreo APIM token! " + error?.message + (error?.cause ? "\nCause: " + error.cause.message : ""));
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
        const response = await ext.clients.authClient.exchangeRefreshToken(refreshToken);
        getLogger().debug("Successfully exchanged refresh token to access token.");
        await ext.tokenStorage.setToken("asgardio.token", response);
    } catch (error: any) {
        getLogger().error("Error while exchanging the refresh token! " + error?.message + (error?.cause ? "\nCause: " + error.cause.message : ""));
        throw new Error(SESSION_EXPIRED);
    }
}

export async function chooseUserOrg(isExistingSession?: boolean): Promise<Organization|undefined> {
    const asgardioToken = await ext.tokenStorage.getToken("asgardio.token");
    if (asgardioToken?.accessToken && asgardioToken.expirationTime
        && asgardioToken.loginTime && asgardioToken.refreshToken) {
        getLogger().debug("Getting the org list of current user.");
        try {
            var currentTime = Date.now();
            if (!isExistingSession) {
                getLogger().debug("Validating the user.");
                // If its a fresh login, we need to get the user info to get the org list.
                const userInfo = await ext.clients.userManagementClient.validateUser();
                ext.api.userInfo = userInfo;
                getLogger().info("get user info request time: " + (Date.now() - currentTime));
                getLogger().debug("Successfully retrived user info.");
                return await getDefaultSelectedOrg(userInfo?.organizations);
            } else if (ext.api.userInfo) {
                // get orgs from previous session, then reload the orgs
                const orgId = ext.api.userInfo.organizations?.[0]?.id;
                const orgs = await ext.clients.orgClient.getOrganizations(orgId);
                ext.api.userInfo.organizations = orgs;
                getLogger().info("get user info request time: " + (Date.now() - currentTime));
                getLogger().debug("Successfully retrived user info.");
                return await getDefaultSelectedOrg(orgs);
            } else {
                getLogger().error("Unable to get user info from previous session.");
                throw new Error("Unable to get user info from previous session.");
            }
        } catch (error: any) {
            if (error.cause?.response?.status === 404) {
                getLogger().warn("User not found. Prompting to open signup page.");
                promptToOpenSignupPage();
                return;
            }
            if (isExistingSession) {
                sendTelemetryEvent(SIGN_IN_FROM_EXISITING_SESSION_FAILURE_EVENT, { cause: error?.message });
            }
            const errMsg = "Error getting User Org: " + error?.message  + (error?.cause ? " Cause: " + error.cause.message : "");
            getLogger().error(errMsg);
            getLogger().debug("Error payload: " + (error.cause?.response ? JSON.stringify(error.cause?.response?.data) : ""));
            throw new Error(errMsg);
        }
    }
    throw new Error("Asgardio Token not found in keychain.");
}


export async function promptToOpenSignupPage() {
    const signUpURL = ext.clients.authClient.getSignUpURL();
    await vscode.window.showInformationMessage("Please complete signup in the Choreo Console", "Sign Up").then((selection) => {
        if (selection === "Sign Up") {
            return vscode.env.openExternal(vscode.Uri.parse(signUpURL));
        }
    });
}

export async function getDefaultSelectedOrg(userOrgs: Organization[]) {
    if (userOrgs.length === 0) {
        throw new Error("No organizations found for the user.");
    }
    // If workspace a choreo project, we need to select the org of the project.
    const isChoreoProject = ext.api.isChoreoProject();
    if (isChoreoProject) {
        const currentProjectId = await ext.api.getOrgIdOfCurrentProject();
        if (currentProjectId) {
            const foundOrg = userOrgs.find(org => org.id === currentProjectId);
            if (foundOrg) {
                return foundOrg;
            }
        }
    }
    // Else we need to select the first org.
    return userOrgs[0];
}

export async function exchangeOrgAccessTokens( orgHandle: string, orgId: number) {
    getLogger().debug("Exchanging asgardio token to apim token for the org " + orgHandle);
    const asgardioToken = await getTokenWithAutoRefresh("asgardio.token");
    if (asgardioToken?.accessToken) {
        await exchangeChoreoAPIMToken(asgardioToken?.accessToken, orgHandle, orgId);
    } else {
        throw new Error("Asgardio token not found in token store!");
    }
}

export function getConsoleUrl() {
    return choreoEnvConfig.getConsoleUrl();
}

export async function signin(isExistingSession?: boolean) {
    const selectedOrg = await chooseUserOrg(isExistingSession);
    const asgardioToken = await getTokenWithAutoRefresh('asgardio.token');
    if (!asgardioToken?.accessToken) {
        throw new Error("Asgardio token not found in token store!");
    }
    if (!selectedOrg) {
        throw new Error("No organizations found for the user.");
    }
    await exchangeChoreoAPIMToken(asgardioToken?.accessToken, selectedOrg.handle, selectedOrg.id);
    ext.api.status = STATUS_LOGGED_IN;
}

export async function signOut() {
    getLogger().info("Signing out.");
    getLogger().debug("Clear current Choreo session.");
    await ext.tokenStorage.deleteToken('asgardio.token');
    // Clear the org access tokens.
    ext.api.userInfo?.organizations?.forEach(org => {
        ext.tokenStorage.deleteToken(`choreo.apim.token.org.${org.id}`);
    });
    ext.api.status = STATUS_LOGGED_OUT;
    ext.api.userInfo = undefined;
}
