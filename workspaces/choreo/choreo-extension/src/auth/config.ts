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

export const FREE_COMPONENT_LIMIT = 5;

export interface IChoreoEnvConfig {
    loginUrl: string;
    tokenUrl: string;
    redirectUrl: string;
    signUpUrl: string;
    clientId: string;
    apimClientId: string;
    vscodeClientId: string;
    apimTokenUrl: string;
    userRegistrationUrl: string;
    scope: string;
    fidp: ChoreoFidp;
    ghApp: GHAppConfig,
    apis: {
        orgsAPI: string;
        projectAPI: string;
        componentManageAPI: string;
        userMgtAPI: string;
        declarativeAPI: string;
        devopsAPI: string;
    },
    apimEnvScopes: string;
    choreoConsoleBaseUrl: string;
    billingConsoleBaseUrl: string;
}

export const DEFAULT_CHOREO_ENV_CONFIG: IChoreoEnvConfig = {
    loginUrl: "https://console.choreo.dev/login",
    tokenUrl: "https://api.asgardeo.io/t/a/oauth2/token",
    redirectUrl: "https://console.choreo.dev/vscode-auth",
    signUpUrl: "https://console.choreo.dev/signup",
    clientId: "aVKhTSUMu_QfEwmCtrcuWoLy92oa",

    apimClientId: "ciwnWuwZfbcdzBUcnkhKvi_mcBUa",
    vscodeClientId: "GWj5MzWNrOB28jX_wu5ZGu7I1VIa",
    apimTokenUrl: "https://sts.choreo.dev/oauth2/token",
    userRegistrationUrl: "https://app.choreo.dev/register-user",

    scope: "openid+email+profile",
    apimEnvScopes: 'urn:choreosystem:componentsmanagement:component_create',
    fidp: ChoreoFidp.google,
    ghApp: {
        appUrl: "https://github.com/marketplace/choreo-dev",
        installUrl: "https://github.com/apps/choreo-dev/installations/new",
        authUrl: "https://github.com/login/oauth/authorize",
        clientId: "Iv1.804167a242012c66",
        redirectUrl: "https://console.choreo.dev/ghapp"
    },
    apis: {
        orgsAPI: "https://apis.choreo.dev/orgs/1.0.0/orgs",
        projectAPI: "https://apis.choreo.dev/projects/1.0.0/graphql",
        componentManageAPI: "https://apis.choreo.dev/component-mgt/1.0.0/orgs",
        userMgtAPI: "https://apis.choreo.dev/user-mgt/1.0.0",
        declarativeAPI: "https://apis.choreo.dev/declarative-api/v1.0",
        devopsAPI: "https://apis.choreo.dev/devops/1.0.0"
    },
    
    choreoConsoleBaseUrl: "https://console.choreo.dev",
    billingConsoleBaseUrl: "https://subscriptions.wso2.com"
};

export const CHOREO_ENV_CONFIG_STAGE: IChoreoEnvConfig = {
    loginUrl: "https://console.st.choreo.dev/login",
    tokenUrl: "https://stage.api.asgardeo.io/t/a/oauth2/token",
    redirectUrl: "https://console.st.choreo.dev/vscode-auth",
    signUpUrl: "https://console.st.choreo.dev/signup",
    clientId: "NoOBydRztff7iENCq0LM2uuRs2ca",

    apimClientId: "lxa0Z3jtHtNxE9fqev4HUryUTLUa",
    vscodeClientId: "Wr5EP0IljfVyydMflZcbCtgqifUa",
    apimTokenUrl: "https://sts.st.choreo.dev:443/oauth2/token",
    userRegistrationUrl: "https://app.choreo.dev/register-user",

    scope: "openid+email+profile",
    apimEnvScopes: 'urn:choreosystem:componentsmanagement:component_create',
    fidp: ChoreoFidp.google,
    ghApp: {
        appUrl: "https://github.com/apps/choreo-apps-stage",
        installUrl: "https://github.com/apps/choreo-apps-stage/installations/new",
        authUrl: "https://github.com/login/oauth/authorize",
        clientId: "Iv1.20fd2645fc8a5aab",
        redirectUrl: "https://console.st.choreo.dev/ghapp"
    },
    apis: {
        orgsAPI: "https://apis.st.choreo.dev/orgs/1.0.0/orgs",
        projectAPI: "https://apis.st.choreo.dev/projects/1.0.0/graphql",
        componentManageAPI: "https://apis.st.choreo.dev/component-mgt/1.0.0/orgs",
        userMgtAPI: "https://apis.st.choreo.dev/user-mgt/1.0.0",
        declarativeAPI: "https://apis.st.choreo.dev/declarative-api/v1.0",
        devopsAPI: "https://apis.st.choreo.dev/user-mgt/devops/1.0.0"
    },

    choreoConsoleBaseUrl: "https://console.st.choreo.dev",
    billingConsoleBaseUrl: "https://subscriptions.st.wso2.com"
};

