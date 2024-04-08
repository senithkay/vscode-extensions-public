/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext } from "vscode";
// import { activateOpenProjectCmd } from "./open-project";
// import { activateOpenInConsoleCmd } from "./open-in-console";
import { linkExistingComponentCommand } from './link-existing-component';
import { createNewComponentCommand } from './create-new-component';
import { refreshComponentsCommand } from './refresh-components';

export function activateCmds(context: ExtensionContext) {
    // activateOpenProjectCmd(context);
    // activateOpenInConsoleCmd(context);
    createNewComponentCommand(context);
    linkExistingComponentCommand(context);
    refreshComponentsCommand(context);
}
