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
import { ExtensionContext } from "vscode";
import { TokenStorage } from "./TokenStorage";
import { getLogger } from "../logger/logger";
import { AccessToken, ChoreoAuthClient, ChoreoOrgClient, ChoreoUserManagementClient } from "@wso2-enterprise/choreo-client";
import { ChoreoEnvConfig } from "./config";
import { Organization, UserInfo } from "@wso2-enterprise/choreo-core";
import { getDefaultSelectedOrg, promptToOpenSignupPage } from "./auth";
import { ext } from "../extensionVariables";
import { STATUS_LOGGED_IN, STATUS_LOGGED_OUT } from "../constants";
import { lock } from "./lock";


export function isTokenExpired(token: AccessToken) {
    if (!token?.accessToken || !token?.expirationTime) {
        throw new Error("Invalid token.");
    }
    let tokenDuration = (new Date().getTime() - new Date(token.loginTime).getTime()) / 1000;
    // Invalidate the token 1 hour before the actual expiry time
    // This is due to an issue in the backend where the token is invalidated before the actual expiry time
    // We will remove this once the issue is fixed in the backend
    return tokenDuration > (60 * 60);
}


export class AuthHandler {

    private _tokenStorage: TokenStorage;

    private _authClient: ChoreoAuthClient;

    private _userManagementClient: ChoreoUserManagementClient;

    private _orgClient: ChoreoOrgClient;

    constructor(context: ExtensionContext, _choreoEnvConfig: ChoreoEnvConfig) {
        this._tokenStorage = new TokenStorage(context);

        this._authClient = new ChoreoAuthClient({
            loginUrl: _choreoEnvConfig.getLoginUrl(),
            redirectUrl: _choreoEnvConfig.getRedirectUri(),
            signUpUrl: _choreoEnvConfig.getSignUpUri(),
            apimTokenUrl: _choreoEnvConfig.getApimTokenUri(),
            clientId: _choreoEnvConfig.getClientId(),
            apimClientId: _choreoEnvConfig.getApimClientId(),
            vscodeClientId: _choreoEnvConfig.getVscodeClientId(),
            tokenUrl: _choreoEnvConfig.getTokenUri(),
            apimScopes: _choreoEnvConfig.getApimEnvScopes()
        });

        this._userManagementClient = new ChoreoUserManagementClient(_choreoEnvConfig.getUserManagementUrl());

        this._orgClient = new ChoreoOrgClient(_choreoEnvConfig.getOrgsAPI());
    }

    public async exchangeAuthCode(authCode: string) {
        getLogger().debug("Exchanging Auth code to Asgardio token.");
        if (!authCode) {
            throw new Error("Auth code is not provided.");
        } else {
            try {
                var currentTime = Date.now();
                const response = await this._authClient.exchangeAuthCode(authCode);
                getLogger().debug("Successfully exchanged auth code to Asgardio token.");
                getLogger().debug("Auth code exchange time: " + (Date.now() - currentTime));
                const userInfo = await this._validateUser(response.accessToken);
                const selectedOrg = await getDefaultSelectedOrg(userInfo?.organizations);
                if (!selectedOrg) {
                    throw new Error("No organizations found for the user.");
                }
                await this.exchangeChoreoSTSToken(response.accessToken, selectedOrg.handle, selectedOrg.id);
                await this.signin();
                getLogger().debug("Total sign in time: " + (Date.now() - currentTime));
            } catch (error: any) {
                const errMsg = "Error while signing in to Choreo! " + error?.message;
                getLogger().error(errMsg);
                if (error?.cause) {
                    getLogger().debug("Cause message: " + JSON.stringify(error.cause?.message));
                }
                throw new Error(errMsg);
            }
        }
    }

    public async getToken(orgId: number) {
        let token : AccessToken | undefined;
        await lock.acquire();
        try {
            const userInfo = await this._tokenStorage.getUser();
            if (!userInfo || !userInfo.organizations) {
                throw new Error("No user found in the keychain.");
            }
            // eslint-disable-next-line eqeqeq
            const selectedOrg = userInfo.organizations.find((org: Organization) => org.id == orgId);
            if (!selectedOrg) {
                throw new Error("No organization found for the user.");
            }
            token = await this._getTokenWithAutoRefresh(selectedOrg);
        } finally {
            lock.release();
        }
        return token;
    }

    private async exchangeChoreoSTSToken(subjectToken: string, orgHandle: string, orgId: number) {
        getLogger().debug("Exchanging givn token to Choreo APIM token for org: " + orgHandle);
        if (!subjectToken) {
            throw new Error("Subject token is not provided.");
        }
        try {
            const response = await this._authClient.exchangeVSCodeToken(subjectToken, orgHandle);
            getLogger().debug("Successfully exchanged given token to Choreo APIM tokenfor org: " + orgHandle);
            await this._tokenStorage.setToken(orgId, response);
            return response;
        } catch (error: any) {
            const errMsg = "Error while exchanging givn token to Choreo APIM token for org: " + orgHandle + error?.message;
            getLogger().error(errMsg);
            if (error?.cause) {
                getLogger().debug("Cause message: " + JSON.stringify(error.cause?.message));
            }
            throw new Error(errMsg);
        }
    }

