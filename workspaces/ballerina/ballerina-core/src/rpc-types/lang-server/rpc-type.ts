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
import { WorkspaceEdit } from "vscode-languageserver-types";
import {
    BallerinaProjectComponents,
    BallerinaProjectParams,
    BallerinaSTModifyResponse,
    CodeActionParams,
    CompletionParams,
        DidChangeTextDocumentParams,
    DidCloseTextDocumentParams,
    DidOpenTextDocumentParams,
    GetBallerinaPackagesParams,
    JsonToRecordRequest,
        RenameParams,
    TextDocumentPositionParams,
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
    GetBallerinaProjectParams, 
    PartialSTResponse,
    PartialSTRequest,
    SymbolInfoRequest,
    SymbolInfoResponse,
    DiagnosticsForFnNameRequest,
    DefaultFnNameRequest,
    RecordCompletionsRequest,
    CompletionResponseWithModule,
    ExtendedDiagnostic
} from "../..";
import { STNode } from "@wso2-enterprise/syntax-tree";
import { RequestType, NotificationType } from "vscode-messenger-common";

const _preFix = "lang-server";
export const getSyntaxTree: RequestType<void, STNode> = { method: `${_preFix}/getSyntaxTree` };
export const getST: RequestType<GetSyntaxTreeParams, GetSyntaxTreeResponse> = { method: `${_preFix}/getST` };
export const getSTByRange: RequestType<BallerinaFunctionSTRequest, BallerinaSTModifyResponse> = { method: `${_preFix}/getSTByRange` };
export const getBallerinaProjectComponents: RequestType<GetBallerinaPackagesParams, BallerinaProjectComponents> = { method: `${_preFix}/getBallerinaProjectComponents` };
export const getBallerinaVersion: RequestType<void, string | undefined> = { method: `${_preFix}/getBallerinaVersion` };
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
export const getSTForFunction: RequestType<BallerinaSTModifyRequest, BallerinaSTModifyResponse> = { method: `${_preFix}/getSTForFunction` };
export const getExecutorPositions: RequestType<GetBallerinaProjectParams, ExecutorPositionsResponse> = { method: `${_preFix}/getExecutorPositions` };
export const getSTForExpression: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${_preFix}/getSTForExpression` };
export const getSTForSingleStatement: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${_preFix}/getSTForSingleStatement` };
export const getSTForResource: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${_preFix}/getSTForResource` };
export const getSTForModuleMembers: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${_preFix}/getSTForModuleMembers` };
export const getSTForModulePart: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${_preFix}/getSTForModulePart` };
export const getSymbolDocumentation: RequestType<SymbolInfoRequest, SymbolInfoResponse> = { method: `${_preFix}/getSymbolDocumentation` };
export const didOpen: NotificationType<DidOpenTextDocumentParams> = { method: `${_preFix}/didOpen` };
export const didChange: NotificationType<DidChangeTextDocumentParams> = { method: `${_preFix}/didChange` };
export const didClose: NotificationType<DidCloseTextDocumentParams> = { method: `${_preFix}/didClose` };
export const getDiagnosticsForFnName: RequestType<DiagnosticsForFnNameRequest, ExtendedDiagnostic[]> = { method: `${_preFix}/getDiagnosticsForFnName` };
export const getDefaultFnName: RequestType<DefaultFnNameRequest, string> = { method: `${_preFix}/getDefaultFnName` };
export const getRecordCompletions: RequestType<RecordCompletionsRequest, CompletionResponseWithModule[]> = { method: `${_preFix}/getRecordCompletions` };

