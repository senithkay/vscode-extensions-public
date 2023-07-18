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
import { AccessToken, ChoreoTokenType, ITokenStorage } from "@wso2-enterprise/choreo-client";
import { ExtensionContext } from "vscode";
import { VSCodeKeychain } from "./VSCodeKeychain";

export class TokenStorage implements ITokenStorage {

    private _keyChain: VSCodeKeychain;

    constructor(private _ctx: ExtensionContext) { 
        this._keyChain = new VSCodeKeychain(_ctx);
    }

    setTokenForOrg(orgId: number, token: AccessToken) {
        return this.setToken(`choreo.apim.token.org.${orgId}`, token);
    }

    deleteTokenForOrg(orgId: number): Promise<void> {
        return this.deleteToken(`choreo.apim.token.org.${orgId}`);
    }

    getTokenForOrg(orgId: number): Promise<AccessToken | undefined> {
        return this.getToken(`choreo.apim.token.org.${orgId}`);
    }

    async setToken(tokenType: ChoreoTokenType, token: AccessToken): Promise<void> {
        // save to keychain, convert token json to string and encrypt with base64
        const tokenString = JSON.stringify(token);
        const encryptedToken = Buffer.from(tokenString).toString('base64');
        return this._keyChain.setToken(tokenType, encryptedToken);
        
    }
    
    async deleteToken(tokenType: ChoreoTokenType): Promise<void> {
        return this._keyChain.deleteToken(tokenType);
    }

    async getToken(tokenType: ChoreoTokenType): Promise<AccessToken | undefined> {
        const token = await this._keyChain.getToken(tokenType);
        if (token) {
            const decryptedToken = Buffer.from(token, 'base64').toString();
            return JSON.parse(decryptedToken);
        }
    }

}
