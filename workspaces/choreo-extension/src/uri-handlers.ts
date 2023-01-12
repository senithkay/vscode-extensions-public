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

import { ProviderResult, Uri, window } from "vscode";
import { ext } from "./extensionVariables";

export function activateURIHandlers() {
    window.registerUriHandler({
        handleUri(uri: Uri): ProviderResult<void> {
            if (uri.path === '/choreo-signin') {
                const urlParams = new URLSearchParams(uri.query);
                const authCode = urlParams.get('code');
                if (authCode) {
                    ext.api.signIn(authCode);
                } else {
                    window.showErrorMessage(`Choreo Login Failed: Authorization code not found!`);
                }
            } else if (uri.path === '/ghapp') {
                const urlParams = new URLSearchParams(uri.query);
                const authCode = urlParams.get('code');
                const installationId = urlParams.get('installationId');
                console.log(`authCode: ${authCode}, installationId: ${installationId}`);
            }
        }
    });
}
