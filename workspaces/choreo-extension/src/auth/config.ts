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

// Choreo V2 environment
export class ChoreoAuthConfig {
    private loginUrl: string = "https://api.asgardeo.io/t/a/oauth2/authorize";
    private tokenUrl: string = "https://api.asgardeo.io/t/a/oauth2/token";
    private redirectUrl: string = "https://console.choreo.dev/vscode-auth";
    private clientId: string = "aVKhTSUMu_QfEwmCtrcuWoLy92oa";

    private apimClientId: string = "ciwnWuwZfbcdzBUcnkhKvi_mcBUa";
    private vscodeClientId: string = "GWj5MzWNrOB28jX_wu5ZGu7I1VIa";
    private apimTokenUrl: string = "https://sts.choreo.dev/oauth2/token";
    private userRegistrationUrl: string = "https://app.choreo.dev/register-user";

    private scope: string = "openid+email+profile";
    private fidp: ChoreoFidp = ChoreoFidp.google;

    constructor() {
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

    public getFidp(): ChoreoFidp {
        return this.fidp;
    }

    public setFidp(name: ChoreoFidp) {
        this.fidp = name;
    }

    public getUserRegistrationUrl(): string {
        return this.userRegistrationUrl;
    }
}
