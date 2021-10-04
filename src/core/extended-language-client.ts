/**
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { ClientCapabilities, LanguageClient } from "vscode-languageclient";
import { DocumentSymbol, DocumentSymbolParams, SymbolInformation } from "monaco-languageclient";
import {
    DidOpenParams, DidCloseParams, DidChangeParams, GetSyntaxTreeParams, GetSyntaxTreeResponse,
    BallerinaConnectorsResponse, BallerinaConnectorRequest, BallerinaConnectorResponse, BallerinaRecordRequest,
    BallerinaRecordResponse, BallerinaSTModifyRequest, BallerinaSTModifyResponse, TriggerModifyRequest,
    PublishDiagnosticsParams,
    BallerinaProjectParams,
    CompletionParams,
    CompletionResponse,
    ExpressionTypeRequest,
    ExpressionTypeResponse
} from "@wso2-enterprise/ballerina-low-code-editor/build/Definitions";

export const BALLERINA_LANG_ID = "ballerina";

export interface ExtendedClientCapabilities extends ClientCapabilities {
    experimental: { introspection: boolean, showTextDocument: boolean };
}

export interface BallerinaSyntaxTree {
    kind: string;
    topLevelNodes: any[];
}

export interface BallerinaExample {
    title: string;
    url: string;
}

export interface BallerinaExampleCategory {
    title: string;
    column: number;
    samples: Array<BallerinaExample>;
}

export interface BallerinaExampleListRequest {
    filter?: string;
}

export interface BallerinaExampleListResponse {
    samples: Array<BallerinaExampleCategory>;
}

export interface BallerinaProject {
    kind?: string;
    path?: string;
    version?: string;
    author?: string;
    packageName?: string;
}

export interface BallerinaProjectComponents {
    packages?: any[];
}

export interface GetBallerinaProjectParams {
    documentIdentifier: DocumentIdentifier;
}

export interface SyntaxTreeNodeRequestParams {
    documentIdentifier: DocumentIdentifier;
    range: Range;
}

export interface SyntaxTreeNodeResponse {
    kind: string;
}

export interface JsonToRecordRequestParams {
    jsonString: string;
}

export interface JsonToRecordResponse {
    codeBlock: string;
}

export interface GetBallerinaPackagesParams {
    documentIdentifiers: DocumentIdentifier[];
}

export interface DocumentIdentifier {
    uri: string;
}

export interface LineRange {
    startLine: LinePosition;
    endLine: LinePosition;
}

export interface LinePosition {
    line: number;
    offset: number;
}

export interface Range {
    start: Position;
    end: Position;
}

export interface Position {
    line: number;
    character: number;
}

export interface BallerinaServiceListRequest {
    documentIdentifier: DocumentIdentifier;
}

export interface BallerinaServiceListResponse {
    services: string[];
}

export interface BallerinaSynResponse {
    syn?: String;
}

export interface GetSynRequest {
    Params: string;
}

export interface ExecutorPositionsResponse {
    executorPositions?: ExecutorPosition[];
}

export interface ExecutorPosition {
    kind: string;
    range: LineRange;
    name: string;
}

export class ExtendedLangClient extends LanguageClient {
    isInitialized: boolean = true;

    didOpen(params: DidOpenParams): void {
        this.sendNotification("textDocument/didOpen", params);
    }
    registerPublishDiagnostics(): void {
        this.onNotification("textDocument/publishDiagnostics", (notification: any) => {
        });
    }
    didClose(params: DidCloseParams): void {
        this.sendNotification("textDocument/didClose", params);
    }
    didChange(params: DidChangeParams): void {
        this.sendNotification("textDocument/didChange", params);
    }
    getDiagnostics(params: BallerinaProjectParams): Promise<PublishDiagnosticsParams[]> {
        return this.sendRequest<PublishDiagnosticsParams[]>("ballerinaDocument/diagnostics", params);
    }
    getCompletion(params: CompletionParams): Promise<CompletionResponse[]> {
        return this.sendRequest("textDocument/completion", params);
    }
    getType(params: ExpressionTypeRequest): Promise<ExpressionTypeResponse> {
        return this.sendRequest("ballerinaSymbol/type", params);
    }
    getConnectors(query:string): Thenable<BallerinaConnectorsResponse> {
        return this.sendRequest<BallerinaConnectorsResponse>("ballerinaConnector/connectors", query);
    }
    getConnector(params: BallerinaConnectorRequest): Thenable<BallerinaConnectorResponse> {
        return this.sendRequest<BallerinaConnectorResponse>("ballerinaConnector/connector", params);
    }
    getRecord(params: BallerinaRecordRequest): Thenable<BallerinaRecordResponse> {
        return this.sendRequest<BallerinaRecordResponse>("ballerinaConnector/record", params);
    }
    astModify(params: BallerinaSTModifyRequest): Thenable<BallerinaSTModifyResponse> {
        return this.sendRequest<BallerinaSTModifyResponse>("ballerinaDocument/astModify", params);
    }
    stModify(params: BallerinaSTModifyRequest): Thenable<BallerinaSTModifyResponse> {
        return this.sendRequest<BallerinaSTModifyResponse>("ballerinaDocument/syntaxTreeModify", params);
    }
    triggerModify(params: TriggerModifyRequest): Thenable<BallerinaSTModifyResponse> {
        return this.sendRequest<BallerinaSTModifyResponse>("ballerinaDocument/triggerModify", params);
    }

    public getDocumentSymbol(params: DocumentSymbolParams): Thenable<DocumentSymbol[] | SymbolInformation[] | null> {
        return this.sendRequest("textDocument/documentSymbol", params);
    }

    public close(): void {
    }

    getDidOpenParams(): DidOpenParams {
        return {
            textDocument: {
                uri: "file://",
                languageId: "ballerina",
                text: '',
                version: 1
            }
        };
    }

    getSyntaxHighlighter(params: string): Thenable<BallerinaSynResponse> {
        const req: GetSynRequest = {
            Params: params
        };
        return this.sendRequest("ballerinaSyntaxHighlighter/list", req);
    }

    getSyntaxTree(req: GetSyntaxTreeParams): Thenable<GetSyntaxTreeResponse> {
        return this.sendRequest("ballerinaDocument/syntaxTree", req);
    }

    fetchExamples(args: BallerinaExampleListRequest = {}): Thenable<BallerinaExampleListResponse> {
        return this.sendRequest("ballerinaExample/list", args);
    }

    getBallerinaProject(params: GetBallerinaProjectParams): Thenable<BallerinaProject> {
        return this.sendRequest("ballerinaPackage/metadata", params);
    }

    getBallerinaProjectComponents(params: GetBallerinaPackagesParams): Thenable<BallerinaProjectComponents> {
        return this.sendRequest("ballerinaPackage/components", params);
    }

    getSyntaxTreeNode(params: SyntaxTreeNodeRequestParams): Thenable<SyntaxTreeNodeResponse> {
        return this.sendRequest("ballerinaDocument/syntaxTreeNode", params);
    }

    getExecutorPositions(params: GetBallerinaProjectParams): Thenable<ExecutorPositionsResponse> {
        return this.sendRequest("ballerinaDocument/executorPositions", params);
    }

    getRecordsForJson(json: string): Thenable<JsonToRecordResponse> {
        const params: JsonToRecordRequestParams = {
            jsonString: json
        };
        return this.sendRequest("jsonToRecord/convert", params);
    }

    getRecordsFromJson(params: JsonToRecordRequestParams): Thenable<JsonToRecordResponse> {
        return this.sendRequest("jsonToRecord/convert", params);
    }
}
