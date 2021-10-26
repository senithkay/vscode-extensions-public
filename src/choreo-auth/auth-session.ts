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
import keytar = require("keytar");
import { ChoreoSession } from "../core";
import { ChoreoSessionConfig } from "./config";

// Session Store class to store the authentication data when using the Asgardeo SDK.
export class SessionStore {
    // Saves the data to the store.
    async setData(key, value) {
        await keytar.setPassword(ChoreoSessionConfig.ServiceName, key, value);
    }

    // Gets the data from the store.
    async getData(key) {
        let value: string = "";
        await keytar.getPassword(ChoreoSessionConfig.ServiceName, key).then((result) => {
            value = result!;
        });
        return value;
    }

    // Removes the date from the store.
    async removeData(key) {
        await keytar.deletePassword(ChoreoSessionConfig.ServiceName, key);
    }
}

export async function getChoreoKeytarSession(): Promise<ChoreoSession> {
    if (process.env.OVERRIDE_CHOREO_AUTHENTICATION === 'true') {
        return {
            loginStatus: true,
            choreoUser: process.env.VSCODE_CHOREO_SESSION_USERNAME,
            choreoToken: process.env.VSCODE_CHOREO_SESSION_TOKEN
        }
    }

    let choreoToken: string | null = null;
    await keytar.getPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.AccessToken).then((result) => {
        choreoToken = result;
    });

    let choreoUser: string | null = null;
    await keytar.getPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.DisplayName).then((result) => {
        choreoUser = result;
    });

    if (choreoToken != null && choreoUser != null) {
        return {
            loginStatus: true,
            choreoUser: choreoUser,
            choreoToken: choreoToken
        };
    } else {
        return {
            loginStatus: false
        };
    }
}

export async function setChoreoKeytarSession(accessToken, displayName) {
    await keytar.setPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.AccessToken, accessToken);
    await keytar.setPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.DisplayName, displayName);
}

export async function deleteChoreoKeytarSession() {
    await keytar.deletePassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.AccessToken);
    await keytar.deletePassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.DisplayName);
}
