/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Position, Range, Uri, WorkspaceEdit, commands, workspace, window } from "vscode";
import * as fs from "fs";
import { COMMANDS } from "../constants";
import path from "path";
import { MILanguageClient } from "../lang-client/activator";
import { extension } from "../MIExtensionContext";

export async function replaceFullContentToFile(documentUri: string, content: string) {
    // Create the file if not present
    let isNewFile = false;
    if (!fs.existsSync(documentUri)) {
        // Create parent directories if they don't exist
        fs.mkdirSync(documentUri.substring(0, documentUri.lastIndexOf(path.sep)), { recursive: true });
        fs.writeFileSync(documentUri, "");
        isNewFile = true;
    }
    const edit = new WorkspaceEdit();
    const fileContent = fs.readFileSync(documentUri, 'utf-8');
    const lineCount = fileContent.split('\n').length;
    const fullRange = new Range(new Position(0, 0), new Position(lineCount, 0));

    edit.replace(Uri.file(documentUri), fullRange, content);
    await workspace.applyEdit(edit);
    if (isNewFile) {
        commands.executeCommand(COMMANDS.REFRESH_COMMAND);
    }
}

export async function askForProject(): Promise<string> {
    const projects: Map<string, string> = new Map();
    for (const wrkspace of workspace.workspaceFolders!) {
        const lsClient = await MILanguageClient.getInstance(wrkspace.uri.fsPath);
        if (lsClient) {
            const projectDetails = await lsClient.languageClient?.getProjectDetails();
            if (projectDetails?.primaryDetails?.projectName?.value) {
                if (projects.has(projectDetails.primaryDetails.projectName.value)) {
                    projects.set(wrkspace.uri.fsPath, wrkspace.uri.fsPath);
                } else {
                    projects.set(projectDetails.primaryDetails.projectName.value, wrkspace.uri.fsPath);
                }
            }
        }
    }
    const quickPick = await window.showQuickPick(
        Array.from(projects.keys()),
        {
            placeHolder: 'Please select a project'
        }
    );
    if (!quickPick) {
        return "";
    }
    return projects.get(quickPick)!;
}
