/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, commands, window } from "vscode";
import { CommandIds, ComponentKind, Organization, Project, ViewComponentDetailsReq } from "@wso2-enterprise/choreo-core";
import { getUserInfoForCmd, selectComponent, selectOrg, selectProject } from "./cmd-utils";
import { existsSync } from "fs";
import * as path from "path";
import { showComponentDetailsView } from "../views/webviews/ComponentDetailsView";
import { contextStore } from "../stores/context-store";

export function viewComponentCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.ViewComponent, async (params: ViewComponentDetailsReq) => {
            try {
                const userInfo = await getUserInfoForCmd("view component details");
                if (userInfo) {
                    let selectedOrg = params?.organization;
                        let selectedProject = params?.project;

                        const selected = contextStore.getState().state.selected;
                        if (selected) {
                            selectedOrg = selected.org!;
                            selectedProject = selected.project!;
                        } else {
                            selectedOrg = await selectOrg(userInfo, "Select organization");
                            selectedProject = await selectProject(
                                selectedOrg,
                                `Loading projects from '${selectedOrg.name}'`,
                                `Select project from '${selectedOrg.name}'`
                            );
                        }

                        const selectedComponent =
                            params?.component ??
                            (await selectComponent(
                                selectedOrg,
                                selectedProject,
                                `Loading components from '${selectedProject.name}'`,
                                `Select component from '${selectedProject.name}' to view`
                            ));

                    let matchingPath: string = params?.componentPath;

                    if(!matchingPath){
                        const contextItems = contextStore.getState().getValidItems();
                        for (const item of contextItems) {
                            if (item.orgHandle === selectedOrg.handle && item.projectHandle === selectedProject.handler) {
                                const matchingCts = item.contextDirs.find((ctxItem) => {
                                    const componentPath = path.join(
                                        ctxItem.projectRootFsPath,
                                        selectedComponent.spec.source.github?.path!
                                    );
                                    return existsSync(componentPath);
                                });
                                if (matchingCts) {
                                    matchingPath = path.join(
                                        matchingCts.projectRootFsPath,
                                        selectedComponent.spec.source.github?.path!
                                    );
                                    break;
                                }
                            }
                        }
                    }

                    showComponentDetailsView(selectedOrg, selectedProject, selectedComponent, matchingPath);
                }
            } catch (err: any) {
                console.error("Failed to create component", err);
                window.showErrorMessage(err?.message || "Failed to create component");
            }
        })
    );
}
