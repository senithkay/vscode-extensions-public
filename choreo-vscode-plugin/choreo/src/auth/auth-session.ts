/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
import { ChoreoSessionConfig } from "./config";
import keytar = require("keytar");
import { ChoreoSession } from "./session";

export async function getChoreoKeytarSession(): Promise<ChoreoSession> {
    let choreoAccessToken: string | null = null;
    await keytar.getPassword(ChoreoSessionConfig.serviceName, ChoreoSessionConfig.accessToken).then((result) => {
        choreoAccessToken = result;
    });

    let choreoUser: string | null = null;
    await keytar.getPassword(ChoreoSessionConfig.serviceName, ChoreoSessionConfig.displayName).then((result) => {
        choreoUser = result;
    });

    let choreoRefreshToken: string | null = null;
    await keytar.getPassword(ChoreoSessionConfig.serviceName, ChoreoSessionConfig.refreshToken).then((result) => {
        choreoRefreshToken = result;
    });

    let choreoLoginTime: Date | null = null;
    await keytar.getPassword(ChoreoSessionConfig.serviceName, ChoreoSessionConfig.loginTime).then((result) => {
        if (result !== null) {
            choreoLoginTime = new Date(result);
        }
    });

    let choreoTokenExpiration: number | undefined;
    await keytar.getPassword(ChoreoSessionConfig.serviceName, ChoreoSessionConfig.tokenExpiration).then((result) => {
        if (result !== null) {
            choreoTokenExpiration = Number(result);
        }
    });

    if (choreoAccessToken !== null && choreoUser !== null && choreoRefreshToken !== null && choreoLoginTime !== null) {
        return {
            loginStatus: true,
            choreoUser: choreoUser,
            choreoAccessToken: choreoAccessToken,
            choreoRefreshToken: choreoRefreshToken,
            choreoLoginTime: choreoLoginTime,
            tokenExpirationTime: choreoTokenExpiration
        };
    } else {
        return {
            loginStatus: false
        };
    }
}

export async function setChoreoKeytarSession(accessToken: string, displayName: string, refreshToken: string, loginTime: string, expirationTime: string) {
    await keytar.setPassword(ChoreoSessionConfig.serviceName, ChoreoSessionConfig.accessToken, accessToken);
    await keytar.setPassword(ChoreoSessionConfig.serviceName, ChoreoSessionConfig.displayName, displayName);
    await keytar.setPassword(ChoreoSessionConfig.serviceName, ChoreoSessionConfig.refreshToken, refreshToken);
    await keytar.setPassword(ChoreoSessionConfig.serviceName, ChoreoSessionConfig.loginTime, loginTime);
    await keytar.setPassword(ChoreoSessionConfig.serviceName, ChoreoSessionConfig.tokenExpiration, expirationTime);
}

export async function deleteChoreoKeytarSession() {
    await keytar.deletePassword(ChoreoSessionConfig.serviceName, ChoreoSessionConfig.accessToken);
    await keytar.deletePassword(ChoreoSessionConfig.serviceName, ChoreoSessionConfig.displayName);
    await keytar.deletePassword(ChoreoSessionConfig.serviceName, ChoreoSessionConfig.refreshToken);
    await keytar.deletePassword(ChoreoSessionConfig.serviceName, ChoreoSessionConfig.loginTime);
    await keytar.deletePassword(ChoreoSessionConfig.serviceName, ChoreoSessionConfig.tokenExpiration);
}
