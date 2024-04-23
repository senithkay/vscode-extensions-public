/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, WorkspaceFolder, commands, window, workspace } from "vscode";
import { ext } from "../extensionVariables";
import { CommandIds, ICreateComponentParams } from "@wso2-enterprise/choreo-core";
import { ComponentFormView } from "../views/webviews/ComponentFormView";
import { getUserInfoForCmd, resolveWorkspaceDirectory, selectOrg, selectProjectWithCreateNew } from "./cmd-utils";
import * as path from "path";

let componentWizard: ComponentFormView;

export function createNewComponentCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.CreateNewComponent, async (params: ICreateComponentParams) => {
            try {
                const userInfo = await getUserInfoForCmd("create a component");
                if (userInfo) {
                    let subPath: string | undefined;
                    let workspaceDir: WorkspaceFolder | undefined;

                    if (params?.initialValues?.componentDir) {
                        const workspaceDir = workspace.workspaceFolders?.find(
                            (item) => !!getSubPath(params?.initialValues?.componentDir!, item.uri.path)
                        );
                        if (workspaceDir) {
                            subPath = getSubPath(params?.initialValues?.componentDir!, workspaceDir?.uri.path);
                        }
                    }

                    if (!workspaceDir) {
                        workspaceDir = await resolveWorkspaceDirectory();
                    }

                    const selectedOrg = await selectOrg(userInfo, "Select organization (1/2)");

                    let selectedProject = await selectProjectWithCreateNew(
                        selectedOrg,
                        `Loading projects from '${selectedOrg.name}' (2/2)`,
                        `Select project from '${selectedOrg.name}' to create your component in (2/2)`
                    );

                    if (componentWizard) {
                        componentWizard.dispose();
                    }
                    componentWizard = new ComponentFormView(ext.context.extensionUri, {
                        directoryPath: workspaceDir.uri.path,
                        organization: selectedOrg,
                        project: selectedProject === "new-project" ? undefined : selectedProject,
                        initialValues: {
                            type: params?.initialValues?.type,
                            buildPackLang: params?.initialValues?.buildPackLang,
                            subPath: subPath ?? ".",
                        },
                    });
                    componentWizard.getWebview()?.reveal();
                }
            } catch (err: any) {
                console.error("Failed to create component", err);
                window.showErrorMessage(err?.message || "Failed to create component");
            }
        })
    );
}

function getSubPath(subPath: string, parentPath: string): string | undefined {
    const relative = path.relative(parentPath, subPath);
    // If the relative path starts with '..', it means subPath is outside of parentPath
    if (!relative.startsWith("..")) {
        // If subPath and parentPath are the same, return '.'
        if (relative === "") {
            return ".";
        }
        return relative;
    }
}
