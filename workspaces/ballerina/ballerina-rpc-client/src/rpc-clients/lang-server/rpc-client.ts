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
    BallerinaProjectComponents,
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
    TypesFromExpressionResponse,
    TypesFromFnDefinitionRequest,
    TypesFromSymbolResponse,
    UpdateFileContentRequest,
    UpdateFileContentResponse,
    codeAction,
    definition,
    didChange,
    didClose,
    didOpen,
    getBallerinaProjectComponents,
    getBallerinaVersion,
    getCompletion,
    getDefinitionPosition,
    getDiagnostics,
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
    updateFileContent
} from "@wso2-enterprise/ballerina-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class LangServerRpcClient implements LangServerAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getSyntaxTree(): Promise<SyntaxTreeResponse> {
        return this._messenger.sendRequest(getSyntaxTree, HOST_EXTENSION);
    }

    getST(params: STRequest): Promise<SyntaxTreeResponse> {
        return this._messenger.sendRequest(getST, HOST_EXTENSION, params);
    }

    getSTByRange(params: STByRangeRequest): Promise<SyntaxTreeResponse> {
        return this._messenger.sendRequest(getSTByRange, HOST_EXTENSION, params);
    }

    getBallerinaProjectComponents(params: ProjectComponentsRequest): Promise<BallerinaProjectComponents> {
        return this._messenger.sendRequest(getBallerinaProjectComponents, HOST_EXTENSION, params);
    }

    getBallerinaVersion(): Promise<BallerinaVersionResponse> {
        return this._messenger.sendRequest(getBallerinaVersion, HOST_EXTENSION);
    }

    getCompletion(params: CompletionRequest): Promise<CompletionResponse> {
        return this._messenger.sendRequest(getCompletion, HOST_EXTENSION, params);
    }

    getDiagnostics(params: STRequest): Promise<DiagnosticsResponse> {
        return this._messenger.sendRequest(getDiagnostics, HOST_EXTENSION, params);
    }

    codeAction(params: CodeActionRequest): Promise<CodeActionResponse> {
        return this._messenger.sendRequest(codeAction, HOST_EXTENSION, params);
    }

    rename(params: RenameRequest): Promise<RenameResponse> {
        return this._messenger.sendRequest(rename, HOST_EXTENSION, params);
    }

    getDefinitionPosition(params: DefinitionPositionRequest): Promise<SyntaxTreeResponse> {
        return this._messenger.sendRequest(getDefinitionPosition, HOST_EXTENSION, params);
    }

    stModify(params: STModifyRequest): Promise<SyntaxTreeResponse> {
        return this._messenger.sendRequest(stModify, HOST_EXTENSION, params);
    }

    updateFileContent(params: UpdateFileContentRequest): Promise<UpdateFileContentResponse> {
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

    definition(params: DefinitionPositionRequest): Promise<DefinitionResponse> {
        return this._messenger.sendRequest(definition, HOST_EXTENSION, params);
    }

    getSTForFunction(params: STModifyRequest): Promise<SyntaxTreeResponse> {
        return this._messenger.sendRequest(getSTForFunction, HOST_EXTENSION, params);
    }

    getExecutorPositions(params: ExecutorPositionsRequest): Promise<ExecutorPositionsResponse> {
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

    didOpen(params: DidOpenRequest): void {
        return this._messenger.sendNotification(didOpen, HOST_EXTENSION, params);
    }

    didChange(params: DidChangeRequest): void {
        return this._messenger.sendNotification(didChange, HOST_EXTENSION, params);
    }

    didClose(params: DidCloseRequest): void {
        return this._messenger.sendNotification(didClose, HOST_EXTENSION, params);
    }
}
