/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, commands, env, Uri, window } from "vscode";
import { CommandIds, Organization, Project } from "@wso2-enterprise/choreo-core";
import { selectOrg, selectProject, getUserInfoForCmd } from "./cmd-utils";
import { choreoEnvConfig } from "../config";
import { contextStore } from "../stores/context-store";

export function openProjectInConsoleCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(
            CommandIds.OpenProjectInConsole,
            async (params: { organization: Organization; project: Project }) => {
                try {
                    const userInfo = await getUserInfoForCmd("open a project in Choreo console");
                    if (userInfo) {
                        let selectedOrg = params?.organization;
                        let selectedProject = params?.project;

                        const selected = contextStore.getState().state.selected;

                        if (!selectedOrg) {
                            if (selected) {
                                selectedOrg = selected.org!;
                            } else {
                                selectedOrg = await selectOrg(userInfo, "Select organization");
                            }
                        }
                        if (!selectedProject) {
                            if (selected) {
                                selectedProject = selected.project!;
                            } else {
                                selectedProject = await selectProject(
                                    selectedOrg,
                                    `Loading projects from '${selectedOrg.name}'`,
                                    `Select project from '${selectedOrg.name}'`
                                );
                            }
                        }

                        const url = `${choreoEnvConfig.getConsoleUrl()}/organizations/${
                            selected?.org?.handle
                        }/projects/${selected?.project?.id}/home`;
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
