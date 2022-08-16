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
import {
    DocumentSymbol,
    DocumentSymbolParams,
    SymbolInformation,
} from "vscode-languageserver-protocol";

import { BallerinaTriggerRequest, BallerinaTriggerResponse, BallerinaTriggersRequest, BallerinaTriggersResponse } from ".";
import { BaseLangClientInterface } from "./base-lang-client-interface";
import { LinePosition, PublishDiagnosticsParams } from "./expression-editor-lang-client-interface";
import {
    BallerinaConnectorRequest,
    BallerinaConnectorResponse,
    BallerinaConnectorsRequest,
    BallerinaConnectorsResponse,
    BallerinaFunctionSTRequest,
    BallerinaProjectParams,
    BallerinaRecordRequest,
    BallerinaRecordResponse,
    BallerinaSTModifyRequest,
    BallerinaSTModifyResponse,
    DocumentIdentifier,
    JsonToRecordRequest,
    JsonToRecordResponse,
    PerformanceAnalyzerEndpointsRequest,
    TriggerModifyRequest,
} from "./lang-client-extended";

export interface BallerinaAST {
    id: string;
    kind: string;
    topLevelNodes: BallerinaASTNode[];
}

export interface BallerinaASTNode {
    kind: string;
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

export interface GetBallerinaProjectParams {
    documentIdentifier: DocumentIdentifier;
}

export interface ExecutorPositionsResponse {
    executorPositions?: ExecutorPosition[];
}

export interface ExecutorPosition {
    kind: string;
    range: LineRange;
    name: string;
}

export interface LineRange {
    startLine: LinePosition;
    endLine: LinePosition;
}

interface Range {
    start: Position;
    end: Position;
}

interface Position {
    line: number;
    character: number;
}

export interface PerformanceAnalyzerResponse {
    resourcePos: Range;
    endpoints: any;
    actionInvocations: any;
    type: string;
    message: string;
    name: string;
}

export interface FunctionDef {
    syntaxTree: STNode;
    defFilePath: string;
}

export interface CommandResponse {
    error: boolean;
    message: string;
}

export interface DiagramEditorLangClientInterface extends BaseLangClientInterface {
    getConnectors: (
        params: BallerinaConnectorsRequest
    ) => Thenable<BallerinaConnectorsResponse>;
    getTriggers: (
        params: BallerinaTriggersRequest
    ) => Thenable<BallerinaTriggersResponse>;
    getTrigger: (
        params: BallerinaTriggerRequest
    ) => Thenable<BallerinaTriggerResponse>;
    getConnector: (
        params: BallerinaConnectorRequest
    ) => Thenable<BallerinaConnectorResponse>;
    getRecord: (
        params: BallerinaRecordRequest
    ) => Thenable<BallerinaRecordResponse>;
    stModify: (
        params: BallerinaSTModifyRequest
    ) => Thenable<BallerinaSTModifyResponse>;
    triggerModify: (
        params: TriggerModifyRequest
    ) => Thenable<BallerinaSTModifyResponse>;
    getSyntaxTree: (
        params: GetSyntaxTreeParams
    ) => Thenable<GetSyntaxTreeResponse>;
    getDocumentSymbol: (
        params: DocumentSymbolParams
    ) => Thenable<DocumentSymbol[] | SymbolInformation[] | null>;
    getPerfEndpoints: (
        params: PerformanceAnalyzerEndpointsRequest
    ) => Thenable<PerformanceAnalyzerResponse[]>;
    resolveMissingDependencies: (
        params: GetSyntaxTreeParams
    ) => Thenable<GetSyntaxTreeResponse>;
    getExecutorPositions: (
        params: GetBallerinaProjectParams
    ) => Thenable<ExecutorPositionsResponse>;
    convert: (
        params: JsonToRecordRequest
    ) => Thenable<JsonToRecordResponse>;
    getSTForFunction: (
        params: BallerinaFunctionSTRequest
    ) => Thenable<BallerinaSTModifyResponse>;
}
