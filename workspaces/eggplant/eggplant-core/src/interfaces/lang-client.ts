/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    STByRangeRequest,
    BallerinaProjectComponents,
    BallerinaProjectParams,
    STModifyRequest,
    BallerinaSTModifyResponse,
    CodeActionRequest,
    CompletionParams,
    Completion,
    DidChangeRequest,
    DidCloseRequest,
    DidOpenRequest,
    ExecutorPositionsResponse,
    ProjectComponentsRequest,
    GetBallerinaProjectParams,
    GetSyntaxTreeParams,
    GetSyntaxTreeResponse,
    JsonToRecordRequest,
    JsonToRecordResponse,
    NOT_SUPPORTED_TYPE,
    PartialSTRequest,
    PartialSTResponse,
    DiagnosticData,
    RenameRequest,
    SymbolInfoRequest,
    SymbolInfoResponse,
    DefinitionPositionRequest,
    TypeFromExpressionRequest,
    TypeFromSymbolRequest,
    TypesFromExpressionResponse,
    TypesFromFnDefinitionRequest,
    TypesFromSymbolResponse,
    XMLToRecordRequest,
    XMLToRecordResponse
} from "@wso2-enterprise/ballerina-core";
import { LanguageClient } from "vscode-languageclient/node";
import { Location, LocationLink, WorkspaceEdit as WorkspaceEditType } from "vscode-languageserver-types";
import { CodeAction } from "vscode-languageserver-types";
import { EggplantModelRequest, EggplantModelResponse, UpdateNodeRequest, UpdateNodeResponse } from "../rpc-types/eggplant-diagram/interfaces";

export interface LangClientInterface extends LanguageClient {
    getBallerinaProjectComponents: (params: ProjectComponentsRequest) => Promise<BallerinaProjectComponents>;
    getSTByRange: (params: STByRangeRequest) => Promise<BallerinaSTModifyResponse>;
    getEggplantModel: (params: EggplantModelRequest) => Promise<EggplantModelResponse>;
    getUpdatedNodeModifications: (params: UpdateNodeRequest) => Promise<UpdateNodeResponse>;
    stModify: (params: STModifyRequest) => Thenable<BallerinaSTModifyResponse>;
    didChange(params: DidChangeRequest): void;
    didOpen: (Params: DidOpenRequest) => void;
    didClose: (params: DidCloseRequest) => void;
    getSyntaxTree: (params: GetSyntaxTreeParams) => Thenable<GetSyntaxTreeResponse>;
    definition: (params: DefinitionPositionRequest) => Promise<Location | Location[] | LocationLink[] | null> ;
    getDiagnostics: (params: BallerinaProjectParams) => Thenable<DiagnosticData[]>;
    getCompletion: (params: CompletionParams) => Thenable<Completion[]>;
    getTypeFromExpression: (params: TypeFromExpressionRequest) => Thenable<TypesFromExpressionResponse>;
    getTypeFromSymbol: (params: TypeFromSymbolRequest) => Thenable<TypesFromSymbolResponse>;
    getTypesFromFnDefinition: (params: TypesFromFnDefinitionRequest) => Thenable<TypesFromSymbolResponse>;
    convert: (params: JsonToRecordRequest) => Thenable<JsonToRecordResponse>;
    convertXml: (params: XMLToRecordRequest) => Thenable<XMLToRecordResponse>;
    rename: (params: RenameRequest) => Thenable<WorkspaceEditType>;
    codeAction: (params: CodeActionRequest) => Promise<CodeAction[]>;
    getDefinitionPosition(params: DefinitionPositionRequest): Promise<BallerinaSTModifyResponse | NOT_SUPPORTED_TYPE>;
    convertJsonToRecord(params: JsonToRecordRequest): Promise<JsonToRecordResponse | NOT_SUPPORTED_TYPE>;
    updateStatusBar(): void;
    getSTForFunction: (params: STModifyRequest) => Promise<BallerinaSTModifyResponse>;
    getExecutorPositions: (params: GetBallerinaProjectParams) => Promise<ExecutorPositionsResponse>;
    getSTForExpression: (params: PartialSTRequest) => Promise<PartialSTResponse | NOT_SUPPORTED_TYPE>;
    getSTForSingleStatement: (params: PartialSTRequest) => Promise<PartialSTResponse | NOT_SUPPORTED_TYPE>;
    getSTForResource: (params: PartialSTRequest) => Promise<PartialSTResponse | NOT_SUPPORTED_TYPE>;
    getSTForModuleMembers: (params: PartialSTRequest) => Promise<PartialSTResponse | NOT_SUPPORTED_TYPE>;
    getSTForModulePart: (params: PartialSTRequest) => Promise<PartialSTResponse | NOT_SUPPORTED_TYPE>;
    getSymbolDocumentation: (params: SymbolInfoRequest) => Promise<SymbolInfoResponse>;
}
