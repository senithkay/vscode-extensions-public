/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, commands } from "vscode";
import { ext } from "../extensionVariables";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import { authStore } from "../stores/auth-store";
import { ComponentFormView } from "../views/webviews/ComponentFormView";
import { resolveWorkspaceDirectory, selectOrg, selectProjectWithCreateNew } from "./cmd-utils/common-utils";

let componentWizard: ComponentFormView;

export function createNewComponentCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.CreateNewComponent, async () => {
            const userInfo = authStore.getState().state.userInfo;
            if (!userInfo) {
                throw new Error("You are not logged in. Please log in and retry.");
            }

            const workspaceDir = await resolveWorkspaceDirectory();

            const selectedOrg = await selectOrg(userInfo);

            const selectedProject = await selectProjectWithCreateNew(selectedOrg);

            if (selectedProject === "new-project") {
                if (componentWizard) {
                    componentWizard.dispose();
                }
                componentWizard = new ComponentFormView(ext.context.extensionUri, workspaceDir.uri.path, selectedOrg);
                componentWizard.getWebview()?.reveal();
            } else {
                if (componentWizard) {
                    componentWizard.dispose();
                }
                componentWizard = new ComponentFormView(ext.context.extensionUri, workspaceDir.uri.path, selectedOrg, selectedProject);
                componentWizard.getWebview()?.reveal();
            }
        })
    );
}
