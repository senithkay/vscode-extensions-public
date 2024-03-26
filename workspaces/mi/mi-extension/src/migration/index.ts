/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { COMMANDS } from '../constants';
import * as fs from 'fs';
import * as path from 'path';
import { importProject } from '../util/migrationUtils';

export function activateMigrationSupport(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand(COMMANDS.MIGRATE_PROJECT, async () => {
        const source = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (source) {
            const sourcePathComponents = source.split(path.sep);
            const projectName = sourcePathComponents.pop();
            const migratedProjectName = `${projectName}-migrated`;
            let target = [...sourcePathComponents, migratedProjectName].join(path.sep);
            // check if the file exists
            let i = 0;
            while (true) {
                if (fs.existsSync(target)) {
                    // update file name if exists
                    i++;
                    target = [...sourcePathComponents, `${migratedProjectName}-${i}`].join(path.sep);
                } else {
                    importProject({ source, directory: target, open: true });
                    break;
                }
            }
        }
    });
}

