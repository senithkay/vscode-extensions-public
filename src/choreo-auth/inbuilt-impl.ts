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
import axios from "axios";
import { BallerinaExtension } from "../core";
import { OAuthListener } from "./auth-listener";
import { ChoreoAuthConfig } from "./config";
import { getChoreoKeytarSession, setChoreoKeytarSession } from "./auth-session";
import jwt_decode from "jwt-decode";

const url = require('url');

const AUTH_FAIL = "Choreo Login: ";
const AuthCodeError = "Error while retreiving the authentication code details!";
const AccessTokenError = "Error while retreiving the access token details!";
const ApimTokenError = "Error while retreiving the apim token details!";
const RefreshTokenError = "Error while retreiving the refresh token details!";
const VSCodeTokenError = "Error while retreiving the VSCode token details!";
const SessionExpired = "The session has expired, please login again!";

export async function initiateInbuiltAuth(extension: BallerinaExtension) {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(getAuthURL()));
    await new OAuthListener(9000, extension).StartProcess();
}

export class OAuthTokenHandler {
    public extension: BallerinaExtension;
    status: boolean = false;
    displayName: string = "Choreo User";

    constructor(extension: BallerinaExtension) {
        this.extension = extension;
    }

    public async exchangeAuthToken(authCode: string): Promise<boolean> {
        if (!authCode) {
            vscode.window.showErrorMessage(AUTH_FAIL + AuthCodeError);
        } else {
            // To bypass the self signed server error.
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

            const params = new url.URLSearchParams({
                client_id: ChoreoAuthConfig.ClientId,
                code: authCode,
                grant_type: 'authorization_code',
                redirect_uri: ChoreoAuthConfig.RedirectUrl,
                // TODO: Use a PKCE generator here for the code_verifier.
                code_verifier: '9H9Pfgaz4fVujpJqTRk4zPc-Hw4T9aWJKteIHdlXZj0'
            });

            await axios.post(
                ChoreoAuthConfig.TokenUrl,
                params.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=utf8',
                        'Accept': 'application/json'
                    }
                }
            ).then(async (response) => {
                if (response.data) {
                    let token = response.data.access_token;
                    let decoded: JSON = jwt_decode(token);
                    let userName: string = decoded["name"];
                    if (userName) {
                        this.displayName = userName;
                    }

                    await this.exchangeApimToken(token);
                } else {
                    vscode.window.showErrorMessage(AUTH_FAIL + AccessTokenError);
                }
            }).catch((err) => {
                vscode.window.showErrorMessage(AUTH_FAIL + err);
            });
        }
        return this.status;
    }

    public async exchangeApimToken(token: string) {
        if (!token) {
            vscode.window.showErrorMessage(AUTH_FAIL + AccessTokenError);
            return;
        }

        const params = new url.URLSearchParams({
            client_id: ChoreoAuthConfig.ApimClientId,
            grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
            subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
            requested_token_type: 'urn:ietf:params:oauth:token-type:jwt',
            scope: 'apim:api_manage apim:subscription_manage apim:tier_manage apim:admin',
            subject_token: token
        });

        await axios.post(
            ChoreoAuthConfig.ApimTokenUrl,
            params.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf8',
                    'Accept': 'application/json',
                    'Authorization': "Bearer " + token
                }
            }
        ).then(async (response) => {
            if (response) {
                let apimToken = response.data.access_token;
                await this.exchangeVSCodeToken(apimToken);
            } else {
                vscode.window.showErrorMessage(AUTH_FAIL + ApimTokenError);
            }
        }).catch((err) => {
            vscode.window.showErrorMessage(AUTH_FAIL + err);
        });
    }

    public async exchangeVSCodeToken(apimToken: string) {
        if (!apimToken) {
            vscode.window.showErrorMessage(AUTH_FAIL + ApimTokenError);
            return;
        }

        const params = new url.URLSearchParams({
            client_id: ChoreoAuthConfig.VSCodeClientId,
            grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
            subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
            requested_token_type: 'urn:ietf:params:oauth:token-type:jwt',
            scope: 'apim:api_manage apim:subscription_manage apim:tier_manage apim:admin',
            subject_token: apimToken
        });

        await axios.post(
            ChoreoAuthConfig.ApimTokenUrl,
            params.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf8'
                }
            }
        ).then(async (response) => {
            if (response) {
                let vscodeToken = response.data.access_token;
                let refreshToken = response.data.refresh_token;
                let loginTime = new Date();
                await setChoreoKeytarSession(String(vscodeToken), String(this.displayName),
                    String(refreshToken), String(loginTime));

                await getChoreoKeytarSession().then((result) => {
                    this.extension.setChoreoSession(result);
                    if (result.loginStatus) {
                        this.status = true;
                        console.debug("Choreo User: " + result.choreoUser);
                        console.debug("Choreo VSCode Token: " + result.choreoAccessToken);
                        // Show the success message in vscode.
                        vscode.window.showInformationMessage(`Successfully Logged into Choreo!`);
                        this.extension.getChoreoSessionTreeProvider()?.refresh();
                    } else {
                        vscode.window.showErrorMessage(AUTH_FAIL + VSCodeTokenError);
                    }
                });
            } else {
                vscode.window.showErrorMessage(AUTH_FAIL + VSCodeTokenError);
            }
        }).catch((err) => {
            vscode.window.showErrorMessage(AUTH_FAIL + err);
        });
    }

    public async exchangeRefreshToken(refreshToken: string) {
        if (!refreshToken) {
            vscode.window.showErrorMessage(AUTH_FAIL + RefreshTokenError);
            return;
        }

        const params = new url.URLSearchParams({
            client_id: ChoreoAuthConfig.VSCodeClientId,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        });

        await axios.post(
            ChoreoAuthConfig.ApimTokenUrl,
            params.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        ).then(async (response) => {
            if (response) {
                let accessToken = response.data.access_token;
                let newRefreshToken = response.data.refresh_token;
                let loginTime = new Date();
                await setChoreoKeytarSession(String(accessToken), String(this.displayName),
                    String(newRefreshToken), String(loginTime));

                await getChoreoKeytarSession().then((result) => {
                    this.extension.setChoreoSession(result);
                    if (result.loginStatus) {
                        this.status = true;
                        console.debug("Choreo User: " + result.choreoUser);
                        console.debug("Choreo Refreshed Token: " + result.choreoAccessToken);
                        // Show the success message in vscode.
                        vscode.window.showInformationMessage(`Successfully Logged into Choreo!`);
                        this.extension.getChoreoSessionTreeProvider()?.refresh();
                    } else {
                        vscode.window.showErrorMessage(AUTH_FAIL + VSCodeTokenError);
                        this.signOut();
                    }
                });
            } else {
                vscode.window.showErrorMessage(AUTH_FAIL + VSCodeTokenError);
                this.signOut();
            }
        }).catch((err) => {
            console.debug(err);
            vscode.window.showErrorMessage(AUTH_FAIL + SessionExpired);
            this.signOut();
        });
    }

    signOut() {
        this.extension.setChoreoSession({
            loginStatus: false
        });
        this.extension.getChoreoSessionTreeProvider()?.refresh();
    }
}

function getAuthURL(): string {
    // TODO: Use a PKCE generator here for the code_challenge.
    return `${ChoreoAuthConfig.LoginUrl}?response_mode=query&prompt=login&response_type=code`
        + `&code_challenge_method=S256&code_challenge=73a9Bme8uDFD1aJ1uJSpQ4i-srQvjGyLsZn5g5EKrgI`
        + `&fidp=${ChoreoAuthConfig.GoogleFIdp}&redirect_uri=${ChoreoAuthConfig.RedirectUrl}&`
        + `client_id=${ChoreoAuthConfig.ClientId}&scope=${ChoreoAuthConfig.Scope}`;
}
