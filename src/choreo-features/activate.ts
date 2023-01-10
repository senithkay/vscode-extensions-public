/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { BallerinaExtension } from "src/core";
import { URLSearchParams } from "url";
import { window, Uri, ProviderResult, extensions } from "vscode";

export interface ChoreoAccessToken {
    accessToken?: string;
    refreshToken?: string;
    loginTime?: string;
    expirationTime?: number;
}

export interface IChoreoExtensionAPI {
    signIn(authCode: string): Promise<void>;
    waitForLogin(): Promise<boolean>;
}

export async function getChoreoExtAPI(): Promise<IChoreoExtensionAPI | undefined> {
    const choreoExt = extensions.getExtension("wso2.choreo");
    if (choreoExt) {
        if (!choreoExt.isActive) {
            return choreoExt.activate();
        } else {
            return choreoExt.exports;
        }
    }
}

export function activateChoreoFeatures(balExt: BallerinaExtension) {
    window.registerUriHandler({
        // TODO: Move handle auth code logic to Choreo Extension once Redirect URLs fixed from IDP
        handleUri(uri: Uri): ProviderResult<void> {
            if (uri.path === '/choreo-signin') {
                const urlParams = new URLSearchParams(uri.query);
                const authCode = urlParams.get('code');
                if (authCode) {
                    getChoreoExtAPI()
                        .then((api) => {
                            if (api) {
                                api.signIn(authCode);
                            } else {
                                window.showErrorMessage(`Choreo Login Failed: Choreo Extension not found!`);
                            }
                        }).catch(() => {
                            window.showErrorMessage(`Choreo Login Failed: Choreo Extension activation failed!`)
                        });
                } else {
                    window.showErrorMessage(`Choreo Login Failed: Authorization code not found!`);
                }
            }
        }
    });
}
