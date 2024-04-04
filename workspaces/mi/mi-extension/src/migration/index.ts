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

export function activateMigrationSupport(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand(COMMANDS.MIGRATE_PROJECT, async () => {
        const selection = await vscode.window.showQuickPick(
            [
                {
                    label: "Select Destination",
                    description: "Select a destination folder to migrate the project",
                },
            ],
            {
                placeHolder: "Migration Options",
            }
        );
        switch (selection?.label) {
            case "Select Destination":
                vscode.commands.executeCommand(COMMANDS.SELECT_DESTINATION);
                break;
        }
    });

    // Select destination folder
    vscode.commands.registerCommand(COMMANDS.SELECT_DESTINATION, async (params?: { sourceDir: string }) => {
        const source = params?.sourceDir || vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        const targetUri = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            openLabel: "Select Destination",
        });
        const target = targetUri?.[0]?.fsPath;
        if (source && target) {
            importProject({ source, directory: target, open: true });
        }
        return target;
    });
}
