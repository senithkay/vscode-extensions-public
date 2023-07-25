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
import { executeWithTaskRetryPrompt } from "./retry";
import { STATUS_LOGGED_IN, choreoSignInCmdId, choreoSignOutCmdId } from "./constants";
import { openProjectInVSCode } from "./cmds/open-project";

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
                        ext.api.signInWithAuthCode(authCode);
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
                const installationId = urlParams.get("installationId");
                const choreoIstOrgId = ext.api.getChoreoInstallOrg();
                const orgId = choreoIstOrgId ?? ext.api.getOrgIdOfCurrentProject();
                if (!orgId) {
                    // TODO!IMPORTANT: Handle project creation when no project is open
                    getLogger().error(`Choreo Github Auth Failed: No Choreo org id found`);
                    window.showErrorMessage(`Choreo Github Auth Failed: No org id found`);
                    return;
                }
                if (authCode) {
                    getLogger().debug(`Github exchanging code for token`);
                    executeWithTaskRetryPrompt(() => ext.clients.githubAppClient.obatainAccessToken(authCode, orgId)).catch((err) => {
                        getLogger().error(`Github App Auth Failed: ${err.message}` + (err?.cause ? "\nCause: " + err.cause.message : ""));
                        window.showErrorMessage(`Choreo Github Auth Failed: ${err.message}`);
                    });
                } else if (installationId) {
                    getLogger().debug(`Github App installation id: ${installationId}`);
                    ext.clients.githubAppClient.fireGHAppAuthCallback({
                        status: "installed",
                        installationId,
                    });
                } else {
                    ext.clients.githubAppClient.fireGHAppAuthCallback({
                        status: "error",
                    });
                    window.showErrorMessage(`Choreo Github Auth Failed`);
                }
            } else if (uri.path === "/overview") {
                getLogger().info("Choreo Project Overview callback hit");
                const urlParams = new URLSearchParams(uri.query);
                const projectId = urlParams.get("projectId");
                const orgId = urlParams.get("orgId");
                commands.executeCommand("workbench.view.extension.wso2-choreo");
                if (!projectId || !orgId) {
                    return;
                }
                // if user logged then open the project overview
                if (ext.api.status === STATUS_LOGGED_IN) {
                    const userOrg = ext.api.userInfo?.organizations?.find((org) => org.id.toString() === orgId);
                    if (userOrg) {
                        openProjectInVSCode(projectId, userOrg);
                    } else {
                        // This Org is not available for the user. Ask the user if they want to sign in with a different account
                        window.showInformationMessage("The project you are attempting to open belongs to a different organization. Do you wish to sign in with a different account?", "Sign In", "Cancel").then(async (selection) => {
                            if (selection === "Sign In") {
                                await commands.executeCommand(choreoSignOutCmdId);
                                commands.executeCommand(choreoSignInCmdId).then(async () => {
                                    const userOrg = ext.api.userInfo?.organizations?.find((org) => org.id.toString() === orgId);
                                    if (userOrg) {
                                        openProjectInVSCode(projectId, userOrg);
                                    } else {
                                        window.showErrorMessage("You are not authorized to view this project");
                                    }
                                });
                            }
                        });
                    }
                } else {
                    // else open the login page
                    commands.executeCommand(choreoSignInCmdId).then(async () => {
                        const userOrg = ext.api.userInfo?.organizations?.find((org) => org.id.toString() === orgId);
                        if (userOrg) {
                            openProjectInVSCode(projectId, userOrg);
                        } else {
                            window.showErrorMessage("You are not authorized to view this project");
                        }
                    });
                }
            }
        },
    });
}
