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
import { AccessToken, ChoreoTokenType, ITokenStorage, UserInfo } from "./types";
import keytar = require("keytar");

export enum Keys {
    serviceName = "wso2.ballerina.choreo",
    accessToken = "access.token",
    displayName = "display.name",
    userId = "userId",
    userIds = "userIds",
    refreshToken = "refresh.token",
    loginTime = "login.time",
    tokenExpiration = "token.expiration.time"
}

export class KeyChainTokenStorage implements ITokenStorage {
    async getCurrentUser(): Promise<UserInfo | undefined> {
        let userId: string | null = null;
        await keytar.getPassword(Keys.serviceName, Keys.userId).then((result) => {
            userId = result;
        });
        if (userId !== null) {
            return this.getUser(userId);
        }
        return undefined;
    }

    async getUser(userId: string): Promise<UserInfo | undefined> {
        let displayName: string | null = null;
        await keytar.getPassword(Keys.serviceName, `${userId}.${Keys.displayName}`).then((result) => {
            displayName = result;
        });
        if (userId !== null && displayName !== null) {
            return {
                userId,
                displayName
            };
        }
        return undefined;
    }

    async getToken(tokenType: ChoreoTokenType, userId?: string): Promise<AccessToken | undefined> {
        const serviceName = Keys.serviceName + tokenType;
        let choreoAccessToken: string | null = null;
        await keytar.getPassword(serviceName, userId ? `${userId}.${Keys.accessToken}` : Keys.accessToken).then((result) => {
            choreoAccessToken = result;
        });

        let choreoRefreshToken: string | null = null;
        await keytar.getPassword(serviceName, userId ? `${userId}.${Keys.refreshToken}` : Keys.refreshToken).then((result) => {
            choreoRefreshToken = result;
        });

        let choreoLoginTime: Date | null = null;
        await keytar.getPassword(serviceName, userId ? `${userId}.${Keys.loginTime}` : Keys.loginTime).then((result) => {
            if (result !== null) {
                choreoLoginTime = new Date(result);
            }
        });

        let choreoTokenExpiration: number | undefined;
        await keytar.getPassword(serviceName, userId ? `${userId}.${Keys.tokenExpiration}` : Keys.tokenExpiration).then((result) => {
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

    async getUsers(): Promise<string[]> {
        let userIds: string | null = null;
        await keytar.getPassword(Keys.serviceName, Keys.userIds).then((result) => {
            userIds = result;
        });

        if (userIds !== null) {
            return (userIds as string).split(",");
        }
        return [];
    }

    async setCurrentUser(user: UserInfo): Promise<void> {
        await keytar.setPassword(Keys.serviceName, Keys.userId, user.userId);
        await keytar.setPassword(Keys.serviceName, Keys.displayName, user.displayName);
    }

    async addUser(user: UserInfo): Promise<void> {
        const userIds: string[] = await this.getUsers();

        if (userIds.indexOf(user.userId) === -1) {
            if (userIds.length > 0) {
                userIds.push(user.userId);
                await keytar.setPassword(Keys.serviceName, Keys.userIds, userIds.toString());
            } else {
                await keytar.setPassword(Keys.serviceName, Keys.userIds, user.userId);
            }
        }
        await keytar.setPassword(Keys.serviceName, `${user.userId}.${Keys.userId}`, user.userId);
        await keytar.setPassword(Keys.serviceName, `${user.userId}.${Keys.displayName}`, user.displayName);
    }

    async setToken(tokenType: ChoreoTokenType, token: AccessToken, userId?: string): Promise<void> {
        const serviceName = Keys.serviceName + tokenType;
        await keytar.setPassword(serviceName, userId ? `${userId}.${Keys.accessToken}` : Keys.accessToken, token.accessToken);
        if (token.refreshToken !== undefined) {
            await keytar.setPassword(serviceName, userId ? `${userId}.${Keys.refreshToken}` : Keys.refreshToken, token.refreshToken);
        }
        await keytar.setPassword(serviceName, userId ? `${userId}.${Keys.loginTime}` : Keys.loginTime, token.loginTime);
        if (token.expirationTime !== undefined) {
            await keytar.setPassword(serviceName, userId ? `${userId}.${Keys.tokenExpiration}` : Keys.tokenExpiration, token.expirationTime.toString());
        }
    }

    async deleteToken(tokenType: ChoreoTokenType | string): Promise<void> {
        const serviceName = Keys.serviceName + tokenType;
        await keytar.deletePassword(serviceName, Keys.accessToken);
        await keytar.deletePassword(serviceName, Keys.refreshToken);
        await keytar.deletePassword(serviceName, Keys.loginTime);
        await keytar.deletePassword(serviceName, Keys.tokenExpiration);
    }

    async deleteCurrentUser(): Promise<void> {
        const user = await this.getCurrentUser();
        if (user) {
            this.deleteUser(user.userId);
            let userIds: string[] = await this.getUsers();
            userIds = userIds.filter(usr => usr !== user?.userId);

            if (userIds.length > 0) {
                await keytar.setPassword(Keys.serviceName, Keys.userIds, userIds.toString());
            } else {
                await keytar.deletePassword(Keys.serviceName, Keys.userIds);
            }
        }
    }

    async deleteUser(userId: string): Promise<void> {
        await keytar.deletePassword(Keys.serviceName, Keys.userId);
        await keytar.deletePassword(Keys.serviceName, `${userId}.${Keys.userId}`);
        await keytar.deletePassword(Keys.serviceName, `${userId}.${Keys.displayName}`);

        const userIds: string[] = await this.getUsers();

        if (userIds.length > 0) {
            await keytar.setPassword(Keys.serviceName, Keys.userIds, (userIds.filter(usr => usr !== userId)).toString());
        }
    }
}
