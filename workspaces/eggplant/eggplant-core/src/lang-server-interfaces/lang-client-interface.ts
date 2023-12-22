/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    BallerinaFunctionSTRequest,
    BallerinaProjectComponents,
    BallerinaProjectParams,
    BallerinaSTModifyRequest,
    BallerinaSTModifyResponse,
    CodeActionParams,
    CompletionParams,
    CompletionResponse,
    DidChangeTextDocumentParams,
    DidCloseTextDocumentParams,
    DidOpenTextDocumentParams,
    GetBallerinaPackagesParams,
    GetSyntaxTreeParams,
    GetSyntaxTreeResponse,
    JsonToRecordRequest,
    JsonToRecordResponse,
    NOT_SUPPORTED_TYPE,
    PublishDiagnosticsParams,
    RenameParams,
    TextDocumentPositionParams,
    TypeFromExpressionRequest,
    TypeFromSymbolRequest,
    TypesFromExpressionResponse,
    TypesFromFnDefinitionRequest,
    TypesFromSymbolResponse,
    XMLToRecordRequest,
    XMLToRecordResponse
} from "@wso2-enterprise/ballerina-core";
import { Flow, LinePosition } from "../rpc-types/webview/types";
import { LanguageClient } from "vscode-languageclient/node";
import { Location, LocationLink, WorkspaceEdit as WorkspaceEditType } from "vscode-languageserver-types";
import { CodeAction } from "vscode-languageserver-types";
export interface EggplantModelRequest {
    filePath: string;
    startLine: LinePosition;
    endLine: LinePosition;
}
export interface EggplantModelRequest {
    filePath: string;
    startLine: LinePosition;
    endLine: LinePosition;
}
export interface LangClientInterface extends LanguageClient {
    getBallerinaProjectComponents: (params: GetBallerinaPackagesParams) => Promise<BallerinaProjectComponents>;
    getSTByRange: (params: BallerinaFunctionSTRequest) => Promise<BallerinaSTModifyResponse>;
    getEggplantModel: (params: EggplantModelRequest) => Promise<Flow>;
    stModify: (params: BallerinaSTModifyRequest) => Thenable<BallerinaSTModifyResponse>;
    didChange(params: DidChangeTextDocumentParams): Promise<void>;
    didOpen: (Params: DidOpenTextDocumentParams) => void;
    didClose: (params: DidCloseTextDocumentParams) => void;
    getSyntaxTree: (params: GetSyntaxTreeParams) => Thenable<GetSyntaxTreeResponse>;
    definition: (params: TextDocumentPositionParams) => Promise<Location | Location[] | LocationLink[] | null> ;
    getDiagnostics: (params: BallerinaProjectParams) => Thenable<PublishDiagnosticsParams[]>;
    getCompletion: (params: CompletionParams) => Thenable<CompletionResponse[]>;
    getTypeFromExpression: (params: TypeFromExpressionRequest) => Thenable<TypesFromExpressionResponse>;
    getTypeFromSymbol: (params: TypeFromSymbolRequest) => Thenable<TypesFromSymbolResponse>;
    getTypesFromFnDefinition: (params: TypesFromFnDefinitionRequest) => Thenable<TypesFromSymbolResponse>;
    convert: (params: JsonToRecordRequest) => Thenable<JsonToRecordResponse>;
    convertXml: (params: XMLToRecordRequest) => Thenable<XMLToRecordResponse>;
    rename: (params: RenameParams) => Thenable<WorkspaceEditType>;
    codeAction: (params: CodeActionParams) => Promise<CodeAction[]>;
    getDefinitionPosition(params: TextDocumentPositionParams): Promise<BallerinaSTModifyResponse | NOT_SUPPORTED_TYPE>;
    convertJsonToRecord(params: JsonToRecordRequest): Promise<JsonToRecordResponse | NOT_SUPPORTED_TYPE>;
    updateStatusBar(): void;
}
