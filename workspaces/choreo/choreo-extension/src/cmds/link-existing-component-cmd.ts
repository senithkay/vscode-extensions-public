/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, window, commands, ProgressLocation } from "vscode";
import { ext } from "../extensionVariables";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import { authStore } from "../stores/auth-store";
import { initGit } from "../git/main";
import * as path from "path";
import * as fs from "fs";
import { linkedDirectoryStore } from "../stores/linked-dir-store";
import { selectOrg, selectProject, selectComponent, resolveWorkspaceDirectory } from "./cmd-utils/common-utils";
import { getGitRoot } from "./cmd-utils/git-utils";

export function linkExistingComponentCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.LinkExistingComponent, async () => {
            const userInfo = authStore.getState().state.userInfo;
            if (!userInfo) {
                throw new Error("You are not logged in. Please log in and retry.");
            }

            const selectedOrg = await selectOrg(userInfo);

            const selectedProject = await selectProject(selectedOrg);

            const selectedComponent = await selectComponent(selectedOrg, selectedProject);

            const directory = await resolveWorkspaceDirectory();

            let discoveredCompPath = "";

            const gitRoot = await getGitRoot(context, directory.uri.path);
            if (gitRoot) {
                const possibleComponentRoot = path.join(gitRoot, selectedComponent.spec.source.github?.path!);
                if (fs.existsSync(possibleComponentRoot)) {
                    discoveredCompPath = possibleComponentRoot;
                }
            }

            if (discoveredCompPath === "") {
                const componentDir = await window.showOpenDialog({
                    canSelectFolders: true,
                    canSelectFiles: false,
                    canSelectMany: false,
                    title: "Component Directory",
                    defaultUri: directory.uri,
                });

                if (componentDir === undefined || componentDir.length === 0) {
                    throw new Error("Component directory is required to link with a component");
                }

                discoveredCompPath = componentDir[0].path;
            }

            await window.withProgress(
                { title: `Generating Link File...`, location: ProgressLocation.Notification },
                async () => {
                    await ext.clients.rpcClient.createComponentLink({
                        componentDir: discoveredCompPath,
                        componentHandle: selectedComponent.metadata.name,
                        orgHandle: selectedOrg.handle,
                        projectHandle: selectedProject.handler,
                    });

                    await linkedDirectoryStore.getState().refreshState();

                    window.showInformationMessage(`Directory successfully linked`);
                }
            );
        })
    );
}
