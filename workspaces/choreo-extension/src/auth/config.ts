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
import { GHAppConfig } from "@wso2-enterprise/choreo-client/lib/github";

export enum ChoreoSessionConfig {
    serviceName = "wso2.ballerina.choreo",
    accessToken = "access.token",
    displayName = "display.name",
    refreshToken = "refresh.token",
    loginTime = "login.time",
    tokenExpiration = "token.expiration.time"
}

export enum ChoreoFidp {
    google = "google",
    anonymous = "choreoanonymous"
}

export interface ChoreoAuthConfigParams {
    loginUrl: string;
    tokenUrl: string;
    redirectUrl: string;
    clientId: string;
    apimClientId: string;
    vscodeClientId: string;
    apimTokenUrl: string;
    userRegistrationUrl: string;
    scope: string;
    fidp: ChoreoFidp;
    ghApp: GHAppConfig,
    apis: {
        projectAPI: string;
        base: string;
    }
}

export const DEFAULT_CHOREO_AUTH_CONFIG: ChoreoAuthConfigParams = {
    loginUrl: "https://api.asgardeo.io/t/a/oauth2/authorize",
    tokenUrl: "https://api.asgardeo.io/t/a/oauth2/token",
    redirectUrl: "https://console.choreo.dev/vscode-auth",
    clientId: "aVKhTSUMu_QfEwmCtrcuWoLy92oa",

    apimClientId: "ciwnWuwZfbcdzBUcnkhKvi_mcBUa",
    vscodeClientId: "GWj5MzWNrOB28jX_wu5ZGu7I1VIa",
    apimTokenUrl: "https://sts.choreo.dev/oauth2/token",
    userRegistrationUrl: "https://app.choreo.dev/register-user",

    scope: "openid+email+profile",
    fidp: ChoreoFidp.google,
    ghApp: {
        appUrl: "https://github.com/marketplace/choreo-apps",
        installUrl: "https://github.com/apps/choreo-apps/installations/new",
        authUrl: "https://github.com/login/oauth/authorize",
        clientId: "Iv1.804167a242012c66",
        redirectUrl: "https://console.choreo.dev/ghapp"
    },
    apis: {
        projectAPI: "https://apis.choreo.dev/projects/1.0.0/graphql",
        base: "https://app.choreo.dev"
    }
};

export const CHOREO_AUTH_CONFIG_STAGE: ChoreoAuthConfigParams = {
    loginUrl: "https://stage.api.asgardeo.io/t/a/oauth2/authorize",
    tokenUrl: "https://stage.api.asgardeo.io/t/a/oauth2/token",
    redirectUrl: "https://console.st.choreo.dev/vscode-auth",
    clientId: "NoOBydRztff7iENCq0LM2uuRs2ca",

    apimClientId: "lxa0Z3jtHtNxE9fqev4HUryUTLUa",
    vscodeClientId: "GWj5MzWNrOB28jX_wu5ZGu7I1VIa",
    apimTokenUrl: "https://sts.st.choreo.dev:443/oauth2/token",
    userRegistrationUrl: "https://app.choreo.dev/register-user",

    scope: "openid+email+profile",
    fidp: ChoreoFidp.google,
    ghApp: {
        appUrl: "https://github.com/apps/choreo-apps-stage",
        installUrl: "https://github.com/apps/choreo-apps-stage/installations/new",
        authUrl: "https://github.com/login/oauth/authorize",
        clientId: "Iv1.20fd2645fc8a5aab",
        redirectUrl: "https://console.st.choreo.dev/ghapp"
    },
    apis: {
        projectAPI: "https://apis.st.choreo.dev/projects/1.0.0/graphql",
        base: "https://app.st.choreo.dev"
    }
};

export const CHOREO_AUTH_CONFIG_DEV: ChoreoAuthConfigParams = {
    loginUrl: "https://dev.api.asgardeo.io/t/a/oauth2/authorize",
    tokenUrl: "https://dev.api.asgardeo.io/t/a/oauth2/token",
    redirectUrl: "https://consolev2.preview-dv.choreo.dev/vscode-auth",
    clientId: "_eEveWFdTSJPaui7DmCuU5DUrUEa",

    apimClientId: "Wxqy0liCfLBsdpXOhkcxZz6uLPka",
    vscodeClientId: "GWj5MzWNrOB28jX_wu5ZGu7I1VIa",
    apimTokenUrl: "https://sts.preview-dv.choreo.dev:443/oauth2/token",
    userRegistrationUrl: "https://app.choreo.dev/register-user",

    scope: "openid+email+profile",
    fidp: ChoreoFidp.google,
    ghApp: {
        appUrl: "https://github.com/apps/choreo-apps-dev",
        installUrl: "https://github.com/apps/choreo-apps-dev/installations/new",
        authUrl: "https://github.com/login/oauth/authorize",
        clientId: "Iv1.f6cf2cd585148ee7",
        redirectUrl: "https://consolev2.preview-dv.choreo.dev/ghapp"
    },
    apis: {
        projectAPI: "https://apis.preview-dv.choreo.dev/projects/1.0.0/graphql",
        base: "https://app.preview-dv.choreo.dev"
    }
};

// Choreo V2 environment
export class ChoreoAuthConfig {
    constructor(private _config: ChoreoAuthConfigParams = DEFAULT_CHOREO_AUTH_CONFIG) {
    }

    public getApimClientId(): string {
        return this._config.apimClientId;
    }

    public getApimTokenUri(): string {
        return this._config.apimTokenUrl;
    }

    public getLoginUrl(): string {
        return this._config.loginUrl;
    }

    public getRedirectUri(): string {
        return this._config.redirectUrl;
    }

    public getClientId(): string {
        return this._config.clientId;
    }

    public getVscodeClientId(): string {
        return this._config.vscodeClientId;
    }

    public getTokenUri(): string {
        return this._config.tokenUrl;
    }

    public getScope(): string {
        return this._config.scope;
    }

    public getFidp(): ChoreoFidp {
        return this._config.fidp;
    }

    public setFidp(name: ChoreoFidp) {
        this._config.fidp = name;
    }

    public getUserRegistrationUrl(): string {
        return this._config.userRegistrationUrl;
    }

    public getProjectAPI(): string {
        return this._config.apis.projectAPI;
    }

    public getAPIBaseURL(): string {
        return this._config.apis.base;
    }

    public getGHAppConfig(): GHAppConfig {
        return this._config.ghApp;
    }
}
