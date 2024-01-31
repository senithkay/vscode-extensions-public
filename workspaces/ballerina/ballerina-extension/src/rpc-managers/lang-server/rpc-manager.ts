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
    DefaultFnNameRequest,
    DiagnosticsForFnNameRequest,
    DidChangeTextDocumentParams,
    DidCloseTextDocumentParams,
    DidOpenTextDocumentParams,
    ExecutorPositionsResponse,
    GetBallerinaPackagesParams,
    GetBallerinaProjectParams,
    GetSyntaxTreeParams,
    GetSyntaxTreeResponse,
    InsertorDelete,
    JsonToRecordRequest,
    JsonToRecordResponse,
    NOT_SUPPORTED_TYPE,
    LangServerAPI,
    PublishDiagnosticsParams,
    RecordCompletionsRequest,
    RenameParams,
    SymbolInfoRequest,
    SymbolInfoResponse,
    TextDocumentPositionParams,
    TypeFromExpressionRequest,
    TypeFromSymbolRequest,
    TypesFromExpressionResponse,
    TypesFromFnDefinitionRequest,
    TypesFromSymbolResponse,
    UpdateFileContentRequest,
    PartialSTRequest,
    PartialSTResponse,
    CompletionResponseWithModule,
    updateFunctionSignature,
    createFunctionSignature,
    getSource,
    addToTargetPosition,
    getSelectedDiagnostics,
    ExtendedDiagnostic
} from "@wso2-enterprise/ballerina-core";
import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import { getBallerinaVersion, getLangClient, getService} from "../../visualizer/activator";
import { URI } from "vscode-uri";
import { getSyntaxTreeFromPosition } from "../../utils/navigation";
import { Position, Range, WorkspaceEdit, workspace } from "vscode";
import { CodeAction, CompletionItemKind, WorkspaceEdit as WorkspaceEditType } from "vscode-languageserver-types";
import { writeFileSync } from 'fs';
import { normalize } from "path";
import { Location, LocationLink } from "vscode-languageserver-types";
import { STModification } from "@wso2-enterprise/ballerina-languageclient";
import { DM_DEFAULT_FUNCTION_NAME, EXPR_SCHEME, FILE_SCHEME, getVirtualDiagnostics } from "./utils";

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

    async getSTForFunction(params: BallerinaSTModifyRequest): Promise<BallerinaSTModifyResponse> {
        return await this._langClient.getSTForFunction(params) as BallerinaSTModifyResponse;
    }

    async getExecutorPositions(params: GetBallerinaProjectParams): Promise<ExecutorPositionsResponse> {
        return await this._langClient.getExecutorPositions(params) as ExecutorPositionsResponse;
    }

    async getSTForExpression(params: PartialSTRequest): Promise<PartialSTResponse> {
        return await this._langClient.getSTForExpression(params) as PartialSTResponse;
    }

    async getSTForSingleStatement(params: PartialSTRequest): Promise<PartialSTResponse> {
        return await this._langClient.getSTForSingleStatement(params) as PartialSTResponse;
    }

    async getSTForResource(params: PartialSTRequest): Promise<PartialSTResponse> {
        return await this._langClient.getSTForResource(params) as PartialSTResponse;
    }

    async getSTForModuleMembers(params: PartialSTRequest): Promise<PartialSTResponse> {
        return await this._langClient.getSTForModuleMembers(params) as PartialSTResponse;
    }

    async getSTForModulePart(params: PartialSTRequest): Promise<PartialSTResponse> {
        return await this._langClient.getSTForModulePart(params) as PartialSTResponse;
    }

    async getSymbolDocumentation(params: SymbolInfoRequest): Promise<SymbolInfoResponse> {
        return await this._langClient.getSymbolDocumentation(params) as SymbolInfoResponse;
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

    async getBallerinaVersion(): Promise<string | undefined> {
        return getBallerinaVersion();
    }

    async getDiagnosticsForFnName(params: DiagnosticsForFnNameRequest): Promise<ExtendedDiagnostic[]> {
        const parametersStr = params.inputParams
        .map((item) => `${item.type} ${item.name}`)
        .join(",");
        const returnTypeStr = params.outputType ? `returns ${params.outputType}` : '';

        let stModification: STModification;
        let fnConfigPosition: NodePosition;
        let diagTargetPosition: NodePosition;
        if (params.fnST && STKindChecker.isFunctionDefinition(params.fnST)) {
            fnConfigPosition = {
                ...params.fnST?.functionSignature?.position as NodePosition,
                startLine: (params.fnST.functionName.position as NodePosition)?.startLine,
                startColumn: (params.fnST.functionName.position as NodePosition)?.startColumn
            };
            diagTargetPosition = {
                startLine: (params.fnST.functionName.position as NodePosition).startLine,
                startColumn: (params.fnST.functionName.position as NodePosition).startColumn,
                endLine: (params.fnST.functionName.position as NodePosition).endLine,
                endColumn: (params.fnST.functionName.position as NodePosition).startColumn + params.name.length
            };
            stModification = updateFunctionSignature(params.name, parametersStr, returnTypeStr, fnConfigPosition);
        } else {
            fnConfigPosition = params.targetPosition;
            const fnNameStartColumn = "function ".length + 1;
            diagTargetPosition = {
                startLine: params.targetPosition.startLine + 1,
                startColumn: params.targetPosition.startColumn + fnNameStartColumn,
                endLine: params.targetPosition.endLine + 1,
                endColumn: params.targetPosition.endColumn + (fnNameStartColumn + params.name.length)
            };
            stModification = createFunctionSignature(
                "",
                params.name,
                parametersStr,
                returnTypeStr,
                params.targetPosition,
                false,
                true,
                params.outputType ? `{}` : `()`  // TODO: Find default value for selected output type when DM supports types other than records
            );
        }
        const source = getSource(stModification);
        const content = addToTargetPosition(params.currentFileContent, fnConfigPosition, source);

        const diagnostics = await getVirtualDiagnostics(params.filePath, params.currentFileContent, content);

        return getSelectedDiagnostics(diagnostics, diagTargetPosition, 0, params.name.length);
    }

    async getDefaultFnName(params: DefaultFnNameRequest): Promise<string> {
        const completionParams: CompletionParams = {
            textDocument: {
                uri: URI.file(params.filePath).toString()
            },
            position: {
                character: params.targetPosition.endColumn,
                line: params.targetPosition.endLine
            },
            context: {
                triggerKind: 3
            }
        };
        const completions = await this._langClient.getCompletion(completionParams);
        const existingFnNames = completions.map((completion) => {
            if (completion.kind === CompletionItemKind.Function) {
                return completion?.filterText;
            }
        }).filter((name) => name !== undefined);
    
        let suffixIndex = 2;
        while (existingFnNames.includes(`${DM_DEFAULT_FUNCTION_NAME}${suffixIndex}`)) {
            suffixIndex++;
        }
    
        return `${DM_DEFAULT_FUNCTION_NAME}${suffixIndex}`;
    }

    async getRecordCompletions(params: RecordCompletionsRequest): Promise<CompletionResponseWithModule[]> {
        const typeLabelsToIgnore = ["StrandData"];
        const completionMap = new Map<string, CompletionResponseWithModule>();

        const completionParams: CompletionParams = {
            textDocument: { uri: URI.file(params.path).toString() },
            position: { character: 0, line: 0 },
            context: { triggerKind: 22 },
        };

        const completions = await this._langClient.getCompletion(completionParams);
        const recCompletions = completions.filter((item) => item.kind === CompletionItemKind.Struct);
        recCompletions.forEach((item) => completionMap.set(item.insertText, item));

        if (params.importStatements.length > 0) {

            const exprFileUrl = URI.file(params.path).toString().replace(FILE_SCHEME, EXPR_SCHEME);
            this._langClient.didOpen({
                textDocument: {
                    languageId: "ballerina",
                    text: params.currentFileContent,
                    uri: exprFileUrl,
                    version: 1,
                },
            });

            for (const importStr of params.importStatements) {
                const moduleName = importStr.split("/").pop().split(".").pop().replace(";", "");
                const updatedContent = addToTargetPosition(
                    params.currentFileContent,
                    {
                        startLine: params.fnSTPosition.endLine,
                        startColumn: params.fnSTPosition.endColumn,
                        endLine: params.fnSTPosition.endLine,
                        endColumn: params.fnSTPosition.endColumn,
                    },
                    `${moduleName}:`
                );

                this._langClient.didChange({
                    textDocument: { uri: exprFileUrl, version: 1 },
                    contentChanges: [{ text: updatedContent }],
                });

                const importCompletions = await this._langClient.getCompletion({
                    textDocument: { uri: exprFileUrl },
                    position: { character: params.fnSTPosition.endColumn + moduleName.length + 1, line: params.fnSTPosition.endLine },
                    context: { triggerKind: 22 },
                });

                const importRecCompletions = importCompletions.filter((item) => item.kind === CompletionItemKind.Struct);

                importRecCompletions.forEach((item) => {
                    if (!completionMap.has(`${item.insertText}${moduleName}`)) {
                        completionMap.set(`${item.insertText}${moduleName}`, { ...item, module: moduleName });
                    }
                });
            }
            this._langClient.didChange({
                textDocument: { uri: exprFileUrl, version: 1 },
                contentChanges: [{ text: params.currentFileContent }],
            });

            this._langClient.didClose({ textDocument: { uri: exprFileUrl } });
        }

        const allCompletions = Array.from(completionMap.values()).filter(
            (item) => !(typeLabelsToIgnore.includes(item.label) || item.label.startsWith("("))
        );

        return allCompletions;
    }
}

