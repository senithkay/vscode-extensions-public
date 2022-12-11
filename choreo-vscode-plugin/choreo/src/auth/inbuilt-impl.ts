/* eslint-disable @typescript-eslint/naming-convention */
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
 import * as vscode from 'vscode';
import axios from "axios";
import { deleteChoreoToken, getChoreoToken, storeChoreoToken } from "./storage";
import jwt_decode from "jwt-decode";
import { choreoAuthConfig } from "./activator";
import pkceChallenge from 'pkce-challenge';
import { URLSearchParams } from 'url';
import { ext } from '../extensionVariables';
import { getUserInfo } from '../api/user';
import jwtDecode from 'jwt-decode';

const challenge = pkceChallenge();

const AUTH_FAIL = "Choreo Login: ";
const AUTH_CODE_ERROR = "Error while retreiving the authentication code details!";
const ACCESS_TOKEN_ERROR = "Error while retreiving the access token details!";
const APIM_TOKEN_ERROR = "Error while retreiving the apim token details!";
const REFRESH_TOKEN_ERROR = "Error while retreiving the refresh token details!";
const VSCODE_TOKEN_ERROR = "Error while retreiving the VSCode token details!";
const SESSION_EXPIRED = "The session has expired, please login again!";

const ExchangeGrantType = 'urn:ietf:params:oauth:grant-type:token-exchange';
const JWTTokenType = 'urn:ietf:params:oauth:token-type:jwt';
const ApimScope = 'apim:api_manage apim:subscription_manage apim:tier_manage apim:admin apim:publisher_settings environments:view_prod environments:view_dev choreo:user_manage choreo:role_manage apim:dcr:app_manage choreo:deployment_manage choreo:dev_env_manage choreo:prod_env_manage choreo:component_manage choreo:project_manage apim:api_publish apim:document_manage apim:api_settings apim:subscription_view';
const RefreshTokenGrantType = 'refresh_token';

const CommonReqHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf8',
    'Accept': 'application/json'
};

export async function initiateInbuiltAuth() {
    const callbackUri = await vscode.env.asExternalUri(
        vscode.Uri.parse(getAuthURL())
    );
    return vscode.env.openExternal(callbackUri);
}

export const ChoreoToken = "choreo.token";
export const ChoreoApimToken = "choreo.apim.token";
export const ChoreoVscodeToken = "choreo.vscode.token";

export async function exchangeAuthToken(authCode: string) {
    if (!authCode) {
        vscode.window.showErrorMessage(AUTH_FAIL + AUTH_CODE_ERROR);
    } else {
        // To bypass the self signed server error.
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

        const params = new URLSearchParams({
            client_id: choreoAuthConfig.getClientId(),
            code: authCode,
            grant_type: 'authorization_code',
            redirect_uri: choreoAuthConfig.getRedirectUri(),
            code_verifier: challenge.code_verifier
        });

        await axios.post(
            choreoAuthConfig.getTokenUri(),
            params.toString(),
            {
                headers: CommonReqHeaders
            }
        ).then(async (response) => {
            if (response.data) {
                let token = response.data.access_token;
                await storeToken(ChoreoToken, response);
                const userInfo = await getUserInfo();
                await exchangeApimToken(token, userInfo.organizations[0].handle);
                await signIn(response.data.access_token);
            } else {
                vscode.window.showErrorMessage(AUTH_FAIL + ACCESS_TOKEN_ERROR);
            }
        }).catch((err) => {
            vscode.window.showErrorMessage(AUTH_FAIL + err);
        });
    }
}

export async function exchangeApimToken(token: string, orgHandle: string) {
    if (!token) {
        vscode.window.showErrorMessage(AUTH_FAIL + ACCESS_TOKEN_ERROR);
        return;
    }
    const params = new URLSearchParams({
        client_id: choreoAuthConfig.getApimClientId(),
        grant_type: ExchangeGrantType,
        subject_token_type: JWTTokenType,
        requested_token_type: JWTTokenType,
        scope: ApimScope,
        subject_token: token,
        orgHandle,
    });

    await axios.post(
        choreoAuthConfig.getApimTokenUri(),
        params.toString(),
        {
            headers: {
                ...CommonReqHeaders,
                'Authorization': "Bearer " + token
            }
        }
    ).then(async (response) => {
        if (response) {
            let apimToken = response.data.access_token;
            await storeToken(ChoreoApimToken, response);
            await exchangeVSCodeToken(apimToken);
        } else {
            vscode.window.showErrorMessage(AUTH_FAIL + APIM_TOKEN_ERROR);
        }
    }).catch((err) => {
        vscode.window.showErrorMessage(AUTH_FAIL + err);
    });
}

