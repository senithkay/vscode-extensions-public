/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, commands, env, Uri } from "vscode";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import { authStore } from "../stores/auth-store";
import { selectOrg, selectProject, selectComponent } from "./cmd-utils";
import { choreoEnvConfig } from "../auth/auth";

export function openComponentInConsoleCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(CommandIds.OpenComponentInConsole, async () => {
            const userInfo = authStore.getState().state.userInfo;
            if (!userInfo) {
                throw new Error("You are not logged in. Please log in and retry.");
            }

            const selectedOrg = await selectOrg(userInfo);

            const selectedProject = await selectProject(selectedOrg);

            const selectedComponent = await selectComponent(selectedOrg, selectedProject);

            // TODO: Replace selectedComponent.metadata.name, if available
            const url = `${choreoEnvConfig.getConsoleUrl()}/organizations/${selectedOrg?.handle}/projects/${
                selectedProject.id
            }/components/${selectedComponent.metadata.name}`;
            const consoleUrl = Uri.parse(url);
            env.openExternal(consoleUrl);
        })
    );
}
