/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as keytar from 'keytar';
import axios from 'axios';
import { StateMachineAI } from './aiMachine';
import { AI_EVENT_TYPE } from '@wso2-enterprise/mi-core';

export interface AccessToken {
    accessToken : string;
    expirationTime? : number;
    loginTime : string;
    refreshToken? : string;
}

const CommonReqHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf8',
    'Accept': 'application/json'
};

export async function getAuthUrl(callbackUri: string): Promise<string> {
    // const state = {
    //     origin: "vscode.choreo.ext",
    //     callbackUri: callbackUri
    // };
    // const stateBase64 = Buffer.from(JSON.stringify(state), 'binary').toString('base64');

    // return `${this._config.loginUrl}?profile=vs-code&client_id=${this._config.clientId}`
    //     + `&state=${stateBase64}&code_challenge=${this._challenge.code_challenge}`;

    return "https://api.asgardeo.io/t/wso2mi/oauth2/authorize?response_type=code&redirect_uri=vscode%3A%2F%2Fwso2.micro-integrator%2Fsignin&client_id=yo29V9jLN83xmVCNvlRQ_QGfvcka&scope=openid";
}

export async function exchangeAuthCodeNew(authCode: string): Promise<AccessToken> {
    const params = new URLSearchParams({
        client_id: 'yo29V9jLN83xmVCNvlRQ_QGfvcka',
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: 'vscode://wso2.micro-integrator/signin',
        scope: 'openid'
    });
    try {
        const response = await axios.post('https://api.asgardeo.io/t/wso2mi/oauth2/token', params.toString(), { headers: CommonReqHeaders });
        return {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            loginTime: new Date().toISOString(),
            expirationTime: response.data.expires_in
        };
    } catch (err) {
        throw new Error(`Error while exchanging auth code to token: ${err}`);
    }
}


export async function exchangeAuthCode(authCode: string) {
        if (!authCode) {
            throw new Error("Auth code is not provided.");
        } else {
            try {
                var currentTime = Date.now();
                console.log("Exchanging auth code to token...");
                const response = await exchangeAuthCodeNew(authCode);
                console.log("Access token: " + response.accessToken);
                console.log("Refresh token: " + response.refreshToken);
                console.log("Login time: " + response.loginTime);
                console.log("Expiration time: " + response.expirationTime);
                await keytar.setPassword('MI-AI', 'MIAIUser', response.accessToken);
                StateMachineAI.sendEvent(AI_EVENT_TYPE.SIGNINSUCCESS);
            } catch (error: any) {
                const errMsg = "Error while signing in to Choreo! " + error?.message;
                // getLogger().error(errMsg);
                // if (error?.cause) {
                //     getLogger().debug("Cause message: " + JSON.stringify(error.cause?.message));
                // }
                throw new Error(errMsg);
            }
        }
}