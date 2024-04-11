/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, commands, window, ProgressLocation } from "vscode";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import { authStore } from "../stores/auth-store";
import { selectComponent, selectOrg, selectProject } from "./cmd-utils";
import { ext } from "../extensionVariables";
import { deleteLinkFile } from "../utils";

export function deleteComponentCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.DeleteComponent, async () => {
            const userInfo = authStore.getState().state.userInfo;
            if (!userInfo) {
                throw new Error("You are not logged in. Please log in and retry.");
            }

            const selectedOrg = await selectOrg(userInfo, "Select organization (1/3)");

            const selectedProject = await selectProject(
                selectedOrg,
                `Loading projects from '${selectedOrg.name}' (2/3)`,
                `Select project from '${selectedOrg.name}' to delete (2/3)`
            );

            const selectedComponent = await selectComponent(
                selectedOrg,
                selectedProject,
                `Loading components from '${selectedProject.name}' (3/3)`,
                `Select component from '${selectedProject.name}' to delete (3/3)`
            );

            const accepted = await window.showInformationMessage(
                "Are you sure you want to delete this component. This action is not reversible",
                { modal: true },
                "Delete"
            );
            if (accepted === "Delete") {
                await window.withProgress(
                    {
                        title: `Deleting component ${selectedComponent.metadata.name}...`,
                        location: ProgressLocation.Notification,
                    },
                    async () => {
                        await ext.clients.rpcClient.deleteComponent({
                            orgId: selectedOrg.id.toString(),
                            orgHandler: selectedOrg.handle,
                            projectId: selectedProject.id,
                            compHandler: selectedComponent.metadata.name,
                        });

                        await deleteLinkFile(
                            selectedOrg.handle,
                            selectedProject.handler,
                            selectedComponent.metadata.name
                        );

                        window.showInformationMessage(
                            `Component ${selectedComponent.metadata.name} deleted successfully`
                        );
                    }
                );
            }
        })
    );
}
