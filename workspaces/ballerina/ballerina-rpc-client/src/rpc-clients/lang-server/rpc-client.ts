/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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
    LangServerAPI,
    PartialSTRequest,
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
    codeAction,
    convert,
    definition,
    didChange,
    didClose,
    didOpen,
    getBallerinaProjectComponents,
    getCompletion,
    getDefinitionPosition,
    getDiagnostics,
    PublishDiagnosticsParams,
    getExecutorPositions,
    getST,
    getSTByRange,
    getSTForExpression,
    getSTForFunction,
    getSTForModuleMembers,
    getSTForModulePart,
    getSTForResource,
    getSTForSingleStatement,
    getSymbolDocumentation,
    getSyntaxTree,
    getTypeFromExpression,
    getTypeFromSymbol,
    getTypesFromFnDefinition,
    rename,
    stModify,
    updateFileContent,
    PartialSTResponse
} from "@wso2-enterprise/ballerina-core";
import { STNode } from "@wso2-enterprise/syntax-tree";
import { CodeAction, Location, LocationLink, WorkspaceEdit } from "vscode-languageserver-types";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class LangServerRpcClient implements LangServerAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getSyntaxTree(): Promise<STNode> {
        return this._messenger.sendRequest(getSyntaxTree, HOST_EXTENSION);
    }

    getST(params: GetSyntaxTreeParams): Promise<GetSyntaxTreeResponse> {
        return this._messenger.sendRequest(getST, HOST_EXTENSION, params);
    }

    getSTByRange(params: BallerinaFunctionSTRequest): Promise<BallerinaSTModifyResponse> {
        return this._messenger.sendRequest(getSTByRange, HOST_EXTENSION, params);
    }

    getBallerinaProjectComponents(params: GetBallerinaPackagesParams): Promise<BallerinaProjectComponents> {
        return this._messenger.sendRequest(getBallerinaProjectComponents, HOST_EXTENSION, params);
    }

    getCompletion(params: CompletionParams): Promise<CompletionResponse[]> {
        return this._messenger.sendRequest(getCompletion, HOST_EXTENSION, params);
    }

    getDiagnostics(params: BallerinaProjectParams): Promise<PublishDiagnosticsParams[]> {
        return this._messenger.sendRequest(getDiagnostics, HOST_EXTENSION, params);
    }

    codeAction(params: CodeActionParams): Promise<CodeAction[]> {
        return this._messenger.sendRequest(codeAction, HOST_EXTENSION, params);
    }

    rename(params: RenameParams): Promise<WorkspaceEdit> {
        return this._messenger.sendRequest(rename, HOST_EXTENSION, params);
    }

    getDefinitionPosition(params: TextDocumentPositionParams): Promise<BallerinaSTModifyResponse> {
        return this._messenger.sendRequest(getDefinitionPosition, HOST_EXTENSION, params);
    }

    convert(params: JsonToRecordRequest): Promise<JsonToRecordResponse> {
        return this._messenger.sendRequest(convert, HOST_EXTENSION, params);
    }

    stModify(params: BallerinaSTModifyRequest): Promise<BallerinaSTModifyResponse> {
        return this._messenger.sendRequest(stModify, HOST_EXTENSION, params);
    }

    updateFileContent(params: UpdateFileContentRequest): Promise<boolean> {
        return this._messenger.sendRequest(updateFileContent, HOST_EXTENSION, params);
    }

    getTypeFromExpression(params: TypeFromExpressionRequest): Promise<TypesFromExpressionResponse> {
        return this._messenger.sendRequest(getTypeFromExpression, HOST_EXTENSION, params);
    }

    getTypeFromSymbol(params: TypeFromSymbolRequest): Promise<TypesFromSymbolResponse> {
        return this._messenger.sendRequest(getTypeFromSymbol, HOST_EXTENSION, params);
    }

    getTypesFromFnDefinition(params: TypesFromFnDefinitionRequest): Promise<TypesFromSymbolResponse> {
        return this._messenger.sendRequest(getTypesFromFnDefinition, HOST_EXTENSION, params);
    }

    definition(params: TextDocumentPositionParams): Promise<Location | Location[] | LocationLink[] | null> {
        return this._messenger.sendRequest(definition, HOST_EXTENSION, params);
    }

    getSTForFunction(params: BallerinaSTModifyRequest): Promise<BallerinaSTModifyResponse> {
        return this._messenger.sendRequest(getSTForFunction, HOST_EXTENSION, params);
    }

    getExecutorPositions(params: GetBallerinaProjectParams): Promise<ExecutorPositionsResponse> {
        return this._messenger.sendRequest(getExecutorPositions, HOST_EXTENSION, params);
    }

    getSTForExpression(params: PartialSTRequest): Promise<PartialSTResponse> {
        return this._messenger.sendRequest(getSTForExpression, HOST_EXTENSION, params);
    }

    getSTForSingleStatement(params: PartialSTRequest): Promise<PartialSTResponse> {
        return this._messenger.sendRequest(getSTForSingleStatement, HOST_EXTENSION, params);
    }

    getSTForResource(params: PartialSTRequest): Promise<PartialSTResponse> {
        return this._messenger.sendRequest(getSTForResource, HOST_EXTENSION, params);
    }

    getSTForModuleMembers(params: PartialSTRequest): Promise<PartialSTResponse> {
        return this._messenger.sendRequest(getSTForModuleMembers, HOST_EXTENSION, params);
    }

    getSTForModulePart(params: PartialSTRequest): Promise<PartialSTResponse> {
        return this._messenger.sendRequest(getSTForModulePart, HOST_EXTENSION, params);
    }

    getSymbolDocumentation(params: SymbolInfoRequest): Promise<SymbolInfoResponse> {
        return this._messenger.sendRequest(getSymbolDocumentation, HOST_EXTENSION, params);
    }

    didOpen(params: DidOpenTextDocumentParams): void {
        return this._messenger.sendNotification(didOpen, HOST_EXTENSION, params);
    }

    didChange(params: DidChangeTextDocumentParams): void {
        return this._messenger.sendNotification(didChange, HOST_EXTENSION, params);
    }

    didClose(params: DidCloseTextDocumentParams): void {
        return this._messenger.sendNotification(didClose, HOST_EXTENSION, params);
    }
}
