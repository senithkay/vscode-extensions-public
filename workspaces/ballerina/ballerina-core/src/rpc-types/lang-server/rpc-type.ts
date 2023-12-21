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
    BallerinaFunctionSTRequest,
    BallerinaSTModifyRequest,
    UpdateFileContentRequest,
    TypeFromExpressionRequest,
    TypeFromSymbolRequest,
    TypesFromExpressionResponse,
    TypesFromFnDefinitionRequest,
    TypesFromSymbolResponse,
    ExecutorPositionsResponse,
    GetBallerinaProjectParams 
} from "../..";
import { STNode } from "@wso2-enterprise/syntax-tree";
import { Location, LocationLink } from "vscode-languageserver-types";
import { RequestType, NotificationType } from "vscode-messenger-common";

const _preFix = "lang-server";
export const getSyntaxTree: RequestType<void, STNode> = { method: `${_preFix}/getSyntaxTree` };
export const getST: RequestType<GetSyntaxTreeParams, GetSyntaxTreeResponse> = { method: `${_preFix}/getST` };
export const getSTByRange: RequestType<BallerinaFunctionSTRequest, BallerinaSTModifyResponse> = { method: `${_preFix}/getSTByRange` };
export const getBallerinaProjectComponents: RequestType<GetBallerinaPackagesParams, BallerinaProjectComponents> = { method: `${_preFix}/getBallerinaProjectComponents` };
export const getCompletion: NotificationType<CompletionParams> = { method: `${_preFix}/getCompletion` };
export const getDiagnostics: NotificationType<BallerinaProjectParams> = { method: `${_preFix}/getDiagnostics` };
export const codeAction: NotificationType<CodeActionParams> = { method: `${_preFix}/codeAction` };
export const rename: RequestType<RenameParams, WorkspaceEdit> = { method: `${_preFix}/rename` };
export const getDefinitionPosition: NotificationType<TextDocumentPositionParams> = { method: `${_preFix}/getDefinitionPosition` };
export const convert: NotificationType<JsonToRecordRequest> = { method: `${_preFix}/convert` };
export const stModify: RequestType<BallerinaSTModifyRequest, BallerinaSTModifyResponse> = { method: `${_preFix}/stModify` };
export const updateFileContent: RequestType<UpdateFileContentRequest, boolean> = { method: `${_preFix}/updateFileContent` };
export const getTypeFromExpression: RequestType<TypeFromExpressionRequest, TypesFromExpressionResponse> = { method: `${_preFix}/getTypeFromExpression` };
export const getTypeFromSymbol: RequestType<TypeFromSymbolRequest, TypesFromSymbolResponse> = { method: `${_preFix}/getTypeFromSymbol` };
export const getTypesFromFnDefinition: RequestType<TypesFromFnDefinitionRequest, TypesFromSymbolResponse> = { method: `${_preFix}/getTypesFromFnDefinition` };
export const definition: NotificationType<TextDocumentPositionParams> = { method: `${_preFix}/definition` };
export const getSTForFunction: RequestType<BallerinaFunctionSTRequest, BallerinaSTModifyResponse> = { method: `${_preFix}/getSTForFunction` };
export const getExecutorPositions: RequestType<GetBallerinaProjectParams, ExecutorPositionsResponse> = { method: `${_preFix}/getExecutorPositions` };
export const didOpen: NotificationType<DidOpenTextDocumentParams> = { method: `${_preFix}/didOpen` };
export const didChange: NotificationType<DidChangeTextDocumentParams> = { method: `${_preFix}/didChange` };
export const didClose: NotificationType<DidCloseTextDocumentParams> = { method: `${_preFix}/didClose` };
