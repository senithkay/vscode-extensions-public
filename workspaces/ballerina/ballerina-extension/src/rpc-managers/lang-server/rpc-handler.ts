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
    BallerinaProjectParams,
    BallerinaSTModifyRequest,
    CodeActionParams,
    CompletionParams,
    DidChangeTextDocumentParams,
    DidCloseTextDocumentParams,
    DidOpenTextDocumentParams,
    GetBallerinaPackagesParams,
    GetBallerinaProjectParams,
    GetSyntaxTreeParams,
    JsonToRecordRequest,
    PartialSTRequest,
    RenameParams,
    SymbolInfoRequest,
    TextDocumentPositionParams,
    TypeFromExpressionRequest,
    TypeFromSymbolRequest,
    TypesFromFnDefinitionRequest,
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
import { Messenger } from "vscode-messenger";
import { LangServerRpcManager } from "./rpc-manager";

export function registerLangServerRpcHandlers(messenger: Messenger) {
    const rpcManger = new LangServerRpcManager();
    messenger.onRequest(getSyntaxTree, () => rpcManger.getSyntaxTree());
    messenger.onRequest(getST, (args: GetSyntaxTreeParams) => rpcManger.getST(args));
    messenger.onRequest(getSTByRange, (args: BallerinaFunctionSTRequest) => rpcManger.getSTByRange(args));
    messenger.onRequest(getBallerinaProjectComponents, (args: GetBallerinaPackagesParams) => rpcManger.getBallerinaProjectComponents(args));
    messenger.onRequest(getCompletion, (args: CompletionParams) => rpcManger.getCompletion(args));
    messenger.onRequest(getDiagnostics, (args: BallerinaProjectParams) => rpcManger.getDiagnostics(args));
    messenger.onRequest(codeAction, (args: CodeActionParams) => rpcManger.codeAction(args));
    messenger.onRequest(rename, (args: RenameParams) => rpcManger.rename(args));
    messenger.onRequest(getDefinitionPosition, (args: TextDocumentPositionParams) => rpcManger.getDefinitionPosition(args));
    messenger.onRequest(convert, (args: JsonToRecordRequest) => rpcManger.convert(args));
    messenger.onRequest(stModify, (args: BallerinaSTModifyRequest) => rpcManger.stModify(args));
    messenger.onRequest(updateFileContent, (args: UpdateFileContentRequest) => rpcManger.updateFileContent(args));
    messenger.onRequest(getTypeFromExpression, (args: TypeFromExpressionRequest) => rpcManger.getTypeFromExpression(args));
    messenger.onRequest(getTypeFromSymbol, (args: TypeFromSymbolRequest) => rpcManger.getTypeFromSymbol(args));
    messenger.onRequest(getTypesFromFnDefinition, (args: TypesFromFnDefinitionRequest) => rpcManger.getTypesFromFnDefinition(args));
    messenger.onRequest(definition, (args: TextDocumentPositionParams) => rpcManger.definition(args));
    messenger.onRequest(getSTForFunction, (args: BallerinaSTModifyRequest) => rpcManger.getSTForFunction(args));
    messenger.onRequest(getExecutorPositions, (args: GetBallerinaProjectParams) => rpcManger.getExecutorPositions(args));
    messenger.onRequest(getSTForExpression, (args: PartialSTRequest) => rpcManger.getSTForExpression(args));
    messenger.onRequest(getSTForSingleStatement, (args: PartialSTRequest) => rpcManger.getSTForSingleStatement(args));
    messenger.onRequest(getSTForResource, (args: PartialSTRequest) => rpcManger.getSTForResource(args));
    messenger.onRequest(getSTForModuleMembers, (args: PartialSTRequest) => rpcManger.getSTForModuleMembers(args));
    messenger.onRequest(getSTForModulePart, (args: PartialSTRequest) => rpcManger.getSTForModulePart(args));
    messenger.onRequest(getSymbolDocumentation, (args: SymbolInfoRequest) => rpcManger.getSymbolDocumentation(args));
    messenger.onNotification(didOpen, (args: DidOpenTextDocumentParams) => rpcManger.didOpen(args));
    messenger.onNotification(didChange, (args: DidChangeTextDocumentParams) => rpcManger.didChange(args));
    messenger.onNotification(didClose, (args: DidCloseTextDocumentParams) => rpcManger.didClose(args));
}
