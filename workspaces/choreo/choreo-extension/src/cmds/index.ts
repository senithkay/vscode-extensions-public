/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { commands, ExtensionContext } from "vscode";
import { linkExistingComponentCommand } from './link-existing-component-cmd';
import { createNewComponentCommand } from './create-component-cmd';
import { refreshComponentsCommand } from './refresh-components-cmd';
import { deleteComponentCommand } from './delete-component-cmd';
import { signInCommand } from './sign-in-cmd';
import { signInWithAuthCodeCommand } from './sign-in-with-code-cmd';
import { signOutCommand } from './sign-out-cmd';
import { openComponentInConsoleCommand } from './open-component-in-console-cmd';
import { viewComponentCommand } from './view-component-cmd';
import { CommandIds } from "@wso2-enterprise/choreo-core";

export function activateCmds(context: ExtensionContext) {
    createNewComponentCommand(context);
    linkExistingComponentCommand(context);
    refreshComponentsCommand(context);
    deleteComponentCommand(context);
    signInCommand(context);
    signInWithAuthCodeCommand(context);
    signOutCommand(context);
    openComponentInConsoleCommand(context);
    viewComponentCommand(context);

    commands.registerCommand(CommandIds.OpenWalkthrough, () => {
        commands.executeCommand(`workbench.action.openWalkthrough`, `wso2.choreo#choreo.getStarted`, false);
    });
}
