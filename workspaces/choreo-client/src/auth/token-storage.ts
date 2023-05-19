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
import { AccessToken, ChoreoTokenType, ITokenStorage } from "./types";
import keytar = require("keytar");

export enum Keys {
    serviceName = "wso2.ballerina.choreo",
    accessToken = "access.token",
    displayName = "display.name",
    refreshToken = "refresh.token",
    loginTime = "login.time",
    tokenExpiration = "token.expiration.time"
}

export class KeyChainTokenStorage implements ITokenStorage {
    async getToken(tokenType: ChoreoTokenType): Promise<AccessToken | undefined> {
        const serviceName = Keys.serviceName + tokenType;
        let choreoAccessToken: string | null = null;
        await keytar.getPassword(serviceName, Keys.accessToken).then((result) => {
            choreoAccessToken = result;
        });

        let choreoRefreshToken: string | null = null;
        await keytar.getPassword(serviceName, Keys.refreshToken).then((result) => {
            choreoRefreshToken = result;
        });

        let choreoLoginTime: Date | null = null;
        await keytar.getPassword(serviceName, Keys.loginTime).then((result) => {
            if (result !== null) {
                choreoLoginTime = new Date(result);
            }
        });

        let choreoTokenExpiration: number | undefined;
        await keytar.getPassword(serviceName, Keys.tokenExpiration).then((result) => {
            if (result !== null) {
                choreoTokenExpiration = Number(result);
            }
        });

        if (choreoAccessToken !== null && choreoLoginTime !== null) {
            return {
                accessToken: choreoAccessToken,
                refreshToken: choreoRefreshToken || undefined,
                loginTime: choreoLoginTime,
                expirationTime: choreoTokenExpiration
            };
        }
        return undefined;
    }

    async setToken(tokenType: ChoreoTokenType, token: AccessToken): Promise<void> {
        const serviceName = Keys.serviceName + tokenType;
        await keytar.setPassword(serviceName, Keys.accessToken, token.accessToken);
        if (token.refreshToken !== undefined) {
            await keytar.setPassword(serviceName, Keys.refreshToken, token.refreshToken);
        }
        await keytar.setPassword(serviceName, Keys.loginTime, token.loginTime);
        if (token.expirationTime !== undefined) {
            await keytar.setPassword(serviceName, Keys.tokenExpiration, token.expirationTime.toString());
        }
    }

    async deleteToken(tokenType: ChoreoTokenType): Promise<void> {
        const serviceName = Keys.serviceName + tokenType;
        await keytar.deletePassword(serviceName, Keys.accessToken);
        await keytar.deletePassword(serviceName, Keys.refreshToken);
        await keytar.deletePassword(serviceName, Keys.loginTime);
        await keytar.deletePassword(serviceName, Keys.tokenExpiration);
    }
}
