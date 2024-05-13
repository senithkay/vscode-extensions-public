/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, commands, env, Uri, window } from "vscode";
import { CommandIds, ComponentKind, Organization, Project } from "@wso2-enterprise/choreo-core";
import { authStore } from "../stores/auth-store";
import { selectOrg, selectProject, selectComponent, getUserInfoForCmd } from "./cmd-utils";
import { choreoEnvConfig } from "../auth/auth";

export function openComponentInConsoleCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(
            CommandIds.OpenComponentInConsole,
            async (params: { organization: Organization; project: Project; component: ComponentKind }) => {
                try {
                    const userInfo = await getUserInfoForCmd("open a component in Choreo console");
                    if (userInfo) {
                        const selectedOrg =
                            params?.organization ?? (await selectOrg(userInfo, "Select organization"));

                        const selectedProject =
                            params?.project ??
                            (await selectProject(
                                selectedOrg,
                                `Loading projects from '${selectedOrg.name}'`,
                                `Select project from '${selectedOrg.name}'`
                            ));

                        const selectedComponent =
                            params?.component ??
                            (await selectComponent(
                                selectedOrg,
                                selectedProject,
                                `Loading components from '${selectedProject.name}'`,
                                `Select component from '${selectedProject.name}' to open in Console`
                            ));

                        const url = `${choreoEnvConfig.getConsoleUrl()}/organizations/${selectedOrg?.handle}/projects/${
                            selectedProject.id
                        }/components/${selectedComponent.metadata.handler}`;
                        const consoleUrl = Uri.parse(url);
                        env.openExternal(consoleUrl);
                    }
                } catch (err: any) {
                    console.error("Failed to create component", err);
                    window.showErrorMessage(err?.message || "Failed to create component");
                }
            }
        )
    );
}
