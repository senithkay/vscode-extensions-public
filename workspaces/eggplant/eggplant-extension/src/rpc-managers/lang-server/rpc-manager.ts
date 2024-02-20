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
    BallerinaProjectComponents,
    BallerinaVersionResponse,
    CodeActionRequest,
    CodeActionResponse,
    CompletionRequest,
    CompletionResponse,
    DefinitionPositionRequest,
    DefinitionResponse,
    DiagnosticData,
    DiagnosticsResponse,
    DidChangeRequest,
    DidCloseRequest,
    DidOpenRequest,
    ExecutorPositionsRequest,
    ExecutorPositionsResponse,
    InsertorDelete,
    LangServerAPI,
    PartialSTRequest,
    PartialSTResponse,
    ProjectComponentsRequest,
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
    TypeResponse,
    TypesFromExpressionResponse,
    TypesFromFnDefinitionRequest,
    TypesFromSymbolResponse,
    UpdateFileContentRequest,
    UpdateFileContentResponse
} from "@wso2-enterprise/eggplant-core";
import { writeFileSync } from 'fs';
import { normalize } from "path";
import { Position, Range, WorkspaceEdit, extensions, workspace } from "vscode";
import { URI } from "vscode-uri";
import { StateMachine } from "../../stateMachine";

export class LangServerRpcManager implements LangServerAPI {

    async getSyntaxTree(): Promise<SyntaxTreeResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            const req: STByRangeRequest = {
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
            const node = await StateMachine.langClient().getSTByRange(req);
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

                const components = await StateMachine.langClient().getBallerinaProjectComponents({
                    documentIdentifiers: workspaceUri
                });
                resolve(components);
            } else {
                // Handle the case where there are no workspace folders
                throw new Error("No workspace folders are open");
            }
        });
    }

    async getCompletion(params: CompletionRequest): Promise<CompletionResponse> {
        return new Promise(async (resolve) => {
            const completions = await StateMachine.langClient().getCompletion(params);
            resolve({ completions });
        });
    }

    async getDiagnostics(params: STRequest): Promise<DiagnosticsResponse> {
        return new Promise(async (resolve) => {
            const diagnostics = await StateMachine.langClient().getDiagnostics(params) as DiagnosticData[];
            resolve({ diagnostics });
        });
    }

    async codeAction(params: CodeActionRequest): Promise<CodeActionResponse> {
        return new Promise(async (resolve) => {
            const codeActions = await StateMachine.langClient().codeAction(params);
            resolve({ codeActions });
        });
    }

    async rename(params: RenameRequest): Promise<RenameResponse> {
        return new Promise(async (resolve) => {
            const workspaceEdit = await StateMachine.langClient().rename(params);
            resolve({ workspaceEdit });
        });
    }

    async getDefinitionPosition(params: DefinitionPositionRequest): Promise<SyntaxTreeResponse> {
        return new Promise(async (resolve) => {
            const definition = await StateMachine.langClient().getDefinitionPosition(params) as SyntaxTreeResponse;
            resolve(definition);
        });
    }

    async getST(params: STRequest): Promise<SyntaxTreeResponse> {
        return new Promise(async (resolve) => {
            const st = await StateMachine.langClient().getSyntaxTree(params) as SyntaxTreeResponse;
            resolve(st);
        });
    }

    async getSTByRange(params: STByRangeRequest): Promise<SyntaxTreeResponse> {
        return new Promise(async (resolve) => {
            const st = await StateMachine.langClient().getSTByRange(params) as SyntaxTreeResponse;
            resolve(st);
        });
    }

    async stModify(params: STModifyRequest): Promise<SyntaxTreeResponse> {
        return new Promise(async (resolve) => {
            const st = await StateMachine.langClient().stModify({
                astModifications: await InsertorDelete(params.astModifications),
                documentIdentifier: params.documentIdentifier,
            }) as SyntaxTreeResponse;
            resolve(st);
        });
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
                    resolve({ status: true });
                }
                const status = await doc.save();
                resolve({ status });
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
            resolve({ status: false });
        });
    }

    async getTypeFromExpression(params: TypeFromExpressionRequest): Promise<TypesFromExpressionResponse> {
        return new Promise(async (resolve) => {
            const type = await StateMachine.langClient().getTypeFromExpression(params);
            resolve(type);
        });
    }

    async getTypeFromSymbol(params: TypeFromSymbolRequest): Promise<TypesFromSymbolResponse> {
        return new Promise(async (resolve) => {
            const type = await StateMachine.langClient().getTypeFromSymbol(params);
            resolve(type);
        });
    }

    async getTypesFromFnDefinition(params: TypesFromFnDefinitionRequest): Promise<TypesFromSymbolResponse> {
        return new Promise(async (resolve) => {
            const type = await StateMachine.langClient().getTypesFromFnDefinition(params);
            resolve(type);
        });
    }

    async definition(params: DefinitionPositionRequest): Promise<DefinitionResponse> {
        return new Promise(async (resolve) => {
            const location = await StateMachine.langClient().definition(params);
            resolve({ location });
        });
    }

    async getSTForFunction(params: STModifyRequest): Promise<SyntaxTreeResponse> {
        return new Promise(async (resolve) => {
            const st = await StateMachine.langClient().getSTForFunction(params) as SyntaxTreeResponse;
            resolve(st);
        });
    }

    async getExecutorPositions(params: ExecutorPositionsRequest): Promise<ExecutorPositionsResponse> {
        return new Promise(async (resolve) => {
            const position = await StateMachine.langClient().getExecutorPositions(params) as ExecutorPositionsResponse;
            resolve(position);
        });
    }

    async getSTForExpression(params: PartialSTRequest): Promise<PartialSTResponse> {
        return new Promise(async (resolve) => {
            const st = await StateMachine.langClient().getSTForExpression(params) as PartialSTResponse;
            resolve(st);
        });
    }

    async getSTForSingleStatement(params: PartialSTRequest): Promise<PartialSTResponse> {
        return new Promise(async (resolve) => {
            const st = await StateMachine.langClient().getSTForSingleStatement(params) as PartialSTResponse;
            resolve(st);
        });
    }

    async getSTForResource(params: PartialSTRequest): Promise<PartialSTResponse> {
        return new Promise(async (resolve) => {
            const st = await StateMachine.langClient().getSTForResource(params) as PartialSTResponse;
            resolve(st);
        });
    }

    async getSTForModuleMembers(params: PartialSTRequest): Promise<PartialSTResponse> {
        return new Promise(async (resolve) => {
            const st = await StateMachine.langClient().getSTForModuleMembers(params) as PartialSTResponse;
            resolve(st);
        });
    }

    async getSTForModulePart(params: PartialSTRequest): Promise<PartialSTResponse> {
        return new Promise(async (resolve) => {
            const st = await StateMachine.langClient().getSTForModulePart(params) as PartialSTResponse;
            resolve(st);
        });
    }

    async getSymbolDocumentation(params: SymbolInfoRequest): Promise<SymbolInfoResponse> {
        return new Promise(async (resolve) => {
            const st = await StateMachine.langClient().getSymbolDocumentation(params) as SymbolInfoResponse;
            resolve(st);
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
            const balExtContext = extensions.getExtension('wso2.ballerina');
            resolve({ version: balExtContext?.exports.ballerinaVersion });
        });
    }
}
