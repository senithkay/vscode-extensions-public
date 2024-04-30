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

import * as vscode from "vscode";
import { window, workspace, ConfigurationChangeEvent, commands, Uri } from "vscode";
import { ChoreoExtensionApi } from "./ChoreoExtensionApi";
import { ext } from "./extensionVariables";
import { GitExtension } from "./git";
import { activateURIHandlers } from "./uri-handlers";
import { getLogger, initLogger } from "./logger/logger";
import { activateTelemetry } from "./telemetry/telemetry";
import { activateActivityBarWebViews } from "./views/webviews/ActivityBar/activate";
import { activateCmds } from "./cmds";
import { activateClients } from "./auth/auth";
import { initRPCServer } from "./choreo-rpc/activate";
import { linkedDirectoryStore } from "./stores/linked-dir-store";
import { authStore } from "./stores/auth-store";
import { dataCacheStore } from "./stores/data-cache-store";
import { CommandIds } from "@wso2-enterprise/choreo-core";

export async function activate(context: vscode.ExtensionContext) {
    activateTelemetry(context);
    await initLogger(context);
    getLogger().debug("Activating Choreo Extension");
    ext.isPluginStartup = true; // todo: remove if not used
    ext.context = context;
    ext.api = new ChoreoExtensionApi(); // todo: refactor and add only needed functions

    // Initialize stores
    await authStore.persist.rehydrate();
    await linkedDirectoryStore.persist.rehydrate();
    await dataCacheStore.persist.rehydrate();

    // Set context values
    authStore.subscribe(({ state }) => vscode.commands.executeCommand("setContext", "isLoggedIn", !!state.userInfo));
    linkedDirectoryStore.subscribe(({ state }) => vscode.commands.executeCommand("setContext", "isLoadingLinkedDirs", state.loading));
    vscode.commands.executeCommand("setContext", "isValidWorkspace", !!workspace.workspaceFolders?.length);

    initRPCServer()
        .then(async () => {
            activateClients(); // TODO: remove (after extracting rpc client out!)
            await ext.clients.rpcClient.init();

            authStore.getState().initAuth();
            linkedDirectoryStore.getState().refreshState();

            activateCmds(context);
            activateActivityBarWebViews(context); // activity web views
            activateURIHandlers();
            // setupGithubAuthStatusCheck(); // TODO: remove
            // registerYamlLanguageServer();   // TODO: Re-enable after fixing project manager dependencies

            ext.isPluginStartup = false;
            getLogger().debug("Choreo Extension activated");
        })
        .catch((e) => {
            getLogger().error("Failed to initialize rpc client", e);
        });

    // activateStatusBarItem();
    commands.registerCommand(CommandIds.OpenWalkthrough, () => {
        commands.executeCommand(`workbench.action.openWalkthrough`, `wso2.choreo#choreo.getStarted`, false);
    });
    registerPreInitHandlers();
    return ext.api;
}

// function setupGithubAuthStatusCheck() {
//     ext.api.onStatusChanged(() => {
//         ext.clients.githubAppClient.checkAuthStatus();
//     });
// }

// Add back if needed
// export function getGitExtensionAPI() {
//     getLogger().debug("Getting Git Extension API");
//     const gitExtension = vscode.extensions.getExtension<GitExtension>("vscode.git")!.exports;
//     return gitExtension.getAPI(1);
// }

function registerPreInitHandlers(): any {
    workspace.onDidChangeConfiguration(async ({ affectsConfiguration }: ConfigurationChangeEvent) => {
        if (affectsConfiguration("Advanced.ChoreoEnvironment") || affectsConfiguration("Advanced.RpcPath")) {
            const selection = await window.showInformationMessage(
                "Choreo extension configuration changed. Please restart vscode for changes to take effect.",
                "Restart Now"
            );
            if (selection === "Restart Now") {
                commands.executeCommand("workbench.action.reloadWindow");
            }
        }
    });
}

export function deactivate() {}
