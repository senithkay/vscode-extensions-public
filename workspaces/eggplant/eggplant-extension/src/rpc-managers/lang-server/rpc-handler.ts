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
    CodeActionRequest,
    CompletionRequest,
    DefinitionPositionRequest,
    DidChangeRequest,
    DidCloseRequest,
    DidOpenRequest,
    ExecutorPositionsRequest,
    PartialSTRequest,
    ProjectComponentsRequest,
    RenameRequest,
    STByRangeRequest,
    STModifyRequest,
    STRequest,
    SymbolInfoRequest,
    TypeFromExpressionRequest,
    TypeFromSymbolRequest,
    TypesFromFnDefinitionRequest,
    UpdateFileContentRequest,
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
} from "@wso2-enterprise/eggplant-core";
import { Messenger } from "vscode-messenger";
import { LangServerRpcManager } from "./rpc-manager";

export function registerLangServerRpcHandlers(messenger: Messenger) {
    const rpcManger = new LangServerRpcManager();
    messenger.onRequest(getSyntaxTree, () => rpcManger.getSyntaxTree());
    messenger.onRequest(getST, (args: STRequest) => rpcManger.getST(args));
    messenger.onRequest(getSTByRange, (args: STByRangeRequest) => rpcManger.getSTByRange(args));
    messenger.onRequest(getBallerinaProjectComponents, (args: ProjectComponentsRequest) => rpcManger.getBallerinaProjectComponents(args));
    messenger.onRequest(getBallerinaVersion, () => rpcManger.getBallerinaVersion());
    messenger.onRequest(getCompletion, (args: CompletionRequest) => rpcManger.getCompletion(args));
    messenger.onRequest(getDiagnostics, (args: STRequest) => rpcManger.getDiagnostics(args));
    messenger.onRequest(codeAction, (args: CodeActionRequest) => rpcManger.codeAction(args));
    messenger.onRequest(rename, (args: RenameRequest) => rpcManger.rename(args));
    messenger.onRequest(getDefinitionPosition, (args: DefinitionPositionRequest) => rpcManger.getDefinitionPosition(args));
    messenger.onRequest(stModify, (args: STModifyRequest) => rpcManger.stModify(args));
    messenger.onRequest(updateFileContent, (args: UpdateFileContentRequest) => rpcManger.updateFileContent(args));
    messenger.onRequest(getTypeFromExpression, (args: TypeFromExpressionRequest) => rpcManger.getTypeFromExpression(args));
    messenger.onRequest(getTypeFromSymbol, (args: TypeFromSymbolRequest) => rpcManger.getTypeFromSymbol(args));
    messenger.onRequest(getTypesFromFnDefinition, (args: TypesFromFnDefinitionRequest) => rpcManger.getTypesFromFnDefinition(args));
    messenger.onRequest(definition, (args: DefinitionPositionRequest) => rpcManger.definition(args));
    messenger.onRequest(getSTForFunction, (args: STModifyRequest) => rpcManger.getSTForFunction(args));
    messenger.onRequest(getExecutorPositions, (args: ExecutorPositionsRequest) => rpcManger.getExecutorPositions(args));
    messenger.onRequest(getSTForExpression, (args: PartialSTRequest) => rpcManger.getSTForExpression(args));
    messenger.onRequest(getSTForSingleStatement, (args: PartialSTRequest) => rpcManger.getSTForSingleStatement(args));
    messenger.onRequest(getSTForResource, (args: PartialSTRequest) => rpcManger.getSTForResource(args));
    messenger.onRequest(getSTForModuleMembers, (args: PartialSTRequest) => rpcManger.getSTForModuleMembers(args));
    messenger.onRequest(getSTForModulePart, (args: PartialSTRequest) => rpcManger.getSTForModulePart(args));
    messenger.onRequest(getSymbolDocumentation, (args: SymbolInfoRequest) => rpcManger.getSymbolDocumentation(args));
    messenger.onNotification(didOpen, (args: DidOpenRequest) => rpcManger.didOpen(args));
    messenger.onNotification(didChange, (args: DidChangeRequest) => rpcManger.didChange(args));
    messenger.onNotification(didClose, (args: DidCloseRequest) => rpcManger.didClose(args));
}
