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
    BallerinaProjectParams,
    BallerinaSTModifyResponse,
    CodeActionParams,
    CompletionParams,
    CompletionResponse,
    DidChangeTextDocumentParams,
    DidCloseTextDocumentParams,
    DidOpenTextDocumentParams,
    GetBallerinaPackagesParams,
    JsonToRecordRequest,
    JsonToRecordResponse,
    PublishDiagnosticsParams,
    RenameParams,
    TextDocumentPositionParams,
    VisualizerAPI,
    VisualizerLocationContext,
    getBallerinaProjectComponents,
    getSyntaxTree,
    getVisualizerState,
    openVisualizerView,
    getCompletion,
    getDiagnostics,
    codeAction,
    rename,
    getDefinitionPosition,
    convert,
    stModify,
    didOpen,
    didChange,
    didClose,
    GetSyntaxTreeParams,
    GetSyntaxTreeResponse,
    getST,
    getSTByRange,
    BallerinaFunctionSTRequest,
    BallerinaSTModifyRequest
} from "@wso2-enterprise/ballerina-core";
import { WorkspaceEdit } from "vscode-languageserver-types";
import { STNode } from "@wso2-enterprise/syntax-tree";
import { CodeAction } from "vscode-languageserver-types";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class VisualizerRpcClient implements VisualizerAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getVisualizerState(): Promise<VisualizerLocationContext> {
        return this._messenger.sendRequest(getVisualizerState, HOST_EXTENSION);
    }

    openVisualizerView(params: VisualizerLocationContext): Promise<VisualizerLocationContext> {
        return this._messenger.sendRequest(openVisualizerView, HOST_EXTENSION, params);
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

    didOpen(params: DidOpenTextDocumentParams): Promise<void> {
        return this._messenger.sendRequest(didOpen, HOST_EXTENSION, params);
    }

    didChange(params: DidChangeTextDocumentParams): Promise<void>  {
        return this._messenger.sendRequest(didChange, HOST_EXTENSION, params);
    }

    didClose(params: DidCloseTextDocumentParams): Promise<void>  {
        return this._messenger.sendRequest(didClose, HOST_EXTENSION, params);
    }
}
