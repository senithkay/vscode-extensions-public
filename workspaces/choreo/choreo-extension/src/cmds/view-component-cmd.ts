/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, Uri, commands, workspace, window } from "vscode";
import { ext } from "../extensionVariables";
import { CommandIds, ComponentKind, LinkFileContent, Organization, Project } from "@wso2-enterprise/choreo-core";
import { authStore } from "../stores/auth-store";
import { ComponentDetailsView } from "../views/webviews/ComponentDetailsView";
import { selectComponent, selectOrg, selectProject } from "./cmd-utils";
import { readFileSync } from "fs";
import * as yaml from "js-yaml";
import * as path from "path";
import { webviewStateStore } from "../stores/webview-state-store";

export function viewComponentCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.ViewComponent, async () => {
            const userInfo = authStore.getState().state.userInfo;
            if (!userInfo) {
                throw new Error("You are not logged in. Please log in and retry.");
            }

            const selectedOrg = await selectOrg(userInfo, "Select organization (1/3)");

            const selectedProject = await selectProject(
                selectedOrg,
                `Loading projects from '${selectedOrg.name}' (2/3)`,
                `Select project from '${selectedOrg.name}' (2/3)`
            );

            const selectedComponent = await selectComponent(
                selectedOrg,
                selectedProject,
                `Loading components from '${selectedProject.name}' (3/3)`,
                `Select component from '${selectedProject.name}' to view (3/3)`
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
                    matchingPath = path.dirname(path.dirname(linkFile.path));
                    break;
                }
            }

            showComponentDetails(selectedOrg, selectedProject, selectedComponent, matchingPath);
        })
    );
}

const componentViewMap = new Map<string, ComponentDetailsView>();

export const showComponentDetails = (
    org: Organization,
    project: Project,
    component: ComponentKind,
    componentPath: string
) => {
    const componentKey = `${org.handle}-${project.handler}-${component.metadata.name}`;
    if (componentViewMap.has(componentKey) && componentViewMap.get(componentKey)?.getWebview()) {
        componentViewMap.get(componentKey)?.getWebview()?.reveal();
    } else {
        const componentDetailsView = new ComponentDetailsView(
            ext.context.extensionUri,
            org,
            project,
            component,
            componentPath
        );
        componentDetailsView.getWebview()?.reveal();
        componentViewMap.set(componentKey, componentDetailsView);

        webviewStateStore.getState().setOpenedComponentPath(componentPath ?? "");
        componentDetailsView.getWebview()?.onDidChangeViewState((event) => {
            if (event.webviewPanel.active) {
                webviewStateStore.getState().setOpenedComponentPath(componentPath ?? "");
            }else{
                webviewStateStore.getState().onCloseComponentView(componentPath);
            }
        });
        componentDetailsView.getWebview()?.onDidDispose(() => {
            webviewStateStore.getState().onCloseComponentView(componentPath);
        });
    }
};
// TODO: clear webview when component delete