export async function exchangeVSCodeToken(apimToken: string) {
    if (!apimToken) {
        vscode.window.showErrorMessage(AUTH_FAIL + APIM_TOKEN_ERROR);
        return;
    }

    const params = new URLSearchParams({
        client_id: choreoAuthConfig.getVscodeClientId(),
        grant_type: ExchangeGrantType,
        subject_token_type: JWTTokenType,
        requested_token_type: JWTTokenType,
        scope: ApimScope,
        subject_token: apimToken
    });

    await axios.post(
        choreoAuthConfig.getApimTokenUri(),
        params.toString(),
        {
            headers: CommonReqHeaders,

        }
    ).then(async (response) => {
        if (response) {
            await storeToken(ChoreoVscodeToken, response);
            // Show the success message in vscode.
            vscode.window.showInformationMessage(`Successfully Logged into Choreo!`);
        } else {
            vscode.window.showErrorMessage(AUTH_FAIL + VSCODE_TOKEN_ERROR);
        }
    }).catch((err) => {
        vscode.window.showErrorMessage(AUTH_FAIL + err);
    });
}

export async function exchangeRefreshToken(refreshToken: string) {
    if (!refreshToken) {
        vscode.window.showErrorMessage(AUTH_FAIL + REFRESH_TOKEN_ERROR);
        signOut();
        return;
    }

    const params = new URLSearchParams({
        client_id: choreoAuthConfig.getVscodeClientId(),
        grant_type: RefreshTokenGrantType,
        refresh_token: refreshToken
    });

    await axios.post(
        choreoAuthConfig.getApimTokenUri(),
        params.toString(),
        {
            headers: CommonReqHeaders
        }
    ).then(async (response) => {
        if (response) {
           await storeToken(ChoreoVscodeToken, response);
        } else {
            vscode.window.showErrorMessage(AUTH_FAIL + VSCODE_TOKEN_ERROR);
            signOut();
        }
    }).catch((err) => {
        console.debug(err);

        if (!ext.isPluginStartup) {
            vscode.window.showErrorMessage(AUTH_FAIL + SESSION_EXPIRED);
        }
        signOut();
    });
}

export async function signIn(accessToken: string) {
    ext.api.onStatusChanged.fire('LoggedIn');
    ext.api.userName = await getUserName(accessToken);
}

export async function getUserName(accessToken: string) {
    const decoded: any = jwtDecode(accessToken);
    return decoded["name"];
}

export async function signOut() {
    await deleteChoreoToken(ChoreoToken);
    await deleteChoreoToken(ChoreoApimToken);
    await deleteChoreoToken(ChoreoVscodeToken);
    ext.api.onStatusChanged.fire('LoggedOut');
    ext.api.userName = undefined;
}

function getAuthURL(): string {
    return `${choreoAuthConfig.getLoginUrl()}?response_mode=query&prompt=login&response_type=code`
        + `&code_challenge_method=S256&code_challenge=${challenge.code_challenge}`
        + `&fidp=${choreoAuthConfig.getFidp()}&redirect_uri=${choreoAuthConfig.getRedirectUri()}&`
        + `client_id=${choreoAuthConfig.getClientId()}&scope=${choreoAuthConfig.getScope()}`;
}


async function storeToken(tokenId: string, tokenResp: any) {
    let accessToken = tokenResp.data.access_token;
    let refreshToken = tokenResp.data.refresh_token;
    let loginTime = new Date();
    let expirationTime = tokenResp.data.expires_in;
    await storeChoreoToken(String(tokenId), String(accessToken),
        String(refreshToken), String(loginTime), String(expirationTime));
}