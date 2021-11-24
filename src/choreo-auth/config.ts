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

// // Choreo V1 environment
// export enum ChoreoAuthConfig {
//     LoginUrl = "https://id.dv.choreo.dev/oauth2/authorize",
//     RedirectUrl = "http://localhost:9000/",
//     ClientId = "choreoportalapplication",
//     ServerOrigin = "https://app.dv.choreo.dev/",
//     TokenUrl = "https://app.dv.choreo.dev/auth/token",
//     Prompt = "login",
//     Scope = "openid name user",
//     GoogleFIdp = "google-choreo",
//     GitHubFIdp = "github-choreo",
//     AnonymousFIdp = "anonymous"
// }

// Choreo V2 environment
export enum ChoreoAuthConfig {
    LoginUrl = "https://id.dv.choreo.dev/oauth2/authorize",
    RedirectUrl = "http://localhost:3000/login",
    ClientId = "GEjPOPRsoMMlNrDuO8fqCBL4mS8a",
    ApimClientId = "Wxqy0liCfLBsdpXOhkcxZz6uLPka",
    VSCodeClientId = "XR0UxDfbpjXEyp0Z2C4GuKy7Bdga",
    ServerOrigin = "https://app.dv.choreo.dev/",
    TokenUrl = "https://id.dv.choreo.dev/oauth2/token",
    ApimTokenUrl = "https://apim.preview-dv.choreo.dev/oauth2/token",
    Prompt = "login",
    Scope = "openid",
    GoogleFIdp = "google-choreo",
    GitHubFIdp = "github-choreo",
    AnonymousFIdp = "anonymous"
}
