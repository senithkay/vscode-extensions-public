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
    BallerinaSTModifyResponse,
    BallerinaVersionResponse,
    CodeActionRequest,
    CodeActionResponse,
    CompletionRequest,
    CompletionResponse,
    DefinitionPositionRequest,
    DefinitionResponse,
    DiagnosticsResponse,
    DidChangeRequest,
    DidCloseRequest,
    DidOpenRequest,
    ExecutorPositionsRequest,
    ExecutorPositionsResponse,
    GetSyntaxTreeResponse,
    InsertorDelete,
    JsonToRecordRequest,
    JsonToRecordResponse,
    LangServerAPI,
    PartialSTRequest,
    PartialSTResponse,
    ProjectComponentsRequest,
    BallerinaProjectComponents,
    RenameRequest,
    RenameResponse,
    STByRangeRequest,
    STModifyRequest,
    STRequest,
    SymbolInfoRequest,
    SymbolInfoResponse,
    SyntaxTreeResponse,
    TypeFromExpressionRequest,
    TypeFromSymbolRequest,
    TypesFromExpressionResponse,
    TypesFromFnDefinitionRequest,
    TypesFromSymbolResponse,
    UpdateFileContentRequest,
    UpdateFileContentResponse
} from "@wso2-enterprise/ballerina-core";
import { writeFileSync } from 'fs';
import { normalize } from "path";
import { Position, Range, WorkspaceEdit, workspace } from "vscode";
import { URI } from "vscode-uri";
import { StateMachine } from "../../stateMachine";
import { getSyntaxTreeFromPosition } from "../../utils/navigation";
import { BallerinaFunctionSTRequest } from "@wso2-enterprise/ballerina-languageclient";
import { ballerinaExtInstance } from "../../core";

export class LangServerRpcManager implements LangServerAPI {

