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
import { STNode } from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

import { BaseLangClientInterface } from "./base-lang-client-interface";
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

export interface LibraryDocResponse {
    librariesList: LibraryInfo[];
}

export interface LibraryInfo {
    id: string;
    summary?: string;
    description?: string;
    orgName: string;
    version: string;
    isDefaultModule: boolean;
}

export enum LibraryKind {
    langLib = 'langLibs',
    stdLib = 'modules',
}

export interface LibrarySearchResponse {
    modules: LibraryInfo[];
    classes: ModuleProperty[];
    functions: ModuleProperty[];
    records: ModuleProperty[];
    constants: ModuleProperty[];
    errors: ModuleProperty[];
    types: ModuleProperty[];
    clients: ModuleProperty[];
    listeners: ModuleProperty[];
    annotations: ModuleProperty[];
    objectTypes: ModuleProperty[];
    enums: ModuleProperty[];
}

export interface LibraryDataResponse {
    docsData: LibraryDocsData;
    searchData: LibrarySearchResponse;
}

export interface ModuleProperty {
    id: string;
    description: string;
    moduleId: string;
    moduleOrgName: string;
    moduleVersion: string;
}

export interface LibraryDocsData {
    releaseVersion: string;
    langLibs: any;
    modules: LibraryModule[];
}

export interface LibraryModule {
    relatedModules: any;
    records: any;
    classes: any;
    objectTypes: any;
    clients: any;
    listeners: any;
    functions: any;
    constants: any;
    annotations: any;
    errors: any;
    types: any;
    enums: any;
    variables: any;
    id: string;
    summary: string;
    description: string;
    orgName: string;
    version: string;
    isDefaultModule: boolean;
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
}
