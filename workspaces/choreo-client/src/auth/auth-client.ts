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
import pkceChallenge from 'pkce-challenge';
import { URLSearchParams } from 'url';
import { Uri } from 'vscode';
import { getHttpClient } from '../http-client';
import { AccessToken, AuthClientConfig, IAuthClient } from './types';

const ACCESS_TOKEN_ERROR = "Error while exchanging the access token!";
const REFRESH_TOKEN_ERROR = "Error while exchanging the refresh token!";
const VSCODE_TOKEN_ERROR = "Error while exchanging the VSCode token!";

const ExchangeGrantType = 'urn:ietf:params:oauth:grant-type:token-exchange';
const JWTTokenType = 'urn:ietf:params:oauth:token-type:jwt';
const ApimScope = 'apim:api_manage apim:subscription_manage apim:tier_manage apim:admin apim:publisher_settings environments:view_prod environments:view_dev choreo:user_manage choreo:role_manage apim:dcr:app_manage choreo:deployment_manage choreo:non_prod_env_manage choreo:prod_env_manage choreo:component_manage choreo:project_manage apim:api_publish apim:document_manage apim:api_settings apim:subscription_view';

const RefreshTokenGrantType = 'refresh_token';
const AuthorizationCodeGrantType = 'authorization_code';

const scope = "openid+email+profile";

const CommonReqHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf8',
    'Accept': 'application/json'
};

export class ChoreoAuthClient implements IAuthClient {

    private _challenge = pkceChallenge();
    private _fidp: "google" | "github" | "microsoft" | "enterprise" = "google";

    constructor(private _config: AuthClientConfig) {}
    
    async exchangeAuthCode(authCode: string): Promise<AccessToken> {
        const params = new URLSearchParams({
            client_id: this._config.clientId,
            code: authCode,
            grant_type: AuthorizationCodeGrantType,
            redirect_uri: this._config.redirectUrl,
            code_verifier: this._challenge.code_verifier
        });
        try {
            const response = await getHttpClient()
                .post(this._config.tokenUrl, params.toString(), { headers: CommonReqHeaders });
            return {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                loginTime: new Date().toISOString(),
                expirationTime: response.data.expires_in
            };
        } catch (err) {
            throw new Error(ACCESS_TOKEN_ERROR, { cause: err });
        }
    }

    async exchangeVSCodeToken(apimAccessToken: string, orgHandle: string): Promise<AccessToken> {
        const params = new URLSearchParams({
            client_id: this._config.vscodeClientId,
            grant_type: ExchangeGrantType,
            subject_token_type: JWTTokenType,
            requested_token_type: JWTTokenType,
            scope: ApimScope,
            subject_token: apimAccessToken,
            orgHandle,
        });
        try {
            const response = await getHttpClient()
                .post(this._config.apimTokenUrl, params.toString(), { headers: CommonReqHeaders });
            return {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                loginTime: new Date().toISOString(),
                expirationTime: response.data.expires_in
            };
        } catch (err) {
            throw new Error(VSCODE_TOKEN_ERROR, { cause: err });
        }
    }

    async exchangeRefreshToken(refreshToken: string): Promise<AccessToken> {
        const params = new URLSearchParams({
            client_id: this._config.clientId,
            grant_type: RefreshTokenGrantType,
            refresh_token: refreshToken
        });
    
        try {
            const response = await getHttpClient()
                .post(this._config.tokenUrl, params.toString(), { headers: CommonReqHeaders });
            return {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                loginTime: new Date().toISOString(),
                expirationTime: response.data.expires_in
            };
        } catch (err) {
            throw new Error(REFRESH_TOKEN_ERROR, { cause: err });
        }
    }

    getAuthURL(callbackUri: Uri): string {
        const state = {
            origin: "vscode.choreo.ext",
            callbackUri: callbackUri.toString()
        };
        const stateBase64 = Buffer.from(JSON.stringify(state), 'binary').toString('base64');

        return `${this._config.loginUrl}?response_mode=query&prompt=login&response_type=code`
            + `&code_challenge_method=S256&code_challenge=${this._challenge.code_challenge}`
            + `&fidp=${this._fidp}&redirect_uri=${this._config.redirectUrl}&`
            + `client_id=${this._config.clientId}&scope=${scope}&state=${stateBase64}`;
    }
    
}
