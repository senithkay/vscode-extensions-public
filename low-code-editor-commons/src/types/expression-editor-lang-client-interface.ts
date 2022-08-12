/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import { CodeAction, CodeActionParams, Diagnostic  } from "vscode-languageserver-protocol";

import { BaseLangClientInterface } from "./base-lang-client-interface";
import { FormField } from "./config-spec";
import { BallerinaProjectParams } from "./lang-client-extended";

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

export interface PublishDiagnosticsParams {
    uri: string;
    diagnostics: Diagnostic[];
}

export interface LinePosition {
    line: number;
    offset: number;
}

export interface ExpressionTypeRequest {
     documentIdentifier: { uri: string; };
    // tslint:disable-next-line: align
    position: LinePosition;
}

export interface ExpressionTypeResponse {
    documentIdentifier: { uri: string; };
       // tslint:disable-next-line: align
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

export interface ParameterInfo {
    name : string,
    description? : string,
    kind : string,
    type : string,
    modelPosition? : NodePosition,
    fields? : ParameterInfo[]
}

export interface SymbolDocumentation {
    description : string,
    parameters? : ParameterInfo[],
    returnValueDescription? : string,
    deprecatedDocumentation? : string,
    deprecatedParams? : ParameterInfo[]
}

export interface SymbolInfoResponse {
    symbolKind: string,
    documentation : SymbolDocumentation
}

export interface ExpressionRange {
    startPosition: LinePosition;
    endPosition: LinePosition;
}

export interface TypeFromExpressionRequest {
    documentIdentifier: {
        uri: string;
    };
    expressionRanges: ExpressionRange[];
}

export interface ResolvedTypeForExpression {
    type: FormField;
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
    type: FormField;
    requestedPosition: LinePosition;
}

export interface TypesFromSymbolResponse {
    types: ResolvedTypeForSymbol[];
}

export interface ExpressionEditorLangClientInterface extends BaseLangClientInterface {
    getDiagnostics: (
        params: BallerinaProjectParams
    ) => Thenable<PublishDiagnosticsParams[]>;
    getCompletion: (
        params: CompletionParams
    ) => Thenable<CompletionResponse[]>;
    getType: (
        param: ExpressionTypeRequest
    ) => Thenable<ExpressionTypeResponse>;
    getSTForSingleStatement: (
        param: PartialSTRequest
    ) => Thenable<PartialSTResponse>;
    getSTForExpression	: (
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
    codeAction: (
        params: CodeActionParams
    ) => Thenable<CodeAction[]> ;
    getTypeFromExpression: (
        params: TypeFromExpressionRequest
    ) => Thenable<TypesFromExpressionResponse>;
    getTypeFromSymbol: (
        params: TypeFromSymbolRequest
    ) => Thenable<TypesFromSymbolResponse>;
}
