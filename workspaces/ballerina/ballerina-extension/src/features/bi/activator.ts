/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { commands } from 'vscode';
import { BI_COMMANDS } from '@wso2-enterprise/ballerina-core';
import { BallerinaExtension } from '../../core';

export function activate(context: BallerinaExtension) {

    commands.registerCommand(BI_COMMANDS.ADD_CONNECTIONS, () => {
        // Trigger to open the connections popup view
    });

    commands.registerCommand(BI_COMMANDS.ADD_ENTRY_POINT, () => {
        // Trigger to open the entrypoint view
    });

    commands.registerCommand(BI_COMMANDS.ADD_SCHEMA, () => {
        // Trigger to open the schema import view
    });

    commands.registerCommand(BI_COMMANDS.ADD_FUNCTION, () => {
        // Trigger to open the function create view
    });

    commands.registerCommand(BI_COMMANDS.ADD_CONFIGURATION, () => {
        // Trigger to open the configuration setup view
    });
}
