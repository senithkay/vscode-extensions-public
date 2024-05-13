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
import { ComponentDetailsView } from "../views/webviews/ComponentDetailsView";
import { getUserInfoForCmd, selectComponent, selectOrg, selectProject } from "./cmd-utils";
import { readFileSync } from "fs";
import * as yaml from "js-yaml";
import * as path from "path";
import { webviewStateStore } from "../stores/webview-state-store";

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

                    showComponentDetails(selectedOrg, selectedProject, selectedComponent, matchingPath);
                }
            } catch (err: any) {
                console.error("Failed to create component", err);
                window.showErrorMessage(err?.message || "Failed to create component");
            }
        })
    );
}

const componentViewMap = new Map<string, ComponentDetailsView>();

export const getComponentView = (
    orgHandle: string,
    projectHandle: string,
    component: string
): WebviewPanel | undefined => {
    const componentKey = `${orgHandle}-${projectHandle}-${component}`;
    return componentViewMap.get(componentKey)?.getWebview();
};

export const closeWebviewPanel = (orgHandle: string, projectHandle: string, component: string): void => {
    const webView = getComponentView(orgHandle, projectHandle, component);
    if (webView) {
        webView.dispose();
    }
};

export const showComponentDetails = (
    org: Organization,
    project: Project,
    component: ComponentKind,
    componentPath: string
) => {
    const webView = getComponentView(org.handle, project.handler, component.metadata.name);

    if (webView) {
        webView?.reveal();
    } else {
        const componentDetailsView = new ComponentDetailsView(
            ext.context.extensionUri,
            org,
            project,
            component,
            componentPath
        );
        componentDetailsView.getWebview()?.reveal();
        componentViewMap.set(`${org.handle}-${project.handler}-${component.metadata.name}`, componentDetailsView);

        webviewStateStore.getState().setOpenedComponentPath(componentPath ?? "");
        componentDetailsView.getWebview()?.onDidChangeViewState((event) => {
            if (event.webviewPanel.active) {
                webviewStateStore.getState().setOpenedComponentPath(componentPath ?? "");
            } else {
                webviewStateStore.getState().onCloseComponentView(componentPath);
            }
        });
        componentDetailsView.getWebview()?.onDidDispose(() => {
            webviewStateStore.getState().onCloseComponentView(componentPath);
        });
    }
};
// TODO: clear webview when component delete
