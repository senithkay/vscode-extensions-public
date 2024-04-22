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

import { ProviderResult, Uri, commands, window } from "vscode";
import { ext } from "./extensionVariables";
import { getLogger } from "./logger/logger";
import { authStore } from "./stores/auth-store";

export function activateURIHandlers() {
    window.registerUriHandler({
        handleUri(uri: Uri): ProviderResult<void> {
            getLogger().debug(`Handling URI: ${uri.toString()}`);

            if (uri.path === "/signin") {
                getLogger().info("Choreo Login Callback hit");
                const urlParams = new URLSearchParams(uri.query);
                const authCode = urlParams.get("code");
                if (authCode) {
                    getLogger().debug("Initiating Choreo sign in flow from auth code");
                    // TODO: Check if status is equal to STATUS_LOGGING_IN, if not, show error message.
                    // It means that the login was initiated from somewhere else or an old page was opened/refreshed in the browser
                    try {
                        ext.clients.rpcClient.signInWithAuthCode(authCode).then(userInfo=>{
                            if(userInfo){
                                authStore.getState().loginSuccess(userInfo);
                            }
                        });                        
                        } catch (error: any) {
                        getLogger().error(`Choreo sign in Failed: ${error.message}`);
                        window.showErrorMessage(`Sign in failed. Please check the logs for more details.`);
                    }
                } else {
                    getLogger().error(`Choreo Login Failed: Authorization code not found!`);
                    window.showErrorMessage(`Choreo Login Failed: Authorization code not found!`);
                }
            } else if (uri.path === "/ghapp") {
                getLogger().info("Choreo Githup auth Callback hit");
                const urlParams = new URLSearchParams(uri.query);
                const authCode = urlParams.get("code");
                // const installationId = urlParams.get("installationId");
                const orgId = urlParams.get("orgId");
                if(authCode && orgId){
                    ext.clients.rpcClient.obtainGithubToken({code: authCode, orgId});
                }
            }
        },
    });
}
