/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, Uri, commands, workspace, window, WebviewPanel } from "vscode";
import { ext } from "../extensionVariables";
import { CommandIds, ComponentKind, LinkFileContent, Organization, Project } from "@wso2-enterprise/choreo-core";
import { authStore } from "../stores/auth-store";
import { getUserInfoForCmd, selectComponent, selectOrg, selectProject } from "./cmd-utils";
import { readFileSync } from "fs";
import * as yaml from "js-yaml";
import * as path from "path";
import { webviewStateStore } from "../stores/webview-state-store";
import { showComponentDetailsView } from "../views/webviews/ComponentDetailsView";

export function viewComponentCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.ViewComponent, async () => {
            try {
                const userInfo = await getUserInfoForCmd("view component details");
                if (userInfo) {
                    const selectedOrg = await selectOrg(userInfo, "Select organization");

                    const selectedProject = await selectProject(
                        selectedOrg,
                        `Loading projects from '${selectedOrg.name}'`,
                        `Select project from '${selectedOrg.name}'`
                    );

                    const selectedComponent = await selectComponent(
                        selectedOrg,
                        selectedProject,
                        `Loading components from '${selectedProject.name}'`,
                        `Select component from '${selectedProject.name}' to view`
                    );

                    const linkFiles = await workspace.findFiles("**/.choreo/link.yaml");

                    let matchingPath: string = "";

                    for (const linkFile of linkFiles) {
                        const parsedData: LinkFileContent = yaml.load(readFileSync(linkFile.fsPath, "utf8")) as any;
                        if (
                            parsedData.component === selectedComponent.metadata.name &&
                            parsedData.project === selectedProject.handler &&
                            parsedData.org === selectedOrg.handle
                        ) {
                            matchingPath = path.dirname(path.dirname(linkFile.fsPath));
                            break;
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