    async getSyntaxTree(): Promise<SyntaxTreeResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            const req: BallerinaFunctionSTRequest = {
                documentIdentifier: { uri: URI.file(context.documentUri).toString() },
                lineRange: {
                    start: {
                        line: context.position.startLine,
                        character: context.position.startColumn
                    },
                    end: {
                        line: context.position.endLine,
                        character: context.position.endColumn
                    }
                }
            };
            const node = await getSyntaxTreeFromPosition(req);
            if (node.parseSuccess) {
                resolve({ syntaxTree: node.syntaxTree });
            } else {
                resolve(undefined);
            }
        });
    }

    async getBallerinaProjectComponents(params: ProjectComponentsRequest): Promise<BallerinaProjectComponents> {
        return new Promise(async (resolve) => {
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

                return StateMachine.langClient().getBallerinaProjectComponents({
                    documentIdentifiers: workspaceUri
                });
            } else {
                // Handle the case where there are no workspace folders
                throw new Error("No workspace folders are open");
            }
        });
    }

    async getCompletion(params: CompletionRequest): Promise<CompletionResponse> {
        return new Promise(async (resolve) => {
            return StateMachine.langClient().getCompletion(params);
        });
    }

    async getDiagnostics(params: STRequest): Promise<DiagnosticsResponse> {
        return new Promise(async (resolve) => {
            return StateMachine.langClient().getDiagnostics(params);
        });
    }

    async codeAction(params: CodeActionRequest): Promise<CodeActionResponse> {
        return new Promise(async (resolve) => {
            return StateMachine.langClient().codeAction(params);
        });
    }

    async rename(params: RenameRequest): Promise<RenameResponse> {
        return new Promise(async (resolve) => {
            return StateMachine.langClient().rename(params);
        });
    }

    async getDefinitionPosition(params: DefinitionPositionRequest): Promise<SyntaxTreeResponse> {
        return new Promise(async (resolve) => {
            return StateMachine.langClient().getDefinitionPosition(params);
        });
    }

    async getST(params: STRequest): Promise<SyntaxTreeResponse> {
        return new Promise(async (resolve) => {
            return await StateMachine.langClient().getSyntaxTree(params) as GetSyntaxTreeResponse;
        });
    }

    async getSTByRange(params: STByRangeRequest): Promise<SyntaxTreeResponse> {
        return new Promise(async (resolve) => {
            return await StateMachine.langClient().getSTByRange(params) as BallerinaSTModifyResponse;
        });
    }

    async stModify(params: STModifyRequest): Promise<SyntaxTreeResponse> {
        return await StateMachine.langClient().stModify({
            astModifications: await InsertorDelete(params.astModifications),
            documentIdentifier: params.documentIdentifier,
        }) as BallerinaSTModifyResponse;
    }

    async updateFileContent(params: UpdateFileContentRequest): Promise<UpdateFileContentResponse> {
        return new Promise(async (resolve) => {
            const { fileUri, content, skipForceSave } = params;
            const normalizedFilePath = normalize(fileUri);
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
            }
            return false;
        });
    }

    async getTypeFromExpression(params: TypeFromExpressionRequest): Promise<TypesFromExpressionResponse> {
        return new Promise(async (resolve) => {
            return StateMachine.langClient().getTypeFromExpression(params);
        });
    }

    async getTypeFromSymbol(params: TypeFromSymbolRequest): Promise<TypesFromSymbolResponse> {
        return new Promise(async (resolve) => {
            return StateMachine.langClient().getTypeFromSymbol(params);
        });
    }

    async getTypesFromFnDefinition(params: TypesFromFnDefinitionRequest): Promise<TypesFromSymbolResponse> {
        return new Promise(async (resolve) => {
            return StateMachine.langClient().getTypesFromFnDefinition(params);
        });
    }

    async definition(params: DefinitionPositionRequest): Promise<DefinitionResponse> {
        return new Promise(async (resolve) => {
            return StateMachine.langClient().definition(params);
        });
    }

    async getSTForFunction(params: STModifyRequest): Promise<SyntaxTreeResponse> {
        return new Promise(async (resolve) => {
            return await StateMachine.langClient().getSTForFunction(params) as BallerinaSTModifyResponse;
        });
    }

    async getExecutorPositions(params: ExecutorPositionsRequest): Promise<ExecutorPositionsResponse> {
        return new Promise(async (resolve) => {
            return await StateMachine.langClient().getExecutorPositions(params) as ExecutorPositionsResponse;
        });
    }

    async getSTForExpression(params: PartialSTRequest): Promise<PartialSTResponse> {
        return new Promise(async (resolve) => {
            return await StateMachine.langClient().getSTForExpression(params) as PartialSTResponse;
        });
    }

    async getSTForSingleStatement(params: PartialSTRequest): Promise<PartialSTResponse> {
        return new Promise(async (resolve) => {
            return await StateMachine.langClient().getSTForSingleStatement(params) as PartialSTResponse;
        });
    }

    async getSTForResource(params: PartialSTRequest): Promise<PartialSTResponse> {
        return new Promise(async (resolve) => {
            return await StateMachine.langClient().getSTForResource(params) as PartialSTResponse;
        });
    }

    async getSTForModuleMembers(params: PartialSTRequest): Promise<PartialSTResponse> {
        return new Promise(async (resolve) => {
            return await StateMachine.langClient().getSTForModuleMembers(params) as PartialSTResponse;
        });
    }

    async getSTForModulePart(params: PartialSTRequest): Promise<PartialSTResponse> {
        return new Promise(async (resolve) => {
            return await StateMachine.langClient().getSTForModulePart(params) as PartialSTResponse;
        });
    }

    async getSymbolDocumentation(params: SymbolInfoRequest): Promise<SymbolInfoResponse> {
        return new Promise(async (resolve) => {
            return await StateMachine.langClient().getSymbolDocumentation(params) as SymbolInfoResponse;
        });
    }

    didOpen(params: DidOpenRequest): void {
        return StateMachine.langClient().didOpen(params);
    }

    didChange(params: DidChangeRequest): void {
        return StateMachine.langClient().didChange(params);
    }

    didClose(params: DidCloseRequest): void {
        return StateMachine.langClient().didClose(params);
    }

    async getBallerinaVersion(): Promise<BallerinaVersionResponse> {
        return new Promise(async (resolve) => {
            return ballerinaExtInstance.ballerinaVersion;
        });
    }
}
