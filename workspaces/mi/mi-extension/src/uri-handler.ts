/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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
 */
import { URLSearchParams } from "url";
import { window, Uri, ProviderResult, commands } from "vscode";
import { exchangeAuthCode } from "./ai-panel/auth";
import { COMMANDS } from "./constants";
import { checkForDevantExt } from "./extension";
import { IOpenCompSrcCmdParams, CommandIds as PlatformExtCommandIds } from "@wso2/wso2-platform-core";

export function activateUriHandlers() {
    window.registerUriHandler({
        handleUri(uri: Uri): ProviderResult<void> {
            const urlParams = new URLSearchParams(uri.query);
            switch (uri.path) {
                case '/signin':
                    console.log("Signin callback hit");
                    const query = new URLSearchParams(uri.query);
                    const code = query.get('code');
                    console.log("Code: " + code);
                    if (code) {
                        exchangeAuthCode(code);
                    } else {
                        window.showErrorMessage('Auth code not found');
                    }
                    break;
                case '/open':
                    if(!checkForDevantExt()) {
                        return;
                    }
                    const org = urlParams.get("org");
                    const project = urlParams.get("project");
                    const component = urlParams.get("component");
                    const technology = urlParams.get("technology");
                    const integrationType = urlParams.get("integrationType");
                    const integrationDisplayType = urlParams.get("integrationDisplayType");
                    window.showInformationMessage('Opening component');
                    if (org && project && component && technology && integrationType) {
                        commands.executeCommand(PlatformExtCommandIds.OpenCompSrcDir, {
                            org, project, component, technology, integrationType, integrationDisplayType, extName: "Devant"
                        } as IOpenCompSrcCmdParams);
                    } else {
                        window.showErrorMessage('Invalid component URL parameters');
                    }
                    break;

            }
        }
    });
}
