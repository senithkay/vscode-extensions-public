/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, commands, window, ProgressLocation } from "vscode";
import { CommandIds, ComponentKind, Organization, Project } from "@wso2-enterprise/choreo-core";
import { getUserInfoForCmd, selectComponent, selectOrg, selectProject } from "./cmd-utils";
import { ext } from "../extensionVariables";
import { deleteLinkFile } from "../utils";
import { linkedDirectoryStore } from "../stores/linked-dir-store";
import { closeComponentDetailsView } from "../views/webviews/ComponentDetailsView";
import { closeAllComponentTestView } from "../views/webviews/ComponentTestView";

export function deleteComponentCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(
            CommandIds.DeleteComponent,
            async (params: { organization: Organization; project: Project; component: ComponentKind }) => {
                try {
                    const userInfo = await getUserInfoForCmd("delete a component");
                    if (userInfo) {
                        const selectedOrg =
                            params?.organization ?? (await selectOrg(userInfo, "Select organization"));

                        const selectedProject =
                            params?.project ??
                            (await selectProject(
                                selectedOrg,
                                `Loading projects from '${selectedOrg.name}'`,
                                `Select project from '${selectedOrg.name}' to delete`
                            ));

                        const selectedComponent =
                            params?.component ??
                            (await selectComponent(
                                selectedOrg,
                                selectedProject,
                                `Loading components from '${selectedProject.name}'`,
                                `Select component from '${selectedProject.name}' to delete`
                            ));

                        const accepted = await window.showInformationMessage(
                            "Are you sure you want to delete this Choreo component? This action will not affect any local files and will only delete the component created in Choreo. Please note that this action is not reversible.",
                            { modal: true },
                            "Delete"
                        );
                        if (accepted === "Delete") {
                            await window.withProgress(
                                {
                                    title: `Deleting component ${selectedComponent.metadata.displayName}...`,
                                    location: ProgressLocation.Notification,
                                },
                                async () => {
                                    await ext.clients.rpcClient.deleteComponent({
                                        orgId: selectedOrg.id.toString(),
                                        orgHandler: selectedOrg.handle,
                                        projectId: selectedProject.id,
                                        componentId: selectedComponent.metadata.id,
                                        componentName: selectedComponent.metadata.displayName,
                                    });

                                    closeComponentDetailsView(
                                        selectedOrg.handle,
                                        selectedProject.handler,
                                        selectedComponent.metadata.name
                                    );

                                    closeAllComponentTestView(
                                        selectedOrg.handle,
                                        selectedProject.handler,
                                        selectedComponent.metadata.name
                                    );

                                    await deleteLinkFile(
                                        selectedOrg.handle,
                                        selectedProject.handler,
                                        selectedComponent.metadata.name
                                    );

                                    linkedDirectoryStore.getState().refreshState();

                                    window.showInformationMessage(
                                        `Component ${selectedComponent.metadata.displayName} has been successfully deleted`
                                    );
                                }
                            );
                        }
                    }
                } catch (err: any) {
                    console.error("Failed to delete component", err);
                    window.showErrorMessage(err?.message || "Failed to delete component");
                }
            }
        )
    );
}
