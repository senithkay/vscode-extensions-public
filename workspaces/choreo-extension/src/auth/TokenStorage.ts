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
import { AccessToken, ITokenStorage } from "@wso2-enterprise/choreo-client";
import { ExtensionContext } from "vscode";
import { VSCodeKeychain } from "./VSCodeKeychain";
import { UserInfo } from "@wso2-enterprise/choreo-core";

export class TokenStorage implements ITokenStorage {

    private _keyChain: VSCodeKeychain;

    constructor(private _ctx: ExtensionContext) { 
        this._keyChain = new VSCodeKeychain(_ctx);
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

    public setUser(userInfo: UserInfo): Promise<void> {
        return this._keyChain.setCurrentUser(userInfo);
    }

    public getUser(): Promise<UserInfo | undefined> {
        return this._keyChain.getCurrentUser();
    }

    private async _setToken(key: string, token: AccessToken): Promise<void> {
        // save to keychain, convert token json to string and encrypt with base64
        const tokenString = JSON.stringify(token);
        const encryptedToken = Buffer.from(tokenString).toString('base64');
        return this._keyChain.setToken(key, encryptedToken);
        
    }
    
    private async _deleteToken(key: string): Promise<void> {
        return this._keyChain.deleteToken(key);
    }

    private async _getToken(key: string): Promise<AccessToken | undefined> {
        const token = await this._keyChain.getToken(key);
        if (token) {
            const decryptedToken = Buffer.from(token, 'base64').toString();
            return JSON.parse(decryptedToken);
        }
    }

}
