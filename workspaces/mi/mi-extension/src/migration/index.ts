/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from "vscode";
import { COMMANDS } from "../constants";
import { importProject } from "../util/migrationUtils";
import { askForProject } from "../util/workspace";

export function activateMigrationSupport(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand(COMMANDS.MIGRATE_PROJECT, async (params?: { sourceDir: string }) => {
        let source = params?.sourceDir;
        if (!source) {
            source = await askForProject();
        }
        if (source) {
            importProject({ source, directory: source, open: true });
            vscode.commands.executeCommand('setContext', 'MI.migrationStatus', 'migrating');
        }
        return;
    });
}
