/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { commands, Uri, window } from "vscode";
import { BALLERINA_COMMANDS, PALETTE_COMMANDS, runCommand } from "./cmd-runner";
import { ballerinaExtInstance } from "../../core";
import { configGenerator } from "../../config-generator/configGenerator";


function activateConfigRunCommand() {
    // register the config view run command
    commands.registerCommand(PALETTE_COMMANDS.RUN_CONFIG, async (filePath: Uri) => {
        const currentProject = ballerinaExtInstance.getDocumentContext().getCurrentProject();
        if (currentProject) {
            runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.RUN,
                currentProject.path!);
            return;
        }
    });

    commands.registerCommand(PALETTE_COMMANDS.CONFIG_CREATE_COMMAND, async () => {
        const currentProject = ballerinaExtInstance.getDocumentContext().getCurrentProject();
        const filePath = window.activeTextEditor.document;
        const path = filePath.uri.fsPath;
        configGenerator(ballerinaExtInstance, currentProject ? currentProject.path! : path, true);
        return;
    });
}

export { activateConfigRunCommand };
