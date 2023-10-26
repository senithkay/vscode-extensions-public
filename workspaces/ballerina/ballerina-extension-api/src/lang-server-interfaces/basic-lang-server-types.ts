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

import { NotificationType, RequestType } from "vscode-messenger-common";
import { STNode } from "@wso2-enterprise/syntax-tree";
import { DefinitionParams, InitializeParams, InitializeResult, Location, LocationLink, TextDocumentPositionParams, Diagnostic, CodeAction,
    CodeActionParams } from "vscode-languageserver-protocol";

export interface DidOpenParams {
    textDocument: {
        uri: string;
        languageId: string;
        text: string;
        version: number;
    };
}

export interface DidCloseParams {
    textDocument: {
        uri: string;
    };
}

export interface DidChangeParams {
    textDocument: {
        uri: string;
        version: number;
    };
    contentChanges: [
        {
            text: string;
        }
    ];
}

export interface LinePosition {
    line: number;
    offset: number;
}

export interface DocumentIdentifier {
    uri: string;
}

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

export interface LineRange {
    startLine: LinePosition;
    endLine: LinePosition;
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

export interface BaseLangClientInterface {
    init?: (params: InitializeParams) => Promise<InitializeResult>
    didOpen: (Params: DidOpenParams) => void;
    didClose: (params: DidCloseParams) => void;
    didChange: (params: DidChangeParams) => void;
    definition: (params: DefinitionParams) => Promise<Location | Location[] | LocationLink[] | null>;
    close?: () => void;

    
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
}


const baseLangClient = "baseLangClient/"

export const getDefinitionPosition: RequestType<TextDocumentPositionParams, BallerinaSTModifyResponse> = { method: `${baseLangClient}getDefinitionPosition` };
export const getDiagnostics: RequestType<BallerinaProjectParams, PublishDiagnosticsParams[]> = { method: `${baseLangClient}getDiagnostics` };
export const codeAction: RequestType<CodeActionParams, CodeAction[]> = { method: `${baseLangClient}codeAction` };
export const getSyntaxTree: RequestType<GetSyntaxTreeParams, GetSyntaxTreeResponse> = { method: `${baseLangClient}getSyntaxTree` };
export const stModify: RequestType<BallerinaSTModifyRequest, BallerinaSTModifyResponse> = { method: `${baseLangClient}stModify` };

export const definition: RequestType<DefinitionParams, Location | Location[] | LocationLink[] | null> = { method: `${baseLangClient}definition` };
export const init: RequestType<InitializeParams, InitializeResult> = { method: `${baseLangClient}init` };

export const didOpen: NotificationType<DidOpenParams> = { method: `${baseLangClient}go2source` };
export const didClose: NotificationType<DidCloseParams> = { method: `${baseLangClient}didClose` };
export const didChange: NotificationType<DidChangeParams> = { method: `${baseLangClient}didChange` };
