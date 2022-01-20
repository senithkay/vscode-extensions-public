import { debug } from "../utils";

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
export enum ChoreoSessionConfig {
    ServiceName = "wso2.ballerina.choreo",
    AccessToken = "access.token",
    DisplayName = "display.name",
    RefreshToken = "refresh.token",
    LoginTime = "login.time"
}

// Choreo V2 environment
export class ChoreoAuthConfig {
    private loginUrl: string = "https://api.asgardeo.io/t/a/oauth2/authorize";
    private tokenUrl: string = "https://api.asgardeo.io/t/a/oauth2/token";
    private redirectUrl: string = "https://console.choreo.dev/vscode-auth";
    private clientId: string = "aVKhTSUMu_QfEwmCtrcuWoLy92oa";

    private apimClientId: string = process.env.VSCODE_CHOREO_APIM_CLIENT_ID ? process.env.VSCODE_CHOREO_APIM_CLIENT_ID
        : "ciwnWuwZfbcdzBUcnkhKvi_mcBUa";
    private vscodeClientId: string = "GWj5MzWNrOB28jX_wu5ZGu7I1VIa";
    private apimTokenUrl: string = process.env.VSCODE_CHOREO_APIM_TOKEN_ENDPOINT ?
        process.env.VSCODE_CHOREO_APIM_TOKEN_ENDPOINT : "https://sts.choreo.dev/oauth2/token";

    private scope: string = "openid+email+profile";
    private googleFIdp: string = "google";

    constructor() {
        debug(`VSCODE_CHOREO_APIM_CLIENT_ID: ${process.env.VSCODE_CHOREO_APIM_CLIENT_ID} \napimClientId: ${this.apimClientId}`);
        debug(`VSCODE_CHOREO_APIM_TOKEN_ENDPOINT: ${process.env.VSCODE_CHOREO_APIM_TOKEN_ENDPOINT} \napimTokenUrl: ${this.apimTokenUrl}`);
    }

    public getApimClientId(): string {
        return this.apimClientId;
    }

    public getApimTokenUri(): string {
        return this.apimTokenUrl;
    }

    public getLoginUrl(): string {
        return this.loginUrl;
    }

    public getRedirectUri(): string {
        return this.redirectUrl;
    }

    public getClientId(): string {
        return this.clientId;
    }

    public getVscodeClientId(): string {
        return this.vscodeClientId;
    }

    public getTokenUri(): string {
        return this.tokenUrl;
    }

    public getScope(): string {
        return this.scope;
    }

    public getGoogleFIdp(): string {
        return this.googleFIdp;
    }
}
