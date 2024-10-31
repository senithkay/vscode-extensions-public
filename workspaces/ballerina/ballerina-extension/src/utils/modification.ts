/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { SyntaxTreeResponse, InsertorDelete, NOT_SUPPORTED_TYPE, STModification } from "@wso2-enterprise/ballerina-core";
import { normalize } from "path";
import { Position, Range, Uri, WorkspaceEdit, workspace } from "vscode";
import { URI } from "vscode-uri";
import { writeFileSync } from "fs";
import { StateMachine, updateView } from "../stateMachine";

interface UpdateFileContentRequest {
    filePath: string;
    content: string;
    skipForceSave?: boolean;
}

export async function applyModifications(fileName: string, modifications: STModification[]): Promise<SyntaxTreeResponse | NOT_SUPPORTED_TYPE> {
    const ast = await InsertorDelete(modifications);
    return await StateMachine.langClient().stModify({
        documentIdentifier: { uri: Uri.file(fileName).toString() },
        astModifications: ast
    });
}

export async function modifyFileContent(params: UpdateFileContentRequest): Promise<boolean> {
    const { filePath, content, skipForceSave } = params;
    const normalizedFilePath = normalize(filePath);
    const doc = workspace.textDocuments.find((doc) => normalize(doc.fileName) === normalizedFilePath);

    if (doc) {
        const edit = new WorkspaceEdit();
        edit.replace(URI.file(normalizedFilePath), new Range(new Position(0, 0), doc.lineAt(doc.lineCount - 1).range.end), content);
        await workspace.applyEdit(edit);
        StateMachine.langClient().updateStatusBar();
        if (skipForceSave) {
            // Skip saving document and keep in dirty mode
            return true;
        }
        return doc.save();
    } else {
        StateMachine.langClient().didChange({
            contentChanges: [
                {
                    text: content
                }
            ],
            textDocument: {
                uri: URI.file(normalizedFilePath).toString(),
                version: 1
            }
        });
        writeFileSync(normalizedFilePath, content);
        StateMachine.langClient().updateStatusBar();
        updateView();
    }

    return false;
}
