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
import { CodeAction, CodeActionParams, DefinitionParams, LocationLink, TextDocumentPositionParams } from "vscode-languageserver-protocol";
import { Type } from "./data-mapper";
import { LinePosition } from "./common-types";
import { BaseLangClientInterface } from "./base-lang-server-types";

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

export interface ExtendedLangClientInterface extends BaseLangClientInterface {
    getDefinitionPosition: (
        params: TextDocumentPositionParams
    ) => Thenable<BallerinaSTModifyResponse>;
    getDiagnostics: (
        params: BallerinaProjectParams
    ) => Thenable<PublishDiagnosticsParams[]>;
    codeAction: (
        params: CodeActionParams
    ) => Thenable<CodeAction[]> ;
    getSyntaxTree: (
        params: GetSyntaxTreeParams
    ) => Thenable<GetSyntaxTreeResponse>;
    stModify: (
        params: BallerinaSTModifyRequest
    ) => Thenable<BallerinaSTModifyResponse>;
    definition: (
        params: DefinitionParams
    ) => Promise<Location | Location[] | LocationLink[] | null>;
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

const extendedLangClient = "extendedLangClient/"

export const getDefinitionPosition: RequestType<TextDocumentPositionParams, BallerinaSTModifyResponse> = { method: `${extendedLangClient}getDefinitionPosition` };
export const getDiagnostics: RequestType<BallerinaProjectParams, PublishDiagnosticsParams[]> = { method: `${extendedLangClient}getDiagnostics` };
export const codeAction: RequestType<CodeActionParams, CodeAction[]> = { method: `${extendedLangClient}codeAction` };
export const getSyntaxTree: RequestType<GetSyntaxTreeParams, GetSyntaxTreeResponse> = { method: `${extendedLangClient}getSyntaxTree` };
export const stModify: RequestType<BallerinaSTModifyRequest, BallerinaSTModifyResponse> = { method: `${extendedLangClient}stModify` };
export const definition: RequestType<DefinitionParams, Location | Location[] | LocationLink[] | null> = { method: `${extendedLangClient}definition` };
export const getCompletion: RequestType<CompletionParams, CompletionResponse[]> = { method: `${extendedLangClient}getCompletion` };
export const getType: RequestType<ExpressionTypeRequest, ExpressionTypeResponse> = { method: `${extendedLangClient}getType` };
export const getSTForSingleStatement: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${extendedLangClient}getSTForSingleStatement` };
export const getSTForExpression: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${extendedLangClient}getSTForExpression` };
export const getSTForModuleMembers: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${extendedLangClient}getSTForModuleMembers` };
export const getSTForModulePart: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${extendedLangClient}getSTForModulePart` };
export const getSTForResource: RequestType<PartialSTRequest, PartialSTResponse> = { method: `${extendedLangClient}getSTForResource` };
export const getSymbolDocumentation: RequestType<SymbolInfoRequest, SymbolInfoResponse> = { method: `${extendedLangClient}getSymbolDocumentation` };
export const getTypeFromExpression: RequestType<TypeFromExpressionRequest, TypesFromExpressionResponse> = { method: `${extendedLangClient}getTypeFromExpression` };
export const getTypeFromSymbol: RequestType<TypeFromSymbolRequest, TypesFromSymbolResponse> = { method: `${extendedLangClient}getTypeFromSymbol` };
export const getTypesFromFnDefinition: RequestType<TypesFromFnDefinitionRequest, TypesFromSymbolResponse> = { method: `${extendedLangClient}getTypesFromFnDefinition` };
