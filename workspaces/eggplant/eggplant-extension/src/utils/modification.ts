import { LangClientInterface, STNode } from "@wso2-enterprise/eggplant-core";
import { StateMachine } from "../stateMachine";
import { normalize } from "path";
import { Position, Range, Uri, WorkspaceEdit, workspace } from "vscode";
import { URI } from "vscode-uri";
import { writeFileSync } from "fs";
import { BallerinaSTModifyResponse, STModification } from "@wso2-enterprise/ballerina-core";

interface UpdateFileContentRequest {
    fileUri: string;
    content: string;
    skipForceSave?: boolean;
}

export async function applyModifications(fileName: string, modifications: STModification[]): Promise<BallerinaSTModifyResponse> {
    const langClient = StateMachine.context().langServer as LangClientInterface;
    return await langClient.stModify({
        documentIdentifier: { uri: Uri.file(fileName).toString() },
        astModifications: modifications
    });
}

export async function updateFileContent(params: UpdateFileContentRequest): Promise<boolean> {
    const { fileUri, content, skipForceSave } = params;
    const langClient = StateMachine.context().langServer as LangClientInterface;
    const normalizedFilePath = normalize(fileUri);
    const doc = workspace.textDocuments.find((doc) => normalize(doc.fileName) === normalizedFilePath);
    if (doc) {
        const edit = new WorkspaceEdit();
        edit.replace(URI.file(normalizedFilePath), new Range(new Position(0, 0), doc.lineAt(doc.lineCount - 1).range.end), content);
        await workspace.applyEdit(edit);
        langClient.updateStatusBar();
        if (skipForceSave) {
            // Skip saving document and keep in dirty mode
            return true;
        }
        return doc.save();
    } else {
        langClient.didChange({
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
        langClient.updateStatusBar();
    }
    return true;
}