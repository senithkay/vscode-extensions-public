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
 import vscode from "vscode";
import { AsgardeoAuthClient, AuthClientConfig, ResponseMode } from "@asgardeo/auth-js";
import { SessionStore } from "./auth-session";

const config: AuthClientConfig = {
    // signInRedirectURL: "vscode://wso2-ballerina",
    signInRedirectURL: "http://localhost:9000/",
    clientID: "GEjPOPRsoMMlNrDuO8fqCBL4mS8a",
    serverOrigin: "https://id.dv.choreo.dev:443",
    prompt: "login",
    responseMode: ResponseMode.query,
    scope: ["openid", "name", "user"],
    endpoints: {
        authorizationEndpoint: "/oauth2/authorize",
        tokenEndpoint: "/oauth2/token",
        endSessionEndpoint: "/oidc/logout"
    }
};

// Instantiate the SessionStore class
const store = new SessionStore();

// // Instantiate the AsgardeoAuthClient and pass the store object as an argument into the constructor.
const auth = new AsgardeoAuthClient(store);

export async function initiateAsgardeoAuth() {
    // Initialize the instance with the config object.
    auth.initialize(config);
    auth.getDataLayer().setOIDCProviderMetaData({authorization_endpoint: "https://id.dv.choreo.dev:443/oauth2/authorize"});

    // To get the authorization URL, simply call this method.
    await auth.getAuthorizationURL()
        .then((url) => {
            // Redirect the user to the authentication URL. If this is used in a browser,
            // you may want to do something like this:
            vscode.env.openExternal(vscode.Uri.parse(url));
        })
        .catch((error) => {
            console.error(error);
        });
    // Once you obtain the authentication code and the session state from the server, you can use this method
    // to get the access token.
}


export function accessTokenExchange() {
    auth.requestAccessToken("auth-code", "session-state")
        .then((response) => {
            // Obtain the token and other related from the response;
            console.log(response);
        })
        .catch((error) => {
            console.error(error);
        });
}
