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
import { githubAppClient } from "./auth/auth";
import { ext } from "./extensionVariables";
import { getLogger } from "./logger/logger";
import { STATUS_LOGGED_IN, choreoProjectOverview, choreoProjectOverviewCloseCmdId, choreoSignInCmdId, choreoSignOutCmdId, refreshProjectsTreeViewCmdId } from "./constants";
import { executeWithTaskRetryPrompt } from "./retry";
import { setSelectedOrgCmdId } from "./constants";

const NOT_AUTHORIZED_MESSAGE = "You are not authorized to access this project";

export function activateURIHandlers() {
    window.registerUriHandler({
        handleUri(uri: Uri): ProviderResult<void> {
            getLogger().debug(`Handling URI: ${uri.toString()}`);

            if (uri.path === "/signin") {
                getLogger().info("Choreo Login Callback hit");
                const urlParams = new URLSearchParams(uri.query);
                const authCode = urlParams.get("code");
                if (authCode) {
                    getLogger().debug("Initiating Choreo token exchange");
                    ext.api.signIn(authCode);
                } else {
                    getLogger().error(`Choreo Login Failed: Authorization code not found!`);
                    window.showErrorMessage(`Choreo Login Failed: Authorization code not found!`);
                }
            } else if (uri.path === "/ghapp") {
                getLogger().info("Choreo Githup auth Callback hit");
                const urlParams = new URLSearchParams(uri.query);
                const authCode = urlParams.get("code");
                const installationId = urlParams.get("installationId");
                if (authCode) {
                    getLogger().debug(`Github exchanging code for token`);
                    executeWithTaskRetryPrompt(() => githubAppClient.obatainAccessToken(authCode)).catch((err) => {
                        getLogger().error(`Github App Auth Failed: ${err.message}` + (err?.cause ? "\nCause: " + err.cause.message : ""));
                        window.showErrorMessage(`Choreo Github Auth Failed: ${err.message}`);
                    });
                } else if (installationId) {
                    getLogger().debug(`Github App installation id: ${installationId}`);
                    githubAppClient.fireGHAppAuthCallback({
                        status: "installed",
                        installationId,
                    });
                } else {
                    githubAppClient.fireGHAppAuthCallback({
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
                    if (userOrg && ext.api.selectedOrg?.id.toString() === orgId) {
                        switchToProjectOverview(projectId, +orgId);
                    } else if (userOrg) {
                        //show a prompt to switch to the org
                        window.showInformationMessage("Do you wish to switch the active organization? The project you are attempting to open belongs to a different organization.", "Switch", "Cancel").then(async (selection) => {
                            if (selection === "Switch") {
                                await commands.executeCommand(choreoProjectOverviewCloseCmdId); // close any open project overview
                                await commands.executeCommand(setSelectedOrgCmdId, undefined, userOrg);
                                switchToProjectOverview(projectId, +orgId);
                            } 
                        });
                    } else {
                        // This Org is not available for the user. Ask the user if they want to sign in with a different account
                        window.showInformationMessage("The project you are attempting to open belongs to a different organization. Do you wish to sign in with a different account?", "Sign In", "Cancel").then(async (selection) => {
                            if (selection === "Sign In") {
                                await commands.executeCommand(choreoProjectOverviewCloseCmdId); // close any open project overview
                                await commands.executeCommand(choreoSignOutCmdId);
                                commands.executeCommand(choreoSignInCmdId).then(async () => {
                                    const userOrg = ext.api.userInfo?.organizations?.find((org) => org.id.toString() === orgId);
                                    if (userOrg) {
                                        await commands.executeCommand(setSelectedOrgCmdId, undefined, userOrg);
                                        switchToProjectOverview(projectId, +orgId);
                                    } else {
                                        window.showErrorMessage(NOT_AUTHORIZED_MESSAGE);
                                    }
                                });
                            }
                        });
                    }
                } else {
                    // else open the login page
                    commands.executeCommand(choreoSignInCmdId).then(async () => {
                        const userOrg = ext.api.userInfo?.organizations?.find((org) => org.id.toString() === orgId);
                        switchToProjectOverview(projectId, +orgId);
                        if (userOrg) {
                            await commands.executeCommand(setSelectedOrgCmdId, undefined, userOrg);
                            switchToProjectOverview(projectId, +orgId);
                        } else {
                            window.showErrorMessage(NOT_AUTHORIZED_MESSAGE);
                        }
                    });
                }
            }
        },
    });
}

async function switchToProjectOverview(projectId: string, orgId: number) {
    const logged = await ext.api.waitForLogin();
    if (logged) {
        const project = await ext.api.getProject(projectId, orgId);
        if (project) {
            commands.executeCommand(choreoProjectOverview, project);
            commands.executeCommand(refreshProjectsTreeViewCmdId);
        }
    }
}
