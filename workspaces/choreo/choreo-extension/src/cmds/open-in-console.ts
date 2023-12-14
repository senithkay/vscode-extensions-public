/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, commands } from "vscode";
import { openProjectInConsoleCmdId } from "../constants";
import { ext } from "../extensionVariables";
import { getLogger } from "../logger/logger";
import { choreoEnvConfig } from "../auth/auth";
import { Project } from "@wso2-enterprise/choreo-core";

export function activateOpenInConsoleCmd(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand(openProjectInConsoleCmdId, async () => {
        let targetProject: Project|undefined;
        if (!targetProject && ext.api.isChoreoProject()) {
            targetProject = (await ext.api.getChoreoProject());
        }
        if (!targetProject) {
            getLogger().error("No project selected");
            return;
        }
        const org = ext.api.getOrgById(parseInt(targetProject.orgId));
        if (!org) {
            getLogger().error("No organization found");
            return;
        }
        const url = `${choreoEnvConfig.getConsoleUrl()}/organizations/${org?.handle}/projects/${targetProject}`;
        // open external url
        commands.executeCommand('vscode.open', url);
    }));
}