    public getSignUpUrl() {
        return this._authClient.getSignUpURL();
    }

    public async signin(refreshOrgs: boolean = false) {
        const userInfo = await this._tokenStorage.getUser();
        if (!userInfo || !userInfo.organizations) {
            throw new Error("No user found in the keychain.");
        }
        if (refreshOrgs) {
            await this._refreshOrgs(userInfo);
        }
        const updatedUserInfo = await this._tokenStorage.getUser();
        if (!updatedUserInfo) {
            throw new Error("No user found in the keychain.");
        }
        const selectedOrg = await getDefaultSelectedOrg(updatedUserInfo?.organizations);
        if (!selectedOrg) {
            throw new Error("No organizations found for the user.");
        }
        const orgAccessToken = await this.getToken(selectedOrg?.id);
        if (!orgAccessToken?.accessToken) {
            throw new Error("Asgardio token not found in token store!");
        }
        ext.api.status = STATUS_LOGGED_IN;
        ext.api.userInfo = updatedUserInfo;
    }

    public async signout() {
        // TODO: Revoke tokens by calling the revoke endpoint.
        this._tokenStorage.clearCurrentUserSession();
        ext.api.status = STATUS_LOGGED_OUT;
        ext.api.userInfo = undefined;
    }

    public async getAuthUrl(callbackUri: string): Promise<string> {
        return this._authClient.getAuthURL(callbackUri);
    }

    private async _getTokenWithAutoRefresh(org: Organization): Promise<AccessToken|undefined> {
        const token = await this._tokenStorage.getToken(org.id);
        if (token) {
            if (isTokenExpired(token)) {
                let refreshedToken;
                try {
                    refreshedToken = await this._exchangeRefreshToken(token);
                } catch (error: any) {
                    getLogger().error("Signing out user due to error in refresh token exchange");
                    await this.signout();
                }
                if (refreshedToken) {
                    const updatedToken = await this.exchangeChoreoSTSToken(refreshedToken.accessToken, org.handle, org.id);
                    this._tokenStorage.setToken(org.id, updatedToken);
                    return updatedToken;
                }
            } else {
                return token;
            }
        } else {
            const orgWithExistingToken = await this._getAnyOrgWithExistingToken();
            if (orgWithExistingToken) {
               const existingToken = await this._getTokenWithAutoRefresh(orgWithExistingToken);
                if (existingToken) {
                    return this.exchangeChoreoSTSToken(existingToken.accessToken, org.handle, org.id);
                }
            }
        }
    }
    
    private async _getAnyOrgWithExistingToken(): Promise<Organization|undefined> {
        const userInfo = await this._tokenStorage.getUser();
        if (!userInfo || !userInfo.organizations) {
            throw new Error("No user found in the keychain.");
        }
        for (const org of userInfo.organizations) {
            const token = await this._tokenStorage.getToken(org.id);
            if (token) {
                return org;
            }
        }
        return undefined;
    }

    private async _exchangeRefreshToken(token: AccessToken): Promise<AccessToken|undefined> {
        getLogger().debug("Refreshing the token.");
        if (!token || !token.refreshToken) {
            throw new Error("Invalid token.");
        }
        try {
            const response = await this._authClient.exchangeRefreshToken(token.refreshToken);
            getLogger().debug("Successfully exchanged refresh token to access token.");
            return response;
        } catch (error: any) {
            const errMsg = "Error while refreshing the token! " + error?.message;
            getLogger().error(errMsg);
            if (error?.cause) {
                getLogger().debug("Cause message: " + JSON.stringify(error.cause?.message));
            }
            throw error;
        }
    }

    private async _refreshOrgs(userInfo: UserInfo): Promise<void> {
        // get orgs from previous session, then reload the orgs
        const org = userInfo.organizations?.[0];
        if (!org) {
            throw new Error("No organizations found for the user.");
        }
        const token = await this.getToken(org?.id);
        if (!token?.accessToken) {
            throw new Error("Asgardio token not found in token store!");
        }
        const orgs = await this._orgClient.getOrganizations(token?.accessToken);

        this._tokenStorage.setUser({
            ...userInfo,
            organizations: orgs
        });
    }

    private async _validateUser(asgardioToken: string): Promise<UserInfo> {
        getLogger().debug("Validating the user.");
        try {
            const userInfo = await this._userManagementClient.validateUser(asgardioToken);
            this._tokenStorage.setUser(userInfo);
            getLogger().debug("Successfully retrived user info. " + JSON.stringify(userInfo));
            return userInfo;
        } catch (error: any) {
            if (error.cause?.response?.status === 404) {
                getLogger().error("User not found. Prompt to open signup page.");
                promptToOpenSignupPage();
            }
            getLogger().error("Error while validating the user. " + error?.message, error);
            throw new Error("Error while validating the user. " + error?.message);
        }
       
    }
}
