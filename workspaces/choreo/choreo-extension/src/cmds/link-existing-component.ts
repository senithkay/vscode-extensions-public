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
import { authStore } from "../states/authState";
import { initGit } from "../git/main";
import * as path from "path";
import { linkedDirectoryStore } from "../states/linkedDirState";
import { selectOrg, selectProject, selectComponent, resolveWorkspaceDirectory } from "./cmd-utils/common-utils";

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

            await window.withProgress(
                { title: `Generating Link File...`, location: ProgressLocation.Notification },
                async () => {
                    const newGit = await initGit(context);
                    const repoRootPath = await newGit?.getRepositoryRoot(directory.uri.path);
                    const relativePath = path.relative(repoRootPath!, componentDir[0]!.path);

                    if (relativePath !== selectedComponent.spec?.source?.github?.path) {
                        window.showErrorMessage("Invalid Directory Selection", {
                            modal: true,
                            detail: `Selected directory does not match with selected component directory. Please navigate into "${selectedComponent.spec?.source?.github?.path}" directory and retry`,
                        });
                        return;
                    }
                    await ext.clients.rpcClient.createComponentLink({
                        componentDir: componentDir[0].path,
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
