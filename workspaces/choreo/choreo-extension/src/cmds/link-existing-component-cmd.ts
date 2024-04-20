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
import { CommandIds, ComponentKind } from "@wso2-enterprise/choreo-core";
import { authStore } from "../stores/auth-store";
import * as path from "path";
import * as fs from "fs";
import { linkedDirectoryStore } from "../stores/linked-dir-store";
import { selectOrg, selectProject, resolveWorkspaceDirectory, resolveQuickPick } from "./cmd-utils";
import { getGitRoot } from "../git/util";
import { goTosource } from "../utils";
import { showComponentDetails } from "./view-component-cmd";

export function linkExistingComponentCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.LinkExistingComponent, async () => {
            // TODO: add try catch for all other command blocks
            try {
                const userInfo = authStore.getState().state.userInfo;
                if (!userInfo) {
                    throw new Error("You are not logged in. Please log in and retry.");
                }

                const directory = await resolveWorkspaceDirectory();

                const componentDir = await window.showOpenDialog({
                    canSelectFolders: true,
                    canSelectFiles: false,
                    canSelectMany: false,
                    title: "Select directory that needs to be linked with a component (1/3)",
                    defaultUri: directory.uri,
                });

                if (componentDir === undefined || componentDir.length === 0) {
                    throw new Error("Component directory is required to link with a component");
                }

                if (!componentDir[0].path.startsWith(directory.uri.path)) {
                    throw new Error("Component directory must be within your workspace");
                }

                const gitRoot = await getGitRoot(context, directory.uri.path);
                if (!gitRoot) {
                    throw new Error("Selected directory is not within a git directory");
                }

                const selectedOrg = await selectOrg(userInfo, "Select organization (2/3)");

                const selectedProject = await selectProject(
                    selectedOrg,
                    `Loading projects from '${selectedOrg.name}' (3/3)`,
                    `Select project from '${selectedOrg.name}' (3/3)`
                );

                const components = await window.withProgress(
                    {
                        title: `Fetching components of ${selectedProject.name}...`,
                        location: ProgressLocation.Notification,
                    },
                    () =>
                        ext.clients.rpcClient.getComponentList({
                            orgId: selectedOrg.id.toString(),
                            projectHandle: selectedProject.handler,
                        })
                );

                // TODO: check if component/project repo matches with one of the remote URL

                if (components.length === 0) {
                    throw new Error(`No components found to link within ${selectedProject.name} .`);
                }

                let matchingComponents: ComponentKind[] = [];
                for (const component of components) {
                    const compPath = path.join(gitRoot, component.spec.source.github?.path!);
                    if (fs.existsSync(compPath) && compPath === componentDir[0].path) {
                        matchingComponents.push(component);
                    }
                }

                if (matchingComponents.length === 0) {
                    window.showInformationMessage("No matching components was found for the selected directory");
                    return;
                }

                if (matchingComponents.length > 1) {
                    const matchingComponent = await resolveQuickPick(
                        matchingComponents.map((item) => ({ item, label: item.metadata.name })),
                        `Select component to link with selected directory`,
                        "No components"
                    );
                    matchingComponents = [matchingComponent];
                }

                await window.withProgress(
                    { title: `Generating Link File...`, location: ProgressLocation.Notification },
                    async () => {
                        const componentDir = path.join(gitRoot, matchingComponents[0]?.spec.source.github?.path!)
                        await ext.clients.rpcClient.createComponentLink({
                            componentDir,
                            componentHandle: matchingComponents[0]?.metadata.name!,
                            orgHandle: selectedOrg.handle,
                            projectHandle: selectedProject.handler,
                        });

                        await linkedDirectoryStore.getState().refreshState();

                        showComponentDetails(selectedOrg, selectedProject, matchingComponents[0], componentDir);

                        window
                            .showInformationMessage(
                                `Selected directory has been successfully linked with component ${matchingComponents[0]?.metadata.name}`,
                                "View link file"
                            )
                            .then((selection) => {
                                if (selection === "View link file") {
                                    goTosource(
                                        path.join(
                                            gitRoot,
                                            matchingComponents[0]?.spec.source.github?.path!,
                                            ".choreo",
                                            "link.yaml"
                                        )
                                    );
                                }
                            });
                    }
                );
            } catch (err: any) {
                console.error("Failed to link component", err);
                window.showErrorMessage(err?.message || "Failed to link component");
            }
        })
    );
}