export const CHOREO_ENV_CONFIG_DEV: IChoreoEnvConfig = {
    loginUrl: "https://consolev2.preview-dv.choreo.dev/login",
    tokenUrl: "https://dev.api.asgardeo.io/t/a/oauth2/token",
    redirectUrl: "https://consolev2.preview-dv.choreo.dev/vscode-auth",
    signUpUrl: "https://consolev2.preview-dv.choreo.dev/signup",
    clientId: "_eEveWFdTSJPaui7DmCuU5DUrUEa",

    apimClientId: "Wxqy0liCfLBsdpXOhkcxZz6uLPka",
    vscodeClientId: "XR0UxDfbpjXEyp0Z2C4GuKy7Bdga",
    apimTokenUrl: "https://sts.preview-dv.choreo.dev:443/oauth2/token",
    userRegistrationUrl: "https://app.choreo.dev/register-user",

    scope: "openid+email+profile",
    apimEnvScopes: 'urn:choreocontrolplane:componentsmanagement:component_create',

    fidp: ChoreoFidp.google,
    ghApp: {
        appUrl: "https://github.com/apps/choreo-apps-dev",
        installUrl: "https://github.com/apps/choreo-apps-dev/installations/new",
        authUrl: "https://github.com/login/oauth/authorize",
        clientId: "Iv1.f6cf2cd585148ee7",
        redirectUrl: "https://consolev2.preview-dv.choreo.dev/ghapp"
    },
    apis: {
        orgsAPI: "https://apis.preview-dv.choreo.dev/orgs/1.0.0/orgs",
        projectAPI: "https://apis.preview-dv.choreo.dev/projects/1.0.0/graphql",
        componentManageAPI: "https://apis.preview-dv.choreo.dev/component-mgt/1.0.0/orgs",
        userMgtAPI: "https://apis.preview-dv.choreo.dev/user-mgt/1.0.0",
        declarativeAPI: "https://apis.preview-dv.choreo.dev/declarative-api/v1.0",
        devopsAPI: "https://apis.preview-dv.choreo.dev/devops/1.0.0"
    },

    choreoConsoleBaseUrl: "https://consolev2.preview-dv.choreo.dev",
    billingConsoleBaseUrl: "https://subscriptions.dv.wso2.com"
};

// Choreo V2 environment
export class ChoreoEnvConfig {
    constructor(private _config: IChoreoEnvConfig = DEFAULT_CHOREO_ENV_CONFIG) {
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

    public getSignUpUri(): string {
        return this._config.signUpUrl;
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

    public getOrgsAPI(): string {
        return this._config.apis.orgsAPI;
    }

    public getGHAppConfig(): GHAppConfig {
        return this._config.ghApp;
    }

    public getConsoleUrl(): string {
        return this._config.choreoConsoleBaseUrl;
    }

    public getBillingUrl(): string {
        return this._config.billingConsoleBaseUrl;
    }

    public getComponentManagementUrl(): string {
        return this._config.apis.componentManageAPI;
    }

    public getUserManagementUrl(): string {
        return this._config.apis.userMgtAPI;
    }

    public getDeclarativeUrl(): string {
        return this._config.apis.declarativeAPI;
    }

    public getApimEnvScopes(): string {
        return this._config.apimEnvScopes;
    }

    public getDevopsUrl(): string {
        return this._config.apis.devopsAPI;
    }
}
