/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { URLSearchParams } from "url";
import { window, Uri, ProviderResult } from "vscode";
import { BallerinaExtension } from "./core";
import { getChoreoExtAPI } from "./choreo-features/activate";
import { handleOpenFile } from "./utils";

export function activateUriHandlers(ballerinaExtInstance: BallerinaExtension) {
    window.registerUriHandler({
        handleUri(uri: Uri): ProviderResult<void> {
            const urlParams = new URLSearchParams(uri.query);
            switch (uri.path) {
                case '/choreo-signin':
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
                                window.showErrorMessage(`Choreo Login Failed: Choreo Extension activation failed!`);
                            });
                    } else {
                        window.showErrorMessage(`Choreo Login Failed: Authorization code not found!`);
                    }
                    break;
                case '/open-file':
                    const gistId = urlParams.get('gist');
                    const fileName = urlParams.get('file');
                    if (gistId && fileName) {
                        handleOpenFile(ballerinaExtInstance, gistId, fileName);
                    } else {
                        window.showErrorMessage(`Gist ID or the file name not found!`);
                    }
                    break;
            }
        }
    });
}
