/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    BallerinaFunctionSTRequest,
    BallerinaProjectComponents,
    BallerinaProjectParams,
    BallerinaSTModifyRequest,
    BallerinaSTModifyResponse,
    CodeActionParams,
    CompletionParams,
    CompletionResponse,
    DidChangeTextDocumentParams,
    DidCloseTextDocumentParams,
    DidOpenTextDocumentParams,
    ExecutorPositionsResponse,
    GetBallerinaPackagesParams,
    GetBallerinaProjectParams,
    GetSyntaxTreeParams,
    GetSyntaxTreeResponse,
    JsonToRecordRequest,
    JsonToRecordResponse,
    NOT_SUPPORTED_TYPE,
    LangServerAPI,
    RenameParams,
    PublishDiagnosticsParams,
    TextDocumentPositionParams,
    TypeFromExpressionRequest,
    TypeFromSymbolRequest,
    TypesFromExpressionResponse,
    TypesFromFnDefinitionRequest,
    TypesFromSymbolResponse,
    UpdateFileContentRequest,
    InsertorDelete
} from "@wso2-enterprise/ballerina-core";
import { STNode } from "@wso2-enterprise/syntax-tree";
import { getLangClient, getService} from "../../visualizer/activator";
import { URI } from "vscode-uri";
import { getSyntaxTreeFromPosition } from "../../utils/navigation";
import { Position, Range, WorkspaceEdit, workspace } from "vscode";
import { CodeAction, WorkspaceEdit as WorkspaceEditType } from "vscode-languageserver-types";
import { writeFileSync } from 'fs';
import { normalize } from "path";
import { Location, LocationLink } from "vscode-languageserver-types";

export class LangServerRpcManager implements LangServerAPI {

    private _langClient = getLangClient();

    async getSyntaxTree(): Promise<STNode> {
        return new Promise(async (resolve) => {
            const context = getService().getSnapshot().context;
            const req: BallerinaFunctionSTRequest = {
                documentIdentifier: { uri: URI.file(context.location.fileName).toString() },
                lineRange: {
                    start : {
                        line: context.location.position.startLine,
                        character: context.location.position.startColumn
                    },
                    end : {
                        line: context.location.position.endLine,
                        character: context.location.position.endColumn
                    }
                }
            };
            const node = await getSyntaxTreeFromPosition(req);
            if (node.parseSuccess) {
                resolve(node.syntaxTree);
            } else {
                resolve(undefined);
            }
        });
    }

    async getBallerinaProjectComponents(params: GetBallerinaPackagesParams): Promise<BallerinaProjectComponents> {
        // Check if there is at least one workspace folder
        if (workspace.workspaceFolders?.length) {
            const workspaceUri = [];
            workspace.workspaceFolders.forEach(folder => {
                workspaceUri.push(
                    {
                        uri: folder.uri.toString(),
                    }
                );
            });

            return this._langClient.getBallerinaProjectComponents({
                documentIdentifiers: workspaceUri
            });
        } else {
            // Handle the case where there are no workspace folders
            throw new Error("No workspace folders are open");
        }
    }

    async getCompletion(params: CompletionParams): Promise<CompletionResponse[]> {
        return this._langClient.getCompletion(params);
    }

    async getDiagnostics(params: BallerinaProjectParams): Promise<PublishDiagnosticsParams[]|NOT_SUPPORTED_TYPE> {
        return this._langClient.getDiagnostics(params);
    }

    async codeAction(params: CodeActionParams): Promise<CodeAction[]> {
        return this._langClient.codeAction(params);
    }

    async rename(params: RenameParams): Promise<WorkspaceEditType> {
        return this._langClient.rename(params);
    }

    async getDefinitionPosition(params: TextDocumentPositionParams): Promise<BallerinaSTModifyResponse|NOT_SUPPORTED_TYPE> {
        return this._langClient.getDefinitionPosition(params);
    }

    async convert(params: JsonToRecordRequest): Promise<JsonToRecordResponse|NOT_SUPPORTED_TYPE> {
        return this._langClient.convertJsonToRecord(params);
    }

    async getST(params: GetSyntaxTreeParams): Promise<GetSyntaxTreeResponse> {
        return await this._langClient.getSyntaxTree(params) as GetSyntaxTreeResponse;
    }

    async getSTByRange(params: BallerinaFunctionSTRequest): Promise<BallerinaSTModifyResponse> {
        return await this._langClient.getSTByRange(params) as BallerinaSTModifyResponse;
    }

    async stModify(params: BallerinaSTModifyRequest): Promise<BallerinaSTModifyResponse> {
        return await this._langClient.stModify({
            astModifications: await InsertorDelete(params.astModifications),
            documentIdentifier: params.documentIdentifier,
        }) as BallerinaSTModifyResponse;
    }

    async updateFileContent(params: UpdateFileContentRequest): Promise<boolean> {
        const { fileUri, content, skipForceSave } = params;
        const normalizedFilePath = normalize(fileUri);
        const doc = workspace.textDocuments.find((doc) => normalize(doc.fileName) === normalizedFilePath);
        if (doc) {
            const edit = new WorkspaceEdit();
            edit.replace(URI.file(normalizedFilePath), new Range(new Position(0, 0), doc.lineAt(doc.lineCount - 1).range.end), content);
            await workspace.applyEdit(edit);
            this._langClient.updateStatusBar();
            if (skipForceSave) {
                // Skip saving document and keep in dirty mode
                return true;
            }
            return doc.save();
        } else {
            this._langClient.didChange({
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
            this._langClient.updateStatusBar();
        }
        return false;
    }

    async getTypeFromExpression(params: TypeFromExpressionRequest): Promise<TypesFromExpressionResponse> {
        return this._langClient.getTypeFromExpression(params);
    }

    async getTypeFromSymbol(params: TypeFromSymbolRequest): Promise<TypesFromSymbolResponse> {
        return this._langClient.getTypeFromSymbol(params);
    }

    async getTypesFromFnDefinition(params: TypesFromFnDefinitionRequest): Promise<TypesFromSymbolResponse> {
        return this._langClient.getTypesFromFnDefinition(params);
    }

    async definition(params: TextDocumentPositionParams): Promise<Location | Location[] | LocationLink[] | null> {
        return this._langClient.definition(params);
    }

    async getSTForFunction(params: BallerinaFunctionSTRequest): Promise<BallerinaSTModifyResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getExecutorPositions(params: GetBallerinaProjectParams): Promise<ExecutorPositionsResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async didOpen(params: DidOpenTextDocumentParams): Promise<void> {
        return this._langClient.didOpen(params);
    }

    async didChange(params: DidChangeTextDocumentParams): Promise<void> {
        return this._langClient.didChange(params);
    }

    async didClose(params: DidCloseTextDocumentParams): Promise<void> {
        return this._langClient.didClose(params);
    }
}
