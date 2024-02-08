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
import { PartialSTRequest, PartialSTResponse, STModifyRequest, SymbolInfoRequest, SymbolInfoResponse } from "../../interfaces/ballerina";
import {
    BallerinaVersionResponse,
    CodeActionRequest,
    CodeActionResponse,
    CompletionRequest,
    CompletionResponse,
    DefinitionPositionRequest,
    DiagnosticsResponse,
    ProjectComponentsRequest,
    BallerinaProjectComponents,
    RenameRequest,
    RenameResponse,
    STByRangeRequest,
    STRequest,
    SyntaxTreeResponse,
    UpdateFileContentRequest,
    UpdateFileContentResponse,
    TypeFromExpressionRequest,
    TypesFromExpressionResponse,
    TypeFromSymbolRequest,
    TypesFromSymbolResponse,
    TypesFromFnDefinitionRequest,
    DefinitionResponse,
    ExecutorPositionsRequest,
    ExecutorPositionsResponse,
    DidOpenRequest,
    DidChangeRequest,
    DidCloseRequest
} from "./interfaces";
import { RequestType, NotificationType } from "vscode-messenger-common";

const _preFix = "lang-server";
export const getSyntaxTree: RequestType<void, SyntaxTreeResponse> = { method: `${_preFix}/getSyntaxTree` };
export const getST: RequestType<STRequest, SyntaxTreeResponse> = { method: `${_preFix}/getST` };
export const getSTByRange: RequestType<STByRangeRequest, SyntaxTreeResponse> = { method: `${_preFix}/getSTByRange` };
export const getBallerinaProjectComponents: RequestType<ProjectComponentsRequest, BallerinaProjectComponents> = { method: `${_preFix}/getBallerinaProjectComponents` };
export const getBallerinaVersion: RequestType<void, BallerinaVersionResponse> = { method: `${_preFix}/getBallerinaVersion` };
export const getCompletion: RequestType<CompletionRequest, CompletionResponse> = { method: `${_preFix}/getCompletion` };
export const getDiagnostics: RequestType<STRequest, DiagnosticsResponse> = { method: `${_preFix}/getDiagnostics` };
export const codeAction: RequestType<CodeActionRequest, CodeActionResponse> = { method: `${_preFix}/codeAction` };
export const rename: RequestType<RenameRequest, RenameResponse> = { method: `${_preFix}/rename` };
export const getDefinitionPosition: RequestType<DefinitionPositionRequest, SyntaxTreeResponse> = { method: `${_preFix}/getDefinitionPosition` };
export const stModify: RequestType<STModifyRequest, SyntaxTreeResponse> = { method: `${_preFix}/stModify` };
export const updateFileContent: RequestType<UpdateFileContentRequest, UpdateFileContentResponse> = { method: `${_preFix}/updateFileContent` };
export const getTypeFromExpression: RequestType<TypeFromExpressionRequest, TypesFromExpressionResponse> = { method: `${_preFix}/getTypeFromExpression` };
export const getTypeFromSymbol: RequestType<TypeFromSymbolRequest, TypesFromSymbolResponse> = { method: `${_preFix}/getTypeFromSymbol` };
export const getTypesFromFnDefinition: RequestType<TypesFromFnDefinitionRequest, TypesFromSymbolResponse> = { method: `${_preFix}/getTypesFromFnDefinition` };
export const definition: RequestType<DefinitionPositionRequest, DefinitionResponse> = { method: `${_preFix}/definition` };
export const getSTForFunction: RequestType<STModifyRequest, SyntaxTreeResponse> = { method: `${_preFix}/getSTForFunction` };
export const getExecutorPositions: RequestType<ExecutorPositionsRequest, ExecutorPositionsResponse> = { method: `${_preFix}/getExecutorPositions` };
export const getSTForExpression: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${_preFix}/getSTForExpression` };
export const getSTForSingleStatement: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${_preFix}/getSTForSingleStatement` };
export const getSTForResource: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${_preFix}/getSTForResource` };
export const getSTForModuleMembers: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${_preFix}/getSTForModuleMembers` };
export const getSTForModulePart: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${_preFix}/getSTForModulePart` };
export const getSymbolDocumentation: RequestType<SymbolInfoRequest, SymbolInfoResponse> = { method: `${_preFix}/getSymbolDocumentation` };
export const didOpen: NotificationType<DidOpenRequest> = { method: `${_preFix}/didOpen` };
export const didChange: NotificationType<DidChangeRequest> = { method: `${_preFix}/didChange` };
export const didClose: NotificationType<DidCloseRequest> = { method: `${_preFix}/didClose` };
