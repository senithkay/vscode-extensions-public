/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import { ExtensionContext, commands } from "vscode";
import { openProjectInConsoleCmdId } from "../constants";
import { ext } from "../extensionVariables";
import { getLogger } from "../logger/logger";
import { choreoAuthConfig } from "../auth/auth";

export function activateOpenInConsoleCmd(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand(openProjectInConsoleCmdId, async (projectId: string) => {
         const orgHandle = ext.api.selectedOrg?.handle;
         if (orgHandle) {
            let targetProject: string|undefined = projectId;
            if (!targetProject && await ext.api.isChoreoProject()) {
                targetProject = (await ext.api.getChoreoProject())?.id;
            }
            if (!targetProject) {
                getLogger().error("No project selected");
                return;
            }
            const url = `${choreoAuthConfig.getConsoleUrl()}/organizations/${orgHandle}/projects/${targetProject}`;
            // open external url
            commands.executeCommand('vscode.open', url);
         } else {
            getLogger().error("No organization selected");
         }
    }));
}
