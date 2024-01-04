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
    DocumentIdentifier
} from "@wso2-enterprise/ballerina-core";
import { URI } from "vscode-uri";
import { Position, Range, WorkspaceEdit, workspace } from "vscode";
import { CodeAction, WorkspaceEdit as WorkspaceEditType, Location, LocationLink } from "vscode-languageserver-types";
import { writeFileSync } from 'fs';
import { STNode } from "@wso2-enterprise/syntax-tree";
import { stateService } from "../../stateMachine";
import { LangClientInterface } from "@wso2-enterprise/eggplant-core";
import { normalize } from "path";

export class LangServerRpcManager implements LangServerAPI {

    async getSyntaxTree(): Promise<STNode> {
        const context = stateService.getSnapshot().context;
        const langClient = context.langServer as LangClientInterface;
        return new Promise(async (resolve) => {
            if (context?.position) {
                const req: BallerinaFunctionSTRequest = {
                    documentIdentifier: { uri: URI.file(context.fileName!).toString() },
                    lineRange: {
                        start : {
                            line: context.position.startLine || 0,
                            character: context.position.startColumn || 0
                        },
                        end : {
                            line: context.position.endLine || 0,
                            character: context.position.endColumn || 0
                        }
                    }
                };
                const node = await langClient.getSTByRange(req);
                if (node.parseSuccess) {
                    resolve(node.syntaxTree);
                }
            }
        });
    }

    async getBallerinaProjectComponents(params: any): Promise<BallerinaProjectComponents> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        // Check if there is at least one workspace folder
        if (workspace.workspaceFolders?.length) {
            const workspaceUri: { uri: string }[] = [];
            workspace.workspaceFolders.forEach(folder => {
                workspaceUri.push(
                    {
                        uri: folder.uri.toString(),
                    }
                );
            });
            return langClient.getBallerinaProjectComponents({
                documentIdentifiers: workspaceUri
            });
        } else {
            // Handle the case where there are no workspace folders
            throw new Error("No workspace folders are open");
        }
    }

    async getCompletion(params: CompletionParams): Promise<CompletionResponse[]> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return langClient.getCompletion(params);
    }

    async getDiagnostics(params: BallerinaProjectParams): Promise<PublishDiagnosticsParams[]|NOT_SUPPORTED_TYPE> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return langClient.getDiagnostics(params);
    }

    async codeAction(params: CodeActionParams): Promise<CodeAction[]> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return langClient.codeAction(params);
    }

    async rename(params: RenameParams): Promise<WorkspaceEditType> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return langClient.rename(params);
    }

    async getDefinitionPosition(params: TextDocumentPositionParams): Promise<BallerinaSTModifyResponse|NOT_SUPPORTED_TYPE> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return langClient.getDefinitionPosition(params);
    }

    async convert(params: JsonToRecordRequest): Promise<JsonToRecordResponse|NOT_SUPPORTED_TYPE> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return langClient.convertJsonToRecord(params);
    }

    async getST(params: GetSyntaxTreeParams): Promise<GetSyntaxTreeResponse> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return await langClient.getSyntaxTree(params) as GetSyntaxTreeResponse;
    }

    async getSTByRange(params: BallerinaFunctionSTRequest): Promise<BallerinaSTModifyResponse> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return await langClient.getSTByRange(params) as BallerinaSTModifyResponse;
    }

    async stModify(params: BallerinaSTModifyRequest): Promise<BallerinaSTModifyResponse> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return await langClient.stModify({
            astModifications: params.astModifications,
            documentIdentifier: params.documentIdentifier,
        }) as BallerinaSTModifyResponse;
    }

    async updateFileContent(params: UpdateFileContentRequest): Promise<boolean> {
        const { fileUri, content, skipForceSave } = params;
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
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
        return false;
    }

    async getSTForFunction(params: BallerinaFunctionSTRequest): Promise<BallerinaSTModifyResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getExecutorPositions(params: GetBallerinaProjectParams): Promise<ExecutorPositionsResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getTypeFromExpression(params: TypeFromExpressionRequest): Promise<TypesFromExpressionResponse> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return langClient.getTypeFromExpression(params);
    }

    async getTypeFromSymbol(params: TypeFromSymbolRequest): Promise<TypesFromSymbolResponse> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return langClient.getTypeFromSymbol(params);
    }

    async getTypesFromFnDefinition(params: TypesFromFnDefinitionRequest): Promise<TypesFromSymbolResponse> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return langClient.getTypesFromFnDefinition(params);
    }

    async definition(params: TextDocumentPositionParams): Promise<Location | Location[] | LocationLink[] | null> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return langClient.definition(params);
    }

    async didOpen(params: DidOpenTextDocumentParams): Promise<void> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return langClient.didOpen(params);
    }

    async didChange(params: DidChangeTextDocumentParams): Promise<void> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return langClient.didChange(params);
    }

    async didClose(params: DidCloseTextDocumentParams): Promise<void> {
        const langClient = stateService.getSnapshot().context.langServer as LangClientInterface;
        return langClient.didClose(params);
    }
}
