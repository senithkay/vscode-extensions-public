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

// Create a Store class to store the authentication data. The following implementation uses the session storage.
export class SessionStore {
    // Saves the data to the store.
    async setData(key, value) {
        // sessionStorage.setItem(key, value);
        await keytar.setPassword(ChoreoSessionConfig.ServiceName, key, value);
    }

    // Gets the data from the store.
    async getData(key) {
        // return sessionStorage.getItem(key);
        let value: string = "";
        await keytar.getPassword(ChoreoSessionConfig.ServiceName, key).then((result) => {
            value = result!;
        });
        return value;
    }

    // Removes the date from the store.
    async removeData(key) {
        // sessionStorage.removeItem(key);
        await keytar.deletePassword(ChoreoSessionConfig.ServiceName, key);
    }
}

export async function getChoreoKeytarSession(): Promise<ChoreoSession> {
    let choreoToken: string | null = null;
    await keytar.getPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.AccessToken).then((result) => {
        choreoToken = result;
    });

    let choreoUser: string | null = null;
    await keytar.getPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.DisplayName).then((result) => {
        choreoUser = result;
    });

    let choreoCookie: string | null = null;
    await keytar.getPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.CookieCwatf).then((result) => {
        choreoCookie = result;
    });

    if (choreoToken != null && choreoUser != null && choreoCookie != null) {
        return {
            loginStatus: true,
            choreoUser: choreoUser,
            choreoToken: choreoToken,
            choreoCookie: choreoCookie
        };
    } else {
        return {
            loginStatus: false
        };
    }
}

export async function setChoreoKeytarSession(accessToken, displayName, cookieCwatf) {
    await keytar.setPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.AccessToken, accessToken);
    await keytar.setPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.DisplayName, displayName);
    await keytar.setPassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.CookieCwatf, cookieCwatf);
}

export async function deleteChoreoKeytarSession() {
    await keytar.deletePassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.AccessToken);
    await keytar.deletePassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.DisplayName);
    await keytar.deletePassword(ChoreoSessionConfig.ServiceName, ChoreoSessionConfig.CookieCwatf);
}