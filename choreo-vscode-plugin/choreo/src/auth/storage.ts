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
import { ChoreoAccessToken } from "./types";

export async function getChoreoToken(tokenKey: string): Promise<ChoreoAccessToken|undefined> {
    const serviceName = ChoreoSessionConfig.serviceName + tokenKey;
    let choreoAccessToken: string | null = null;
    await keytar.getPassword(serviceName, ChoreoSessionConfig.accessToken).then((result) => {
        choreoAccessToken = result;
    });

    let choreoRefreshToken: string | null = null;
    await keytar.getPassword(serviceName, ChoreoSessionConfig.refreshToken).then((result) => {
        choreoRefreshToken = result;
    });

    let choreoLoginTime: Date | null = null;
    await keytar.getPassword(serviceName, ChoreoSessionConfig.loginTime).then((result) => {
        if (result !== null) {
            choreoLoginTime = new Date(result);
        }
    });

    let choreoTokenExpiration: number | undefined;
    await keytar.getPassword(serviceName, ChoreoSessionConfig.tokenExpiration).then((result) => {
        if (result !== null) {
            choreoTokenExpiration = Number(result);
        }
    });

    if (choreoAccessToken !== null && choreoRefreshToken !== null && choreoLoginTime !== null) {
        return {
            accessToken: choreoAccessToken,
            refreshToken: choreoRefreshToken,
            loginTime: choreoLoginTime,
            expirationTime: choreoTokenExpiration
        };
    }
}

export async function storeChoreoToken(tokenKey: string, accessToken: string, refreshToken: string, loginTime: string, expirationTime: string) {
    const serviceName = ChoreoSessionConfig.serviceName + tokenKey;
    await keytar.setPassword(serviceName, ChoreoSessionConfig.accessToken, accessToken);
    await keytar.setPassword(serviceName, ChoreoSessionConfig.refreshToken, refreshToken);
    await keytar.setPassword(serviceName, ChoreoSessionConfig.loginTime, loginTime);
    await keytar.setPassword(serviceName, ChoreoSessionConfig.tokenExpiration, expirationTime);
}

export async function deleteChoreoToken(tokenKey: string) {
    const serviceName = ChoreoSessionConfig.serviceName + tokenKey;
    await keytar.deletePassword(serviceName, ChoreoSessionConfig.accessToken);
    await keytar.deletePassword(serviceName, ChoreoSessionConfig.refreshToken);
    await keytar.deletePassword(serviceName, ChoreoSessionConfig.loginTime);
    await keytar.deletePassword(serviceName, ChoreoSessionConfig.tokenExpiration);
}
