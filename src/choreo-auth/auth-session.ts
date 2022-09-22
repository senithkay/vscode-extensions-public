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
import { readFileSync, existsSync } from "fs";
import { ChoreoSession } from "../core";
import { ChoreoSessionConfig } from "./config";
import keytar = require("keytar");
import path = require("path");
const os = require("os");
const KEY_FILE_PATH = path.join(os.homedir(), ".config", "choreo", "vscode", "auth.json");

export async function getChoreoKeytarSession(): Promise<ChoreoSession> {
    if (existsSync(KEY_FILE_PATH)) {
        const data = readFileSync(KEY_FILE_PATH, { encoding: 'utf-8' });
        const session = JSON.parse(data).session;
        return {
            loginStatus: true,
            choreoUser: session.username,
            choreoAccessToken: session.token,
            choreoRefreshToken: session.refreshToken,
            choreoLoginTime: new Date()
        };
    }

    if (process.env.OVERRIDE_CHOREO_AUTHENTICATION === 'true' && process.env.VSCODE_CHOREO_SESSION_USERNAME
        && process.env.VSCODE_CHOREO_SESSION_TOKEN) {
        return {
            loginStatus: true,
            choreoUser: process.env.VSCODE_CHOREO_SESSION_USERNAME,
            choreoAccessToken: process.env.VSCODE_CHOREO_SESSION_TOKEN,
            choreoRefreshToken: process.env.VSCODE_CHOREO_REFRESH_TOKEN,
            choreoLoginTime: new Date()
        };
    }

    let choreoAccessToken: string | null = null;
    await keytar.getPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.AccessToken).then((result) => {
        choreoAccessToken = result;
    });

    let choreoUser: string | null = null;
    await keytar.getPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.DisplayName).then((result) => {
        choreoUser = result;
    });

    let choreoRefreshToken: string | null = null;
    await keytar.getPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.RefreshToken).then((result) => {
        choreoRefreshToken = result;
    });

    let choreoLoginTime: Date | null = null;
    await keytar.getPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.LoginTime).then((result) => {
        if (result != null) {
            choreoLoginTime = new Date(result);
        }
    });

    let choreoTokenExpiration: number | undefined;
    await keytar.getPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.TokenExpiration).then((result) => {
        if (result != null) {
            choreoTokenExpiration = Number(result);
        }
    });

    if (choreoAccessToken != null && choreoUser != null && choreoRefreshToken != null && choreoLoginTime != null) {
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

export async function setChoreoKeytarSession(accessToken, displayName, refreshToken, loginTime, expirationTime) {
    await keytar.setPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.AccessToken, accessToken);
    await keytar.setPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.DisplayName, displayName);
    await keytar.setPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.RefreshToken, refreshToken);
    await keytar.setPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.LoginTime, loginTime);
    await keytar.setPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.TokenExpiration, expirationTime);
}

export async function deleteChoreoKeytarSession() {
    await keytar.deletePassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.AccessToken);
    await keytar.deletePassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.DisplayName);
    await keytar.deletePassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.RefreshToken);
    await keytar.deletePassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.LoginTime);
    await keytar.deletePassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.TokenExpiration);
}
