/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import { RequestType } from "vscode-messenger-common";
import { Diagnostic, NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import { TextDocumentPositionParams } from "vscode-languageserver-protocol";
import { Type } from "./data-mapper";
import { LinePosition } from "./common-types";
import { BallerinaProjectComponents, GetBallerinaPackagesParams } from "./project-overview-types";

export interface BallerinaSTModifyResponse {
    source: string;
    defFilePath: string;
    syntaxTree: STNode;
    parseSuccess: boolean;
}

export interface BallerinaProjectParams {
    documentIdentifier: {
        uri: string;
    };
}

export interface PublishDiagnosticsParams {
    uri: string;
    diagnostics: Diagnostic[];
}

export interface GetSyntaxTreeParams {
    documentIdentifier: {
        uri: string;
    };
}

export interface GetSyntaxTreeResponse {
    syntaxTree: any;
    parseSuccess: boolean;
}
export interface STModification {
    startLine?: number;
    startColumn?: number;
    endLine?: number;
    endColumn?: number;
    type: string;
    config?: any;
    isImport?: boolean;
}


export interface BallerinaSTModifyRequest {
    documentIdentifier: { uri: string; };
    astModifications: STModification[];
}

export interface CompletionResponse {
    detail: string;
    insertText: string;
    insertTextFormat: number;
    kind: number;
    label: string;
    additionalTextEdits?: TextEdit[];
    documentation?: string;
    sortText?: string;
}

export interface TextEdit {
    newText: string,
    range: {
        end: {
            character: number;
            line: number;
        },
        start: {
            character: number;
            line: number;
        }
    }
}

export interface CompletionParams {
    textDocument: {
        uri: string;
    };
    position: {
        character: number;
        line: number;
    };
    context: {
        triggerKind: number;
    };
}

export interface ExpressionTypeRequest {
    documentIdentifier: { uri: string; };
    position: LinePosition;
}

export interface ExpressionTypeResponse {
    documentIdentifier: { uri: string; };
    types: string[];
}

export interface PartialSTRequest {
    codeSnippet: string;
    stModification?: PartialSTModification;
}

export interface PartialSTResponse {
    syntaxTree: STNode;
}

export interface PartialSTModification {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    newCodeSnippet: string;
}

export interface SymbolInfoRequest {
    textDocumentIdentifier: {
        uri: string;
    },
    position: {
        line: number;
        character: number;
    }
}

export interface SymbolDocumentation {
    description: string,
    parameters?: ParameterInfo[],
    returnValueDescription?: string,
    deprecatedDocumentation?: string,
    deprecatedParams?: ParameterInfo[]
}

export interface SymbolInfoResponse {
    symbolKind: string,
    documentation: SymbolDocumentation
}

export interface ParameterInfo {
    name: string,
    description?: string,
    kind: string,
    type: string,
    modelPosition?: NodePosition,
    fields?: ParameterInfo[]
}

export interface ExpressionRange {
    startLine: LinePosition;
    endLine: LinePosition;
    filePath?: string;
}

export interface TypeFromExpressionRequest {
    documentIdentifier: {
        uri: string;
    };
    expressionRanges: ExpressionRange[];
}

export interface ResolvedTypeForExpression {
    type: Type;
    requestedRange: ExpressionRange;
}

export interface TypesFromExpressionResponse {
    types: ResolvedTypeForExpression[];
}

export interface TypeFromSymbolRequest {
    documentIdentifier: {
        uri: string;
    };
    positions: LinePosition[];
}

export interface ResolvedTypeForSymbol {
    type: Type;
    requestedPosition: LinePosition;
}

export interface TypesFromSymbolResponse {
    types: ResolvedTypeForSymbol[];
}

export interface TypesFromFnDefinitionRequest {
    documentIdentifier: {
        uri: string;
    };
    fnPosition: LinePosition;
    returnTypeDescPosition: LinePosition;
}

export interface BallerinaLangClientInterface {
    getBallerinaProjectComponents: (
        params: GetBallerinaPackagesParams
    ) => Promise<BallerinaProjectComponents>;
    getDefinitionPosition: (
        params: TextDocumentPositionParams
    ) => Thenable<BallerinaSTModifyResponse>;
    getDiagnostics: (
        params: BallerinaProjectParams
    ) => Thenable<PublishDiagnosticsParams[]>;
    getSyntaxTree: (
        params: GetSyntaxTreeParams
    ) => Thenable<GetSyntaxTreeResponse>;
    stModify: (
        params: BallerinaSTModifyRequest
    ) => Thenable<BallerinaSTModifyResponse>;
    getCompletion: (
        params: CompletionParams
    ) => Thenable<CompletionResponse[]>;
    getType: (
        param: ExpressionTypeRequest
    ) => Thenable<ExpressionTypeResponse>;
    getSTForSingleStatement: (
        param: PartialSTRequest
    ) => Thenable<PartialSTResponse>;
    getSTForExpression: (
        param: PartialSTRequest
    ) => Thenable<PartialSTResponse>;
    getSTForModuleMembers: (
        param: PartialSTRequest
    ) => Thenable<PartialSTResponse>;
    getSTForModulePart: (
        param: PartialSTRequest
    ) => Thenable<PartialSTResponse>;
    getSTForResource: (
        param: PartialSTRequest
    ) => Thenable<PartialSTResponse>;
    getSymbolDocumentation: (
        params: SymbolInfoRequest
    ) => Thenable<SymbolInfoResponse>;
    getTypeFromExpression: (
        params: TypeFromExpressionRequest
    ) => Thenable<TypesFromExpressionResponse>;
    getTypeFromSymbol: (
        params: TypeFromSymbolRequest
    ) => Thenable<TypesFromSymbolResponse>;
    getTypesFromFnDefinition: (
        params: TypesFromFnDefinitionRequest
    ) => Thenable<TypesFromSymbolResponse>;
}

const BallerinaLangClient = "BallerinaLangClient/"

export const getDefinitionPosition: RequestType<TextDocumentPositionParams, BallerinaSTModifyResponse> = { method: `${BallerinaLangClient}getDefinitionPosition` };
export const getDiagnostics: RequestType<BallerinaProjectParams, PublishDiagnosticsParams[]> = { method: `${BallerinaLangClient}getDiagnostics` };
export const getSyntaxTree: RequestType<GetSyntaxTreeParams, GetSyntaxTreeResponse> = { method: `${BallerinaLangClient}getSyntaxTree` };
export const stModify: RequestType<BallerinaSTModifyRequest, BallerinaSTModifyResponse> = { method: `${BallerinaLangClient}stModify` };
export const getCompletion: RequestType<CompletionParams, CompletionResponse[]> = { method: `${BallerinaLangClient}getCompletion` };
export const getType: RequestType<ExpressionTypeRequest, ExpressionTypeResponse> = { method: `${BallerinaLangClient}getType` };
export const getSTForSingleStatement: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${BallerinaLangClient}getSTForSingleStatement` };
export const getSTForExpression: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${BallerinaLangClient}getSTForExpression` };
export const getSTForModuleMembers: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${BallerinaLangClient}getSTForModuleMembers` };
export const getSTForModulePart: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${BallerinaLangClient}getSTForModulePart` };
export const getSTForResource: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${BallerinaLangClient}getSTForResource` };
export const getSymbolDocumentation: RequestType<SymbolInfoRequest, SymbolInfoResponse> = { method: `${BallerinaLangClient}getSymbolDocumentation` };
export const getTypeFromExpression: RequestType<TypeFromExpressionRequest, TypesFromExpressionResponse> = { method: `${BallerinaLangClient}getTypeFromExpression` };
export const getTypeFromSymbol: RequestType<TypeFromSymbolRequest, TypesFromSymbolResponse> = { method: `${BallerinaLangClient}getTypeFromSymbol` };
export const getTypesFromFnDefinition: RequestType<TypesFromFnDefinitionRequest, TypesFromSymbolResponse> = { method: `${BallerinaLangClient}getTypesFromFnDefinition` };
