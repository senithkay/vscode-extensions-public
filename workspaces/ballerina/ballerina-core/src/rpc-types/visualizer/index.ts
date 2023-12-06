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

import { CodeAction, WorkspaceEdit } from "vscode-languageserver-types";
import {
    BallerinaProjectComponents,
    BallerinaProjectParams,
    BallerinaSTModifyResponse,
    CodeActionParams,
    CompletionParams,
    CompletionResponse,
    DidChangeTextDocumentParams,
    DidCloseTextDocumentParams,
    DidOpenTextDocumentParams,
    GetBallerinaPackagesParams,
    JsonToRecordRequest,
    JsonToRecordResponse,
    PublishDiagnosticsParams,
    RenameParams,
    TextDocumentPositionParams,
    NOT_SUPPORTED_TYPE,
    GetSyntaxTreeResponse,
    GetSyntaxTreeParams,
    BallerinaFunctionSTRequest
} from "../..";
import { VisualizerLocationContext } from "../../extension-interfaces/state-machine-types";
import { STNode } from "@wso2-enterprise/syntax-tree";

export interface VisualizerAPI {
    getVisualizerState: () => Promise<VisualizerLocationContext>;
    openVisualizerView: (params: VisualizerLocationContext) => Promise<VisualizerLocationContext>;
    getSyntaxTree: () => Promise<STNode>;
    getST: (params: GetSyntaxTreeParams) => Promise<GetSyntaxTreeResponse>;
    getSTByRange(params: BallerinaFunctionSTRequest): Promise<BallerinaSTModifyResponse>;
    getBallerinaProjectComponents: (params: GetBallerinaPackagesParams) => Promise<BallerinaProjectComponents>;
    getCompletion: (params: CompletionParams) => Promise<CompletionResponse[]>;
    getDiagnostics: (params: BallerinaProjectParams) => Promise<PublishDiagnosticsParams[] | NOT_SUPPORTED_TYPE>;
    codeAction: (params: CodeActionParams) => Promise<CodeAction[]>;
    rename: (params: RenameParams) => Promise<WorkspaceEdit>;
    getDefinitionPosition: (params: TextDocumentPositionParams) => Promise<BallerinaSTModifyResponse | NOT_SUPPORTED_TYPE>;
    convert: (params: JsonToRecordRequest) => Promise<JsonToRecordResponse | NOT_SUPPORTED_TYPE>;
    didOpen: (Params: DidOpenTextDocumentParams) => void;
    didChange: (params: DidChangeTextDocumentParams) => void;
    didClose: (params: DidCloseTextDocumentParams) => void;
}
