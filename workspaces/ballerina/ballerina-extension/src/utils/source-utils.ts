/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import { workspace } from 'vscode';
import { Uri, Position } from 'vscode';
import { ArtifactsNotification, LinePosition, STModification, SyntaxTree, TextEdit } from '@wso2-enterprise/ballerina-core';
import path from 'path';
import { StateMachine } from '../stateMachine';

export async function updateSourceCode(textEdits: { [key: string]: TextEdit[]; }): Promise<void> {
    StateMachine.setEditMode();
    const modificationRequests: Record<string, { filePath: string; modifications: STModification[] }> = {};
    for (const [key, value] of Object.entries(textEdits)) {
        const fileUri = Uri.file(key);
        const fileUriString = fileUri.toString();
        const edits = value;

        if (edits && edits.length > 0) {
            const modificationList: STModification[] = [];

            for (const edit of edits) {
                const stModification: STModification = {
                    startLine: edit.range.start.line,
                    startColumn: edit.range.start.character,
                    endLine: edit.range.end.line,
                    endColumn: edit.range.end.character,
                    type: "INSERT",
                    isImport: false,
                    config: {
                        STATEMENT: edit.newText,
                    },
                };
                modificationList.push(stModification);
            }

            if (modificationRequests[fileUriString]) {
                modificationRequests[fileUriString].modifications.push(...modificationList);
            } else {
                modificationRequests[fileUriString] = { filePath: fileUri.fsPath, modifications: modificationList };
            }
        }
    }

    // Iterate through modificationRequests and apply modifications
    try {
        for (const [fileUriString, request] of Object.entries(modificationRequests)) {
            const { parseSuccess, source, syntaxTree } = (await StateMachine.langClient().stModify({
                documentIdentifier: { uri: fileUriString },
                astModifications: request.modifications,
            })) as SyntaxTree;

            if (parseSuccess) {
                const fileUri = Uri.file(request.filePath);
                const workspaceEdit = new vscode.WorkspaceEdit();
                workspaceEdit.replace(
                    fileUri,
                    new vscode.Range(
                        new vscode.Position(0, 0),
                        new vscode.Position(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
                    ),
                    source
                );
                await workspace.applyEdit(workspaceEdit);
            }
        }
    } catch (error) {
        console.log(">>> error updating source", error);
    }
}


export async function injectImportIfMissing(importStatement: string, filePath: string) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    if (!fileContent.includes(importStatement)) {
        const workspaceEdit = new vscode.WorkspaceEdit();
        const position = new vscode.Position(0, 0); // Insert at the beginning of the file
        workspaceEdit.insert(vscode.Uri.file(filePath), position, importStatement + ';\n');
        await vscode.workspace.applyEdit(workspaceEdit);
    }
}

export async function injectAgent(name: string, projectUri: string) {
    const agentCode = `
final ai:OpenAiProvider _${name}Model = check new ("", ai:GPT_4O);
final ai:Agent _${name}Agent = check new (systemPrompt = {role: "", instructions: string \`\`},
    model = _${name}Model,
    tools = []
);`;
    // Update the service function code 
    const agentsFile = path.join(projectUri, `agents.bal`);
    const agentEdit = new vscode.WorkspaceEdit();

    // Read the file content to determine its length
    let fileContent = '';
    try {
        fileContent = fs.readFileSync(agentsFile, 'utf8');
    } catch (error) {
        // File doesn't exist, that's fine - we'll create it
    }

    // Insert at the end of the file
    agentEdit.insert(Uri.file(agentsFile), new Position(fileContent.split('\n').length, 0), agentCode);
    await workspace.applyEdit(agentEdit);
}


export async function injectAgentCode(name: string, serviceFile: string, injectionPosition: LinePosition) {
    // Update the service function code 
    const serviceEdit = new vscode.WorkspaceEdit();
    const serviceSourceCode = `
        string stringResult = check _${name}Agent->run(request.message, request.sessionId);
        return {message: stringResult};
`;
    serviceEdit.insert(Uri.file(serviceFile), new Position(injectionPosition.line, 0), serviceSourceCode);
    await workspace.applyEdit(serviceEdit);
}
