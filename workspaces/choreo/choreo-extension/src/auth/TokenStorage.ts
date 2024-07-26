/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { AccessToken, ITokenStorage } from "@wso2-enterprise/choreo-client";
import { ExtensionContext } from "vscode";
import { VSCodeKeychain } from "./VSCodeKeychain";
import { UserInfo } from "@wso2-enterprise/choreo-core";
import { ext } from "../extensionVariables";
import { STATUS_LOGGED_OUT } from "../constants";

export class TokenStorage implements ITokenStorage {

    private _keyChain: VSCodeKeychain;

    constructor(_ctx: ExtensionContext) { 
        this._keyChain = new VSCodeKeychain(_ctx);
        // if the user is changed from another window
        // or if the user is logged out from another window
        // we need to make sure all the active windows are logged out
        // or the user is changed. Right now we only support one user.
        // hence we only handle the logout case.
        this._keyChain.onUserInfoChange(async (userInfo) => {
            if (!userInfo) {
                ext.api.userInfo = undefined;
                ext.api.status = STATUS_LOGGED_OUT;
            } else {
                // TODO: handle user change
            }
        });
    }

    setToken(orgId: number, token: AccessToken) {
        return this._setToken(`choreo.apim.token.org.${orgId}`, token);
    }

    deleteToken(orgId: number): Promise<void> {
        return this._deleteToken(`choreo.apim.token.org.${orgId}`);
    }

    getToken(orgId: number): Promise<AccessToken | undefined> {
        return this._getToken(`choreo.apim.token.org.${orgId}`);
    }

    public async clearCurrentUserSession(): Promise<void> {
        await this.deleteAllTokensOfCurrentUser();
        return this._keyChain.deleteCurrentUser();
    }

    public setUser(userInfo: UserInfo): Promise<void> {
        return this._keyChain.setCurrentUser(userInfo);
    }

    public getUser(): Promise<UserInfo | undefined> {
        return this._keyChain.getCurrentUser();
    }

    private async deleteAllTokensOfCurrentUser(): Promise<void> {
        const orgs = (await this.getUser())?.organizations;
        if (orgs) {
            for (const org of orgs) {
                await this.deleteToken(org.id);
            }
        }
    }

    private async _setToken(key: string, token: AccessToken): Promise<void> {
        // save to keychain, convert token json to string and encrypt with base64
        const tokenString = JSON.stringify(token);
        const encodedToken = Buffer.from(tokenString).toString('base64');
        return this._keyChain.setToken(key, encodedToken);
        
    }
    
    private async _deleteToken(key: string): Promise<void> {
        return this._keyChain.deleteToken(key);
    }

    private async _getToken(key: string): Promise<AccessToken | undefined> {
        const token = await this._keyChain.getToken(key);
        if (token) {
            const decodedToken = Buffer.from(token, 'base64').toString();
            return JSON.parse(decodedToken);
        }
    }

}
