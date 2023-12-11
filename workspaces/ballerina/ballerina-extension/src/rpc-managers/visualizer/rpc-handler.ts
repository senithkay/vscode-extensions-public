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
    GetSyntaxTreeParams,
    JsonToRecordRequest,
    RenameParams,
    TextDocumentPositionParams,
    UpdateFileContentRequest,
    VisualizerLocationContext,
    codeAction,
    convert,
    didChange,
    didClose,
    didOpen,
    getBallerinaProjectComponents,
    getCompletion,
    getDefinitionPosition,
    getDiagnostics,
    getST,
    getSTByRange,
    getSyntaxTree,
    getVisualizerState,
    openVisualizerView,
    updateVisualizerView,
    rename,
    stModify,
    updateFileContent
} from "@wso2-enterprise/ballerina-core";
import { Messenger } from "vscode-messenger";
import { VisualizerRpcManager } from "./rpc-manager";

export function registerVisualizerRpcHandlers(messenger: Messenger) {
    const rpcManger = new VisualizerRpcManager();
    messenger.onRequest(getVisualizerState, () => rpcManger.getVisualizerState());
    messenger.onRequest(openVisualizerView, (args: VisualizerLocationContext) => rpcManger.openVisualizerView(args));
    messenger.onRequest(updateVisualizerView, (args: VisualizerLocationContext) => rpcManger.openVisualizerView(args));
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
    messenger.onRequest(didOpen, (args: DidOpenTextDocumentParams) => rpcManger.didOpen(args));
    messenger.onRequest(didChange, (args: DidChangeTextDocumentParams) => rpcManger.didChange(args));
    messenger.onRequest(didClose, (args: DidCloseTextDocumentParams) => rpcManger.didClose(args));
}
