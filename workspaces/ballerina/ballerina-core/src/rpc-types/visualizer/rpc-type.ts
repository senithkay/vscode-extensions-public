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
import { CodeAction, WorkspaceEdit } from "vscode-languageserver-types";
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
    NOT_SUPPORTED_TYPE,
    GetSyntaxTreeResponse,
    GetSyntaxTreeParams,
    BallerinaFunctionSTRequest
} from "../..";
import { VisualizerLocationContext } from "../../extension-interfaces/state-machine-types";
import { STNode } from "@wso2-enterprise/syntax-tree";
import { RequestType } from "vscode-messenger-common";

const _preFix = "visualizer";
export const getVisualizerState: RequestType<void, VisualizerLocationContext> = { method: `${_preFix}/getVisualizerState` };
export const openVisualizerView: RequestType<VisualizerLocationContext, VisualizerLocationContext> = { method: `${_preFix}/openVisualizerView` };
export const getSyntaxTree: RequestType<void, STNode> = { method: `${_preFix}/getSyntaxTree` };
export const getST: RequestType<GetSyntaxTreeParams, GetSyntaxTreeResponse> = { method: `${_preFix}/getST` };
export const getSTByRange: RequestType<BallerinaFunctionSTRequest, BallerinaSTModifyResponse> = { method: `${_preFix}/getSTByRange` };
export const getBallerinaProjectComponents: RequestType<GetBallerinaPackagesParams, BallerinaProjectComponents> = { method: `${_preFix}/getBallerinaProjectComponents` };
export const getCompletion: RequestType<CompletionParams, CompletionResponse[]> = { method: `${_preFix}/getCompletion` };
export const getDiagnostics: RequestType<BallerinaProjectParams, PublishDiagnosticsParams[]> = { method: `${_preFix}/getDiagnostics` };
export const codeAction: RequestType<CodeActionParams, CodeAction[]> = { method: `${_preFix}/codeAction` };
export const rename: RequestType<RenameParams, WorkspaceEdit> = { method: `${_preFix}/rename` };
export const getDefinitionPosition: RequestType<TextDocumentPositionParams, BallerinaSTModifyResponse> = { method: `${_preFix}/getDefinitionPosition` };
export const convert: RequestType<JsonToRecordRequest, JsonToRecordResponse> = { method: `${_preFix}/convert` };
export const didOpen: RequestType<DidOpenTextDocumentParams, void> = { method: `${_preFix}/didOpen` };
export const didChange: RequestType<DidChangeTextDocumentParams, void> = { method: `${_preFix}/didChange` };
export const didClose: RequestType<DidCloseTextDocumentParams, void> = { method: `${_preFix}/didClose` };
