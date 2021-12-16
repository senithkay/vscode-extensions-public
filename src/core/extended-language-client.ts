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

import { ClientCapabilities, LanguageClient, LanguageClientOptions, ServerOptions } from "vscode-languageclient/node";
import { CodeAction, CodeActionParams, DocumentSymbol, DocumentSymbolParams, ExecuteCommandParams, SymbolInformation } from "monaco-languageclient";
import {
    DidOpenParams, DidCloseParams, DidChangeParams, GetSyntaxTreeParams, GetSyntaxTreeResponse,
    BallerinaConnectorsResponse, BallerinaConnectorRequest, BallerinaConnectorResponse, BallerinaRecordRequest,
    BallerinaRecordResponse, BallerinaSTModifyRequest, BallerinaSTModifyResponse, TriggerModifyRequest,
    PublishDiagnosticsParams,
    BallerinaProjectParams,
    CompletionParams,
    CompletionResponse,
    ExpressionTypeRequest,
    ExpressionTypeResponse,
} from "@wso2-enterprise/ballerina-low-code-editor";
import { BallerinaConnectorsRequest, BallerinaTriggerRequest, BallerinaTriggerResponse, BallerinaTriggersRequest, BallerinaTriggersResponse } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { BallerinaExtension } from "./index";
import { showChoreoPushMessage } from "../editor-support/git-status";
import { MESSAGE_TYPE } from "../utils/showMessage";
import { Values } from "../forecaster/model";
import { showChoreoSigninMessage } from "../forecaster";
import { debug } from "../utils";

export const CONNECTOR_LIST_CACHE = "CONNECTOR_LIST_CACHE";
export const BALLERINA_LANG_ID = "ballerina";
const NOT_SUPPORTED = {};

enum EXTENDED_APIS {
    DOCUMENT_ST_NODE = 'ballerinaDocument/syntaxTreeNode',
    DOCUMENT_EXECUTOR_POSITIONS = 'ballerinaDocument/executorPositions',
    DOCUMENT_ST_MODIFY = 'ballerinaDocument/syntaxTreeModify',
    DOCUMENT_DIAGNOSTICS = 'ballerinaDocument/diagnostics',
    DOCUMENT_ST = 'ballerinaDocument/syntaxTree',
    DOCUMENT_AST_MODIFY = 'ballerinaDocument/astModify',
    DOCUMENT_TRIGGER_MODIFY = 'ballerinaDocument/triggerModify',
    SYMBOL_TYPE = 'ballerinaSymbol/type',
    CONNECTOR_CONNECTORS = 'ballerinaConnector/connectors',
    TRIGGER_TRIGGERS = 'ballerinaTrigger/triggers',
    TRIGGER_TRIGGER = 'ballerinaTrigger/trigger',
    CONNECTOR_CONNECTOR = 'ballerinaConnector/connector',
    CONNECTOR_RECORD = 'ballerinaConnector/record',
    PACKAGE_COMPONENTS = 'ballerinaPackage/components',
    PACKAGE_METADATA = 'ballerinaPackage/metadata',
    PACKAGE_CONFIG_SCHEMA = 'ballerinaPackage/configSchema',
    JSON_TO_RECORD_CONVERT = 'jsonToRecord/convert',
    PARTIAL_PARSE_SINGLE_STATEMENT = 'partialParser/getSTForSingleStatement',
    PARTIAL_PARSE_EXPRESSION = 'partialParser/getSTForExpression',
    PARTIAL_PARSE_MODULE_MEMBER = 'partialParser/getSTForModuleMembers',
    EXAMPLE_LIST = 'ballerinaExample/list',
    PERF_ANALYZER_GRAPH_DATA = 'performanceAnalyzer/getGraphData',
    PERF_ANALYZER_REALTIME_DATA = 'performanceAnalyzer/getRealtimeData',
    RESOLVE_MISSING_DEPENDENCIES = 'ballerinaDocument/resolveMissingDependencies',
    BALLERINA_TO_OPENAPI = 'openAPILSExtension/generateOpenAPI'
}

enum EXTENDED_APIS_ORG {
    DOCUMENT = 'ballerinaDocument',
    PACKAGE = 'ballerinaPackage',
    EXAMPLE = 'ballerinaExample',
    JSON_TO_RECORD = 'jsonToRecord',
    SYMBOL = 'ballerinaSymbol',
    CONNECTOR = 'ballerinaConnector',
    TRIGGER = 'ballerinaTrigger',
    PERF_ANALYZER = 'performanceAnalyzer',
    PARTIAL_PARSER = 'partialParser',
    BALLERINA_TO_OPENAPI = 'openAPILSExtension'
}

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

export interface JsonToRecordRequest {
    jsonString: string;
    recordName?: string;
    isRecordTypeDesc?: boolean;
    isClosed?: boolean;
}

export interface JsonToRecordResponse {
    codeBlock: string;
}

interface BallerinaInitializeParams {
    ballerinaClientCapabilities: BallerinaClientCapability[];
}

interface BallerinaClientCapability {
    name: string;
    [key: string]: boolean | string;
}

interface BallerinaInitializeResult {
    ballerinaServerCapabilities: BallerinaServerCapability[];
}

interface BallerinaServerCapability {
    name: string;
    [key: string]: boolean | string;
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

export interface PartialSTRequestParams {
    codeSnippet: string;
    stModification?: PartialSTModification;
}

export interface PartialSTResponse {
    syntaxTree: any;
}

export interface PackageConfigSchemaResponse {
    configSchema: any;
}

export interface PartialSTModification {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    newCodeSnippet: string;
}

export interface PerformanceAnalyzerGraphRequest {
    documentIdentifier: DocumentIdentifier;
    range: Range;
    choreoAPI: String;
    choreoCookie: String;
    choreoToken: String;
}

export interface PerformanceAnalyzerGraphResponse {
    message: string;
    type: any;
    sequenceDiagramData: SequenceGraphPoint[];
    graphData: GraphPoint[];
}

export interface PerformanceAnalyzerRealtimeResponse {
    message: string;
    type: any;
    concurrency: Values;
    latency: Values;
    tps: Values;
}

export interface GraphPoint {
    concurrency: String;
    latency: String;
    tps: String;
}

export interface SequenceGraphPoint {
    concurrency: String;
    values: SequenceGraphPointValue[];
}

export interface SequenceGraphPointValue {
    name: String;
    latency: String;
    tps: String;
}

export interface OpenAPIConverterRequest {
    documentFilePath: string;
}

export interface OpenAPIConverterResponse {
    content: OASpec[];
    error?: string;
}

export interface OASpec {
    file: string;
    serviceName: string;
    spec: any;
    diagnostics: OADiagnostic[];
}

export interface OADiagnostic {
    message: string;
    serverity: string;
    location?: LineRange;
}

export class ExtendedLangClient extends LanguageClient {
    private ballerinaExtendedServices: Set<String> | undefined;
    private isDynamicRegistrationSupported: boolean;
    isInitialized: boolean = true;
    private ballerinaExtInstance: BallerinaExtension | undefined;

    constructor(id: string, name: string, serverOptions: ServerOptions, clientOptions: LanguageClientOptions,
        ballerinaExtInstance: BallerinaExtension | undefined, forceDebug?: boolean) {
        super(id, name, serverOptions, clientOptions, forceDebug);
        this.isDynamicRegistrationSupported = true;
        this.ballerinaExtInstance = ballerinaExtInstance;
    }

    didOpen(params: DidOpenParams): void {
        debug(`didOpen at ${new Date()} - ${new Date().getTime()}`);
        this.sendNotification("textDocument/didOpen", params);
    }
    registerPublishDiagnostics(): void {
        this.onNotification("textDocument/publishDiagnostics", (notification: any) => {
        });
    }
    didClose(params: DidCloseParams): void {
        debug(`didClose at ${new Date()} - ${new Date().getTime()}`);
        this.sendNotification("textDocument/didClose", params);
    }
    didChange(params: DidChangeParams): void {
        debug(`didChange at ${new Date()} - ${new Date().getTime()}`);
        this.sendNotification("textDocument/didChange", params);
    }
    getPerformanceGraphData(params: PerformanceAnalyzerGraphRequest): Promise<PerformanceAnalyzerGraphResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.PERF_ANALYZER_GRAPH_DATA)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.PERF_ANALYZER_GRAPH_DATA, params);
    }
    getRealtimePerformanceData(params: PerformanceAnalyzerGraphRequest): Promise<PerformanceAnalyzerRealtimeResponse> {
        if (!this.ballerinaExtInstance?.enabledPerformanceForecasting() ||
            !this.ballerinaExtInstance?.getChoreoSession().loginStatus ||
            this.ballerinaExtInstance.getPerformanceForecastContext().temporaryDisabled) {
            return Promise.resolve({
                type: MESSAGE_TYPE.IGNORE, message: '', concurrency: { min: 0, max: 0 },
                tps: { min: 0, max: 0 }, latency: { min: 0, max: 0 }
            });
        }
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.PERF_ANALYZER_REALTIME_DATA)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.PERF_ANALYZER_REALTIME_DATA, params);
    }
    getDiagnostics(params: BallerinaProjectParams): Promise<PublishDiagnosticsParams[]> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_DIAGNOSTICS)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<PublishDiagnosticsParams[]>(EXTENDED_APIS.DOCUMENT_DIAGNOSTICS, params);
    }
    getCompletion(params: CompletionParams): Promise<CompletionResponse[]> {
        return this.sendRequest("textDocument/completion", params);
    }
    getType(params: ExpressionTypeRequest): Promise<ExpressionTypeResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.SYMBOL_TYPE)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.SYMBOL_TYPE, params);
    }
    getConnectors(params: BallerinaConnectorsRequest, reset?: boolean): Thenable<BallerinaConnectorsResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.CONNECTOR_CONNECTORS)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        if (!reset && params.query === "" && !params.keyword && !params.organization && !params.offset) {
            let connectorList = this.ballerinaExtInstance?.context?.globalState.get(CONNECTOR_LIST_CACHE) as BallerinaConnectorsResponse;
            if (connectorList && connectorList.central?.length > 0) {
                return Promise.resolve().then(() => connectorList);
            }
        }
        return this.sendRequest<BallerinaConnectorsResponse>(EXTENDED_APIS.CONNECTOR_CONNECTORS, params);
    }
    getTriggers(params: BallerinaTriggersRequest): Thenable<BallerinaTriggersResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.TRIGGER_TRIGGERS)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<BallerinaTriggersResponse>(EXTENDED_APIS.TRIGGER_TRIGGERS, params);
    }
    getConnector(params: BallerinaConnectorRequest): Thenable<BallerinaConnectorResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.CONNECTOR_CONNECTOR)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<BallerinaConnectorResponse>(EXTENDED_APIS.CONNECTOR_CONNECTOR, params);
    }
    getTrigger(params: BallerinaTriggerRequest): Thenable<BallerinaTriggerResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.TRIGGER_TRIGGER)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<BallerinaTriggerResponse>(EXTENDED_APIS.TRIGGER_TRIGGER, params);
    }
    getRecord(params: BallerinaRecordRequest): Thenable<BallerinaRecordResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.CONNECTOR_RECORD)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<BallerinaRecordResponse>(EXTENDED_APIS.CONNECTOR_RECORD, params);
    }
    astModify(params: BallerinaSTModifyRequest): Thenable<BallerinaSTModifyResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_AST_MODIFY)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<BallerinaSTModifyResponse>(EXTENDED_APIS.DOCUMENT_AST_MODIFY, params);
    }
    stModify(params: BallerinaSTModifyRequest): Thenable<BallerinaSTModifyResponse> {
        if (this.ballerinaExtInstance) {
            showChoreoPushMessage(this.ballerinaExtInstance);
            if (!this.ballerinaExtInstance.getChoreoSession().loginStatus) {
                showChoreoSigninMessage(this.ballerinaExtInstance);
            }
        }
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_ST_MODIFY)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<BallerinaSTModifyResponse>(EXTENDED_APIS.DOCUMENT_ST_MODIFY, params);
    }
    triggerModify(params: TriggerModifyRequest): Thenable<BallerinaSTModifyResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_TRIGGER_MODIFY)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<BallerinaSTModifyResponse>(EXTENDED_APIS.DOCUMENT_TRIGGER_MODIFY, params);
    }

    public getDocumentSymbol(params: DocumentSymbolParams): Thenable<DocumentSymbol[] | SymbolInformation[] | null> {
        return this.sendRequest("textDocument/documentSymbol", params);
    }

    public close(): void {
    }

    public updateStatusBar() {
        if (!this.ballerinaExtInstance || !this.ballerinaExtInstance.getCodeServerContext().statusBarItem) {
            return;
        }
        this.ballerinaExtInstance.getCodeServerContext().statusBarItem?.updateGitStatus();
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

    getSyntaxTree(req: GetSyntaxTreeParams): Thenable<GetSyntaxTreeResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_ST)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.DOCUMENT_ST, req);
    }

    fetchExamples(args: BallerinaExampleListRequest = {}): Thenable<BallerinaExampleListResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.EXAMPLE_LIST)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.EXAMPLE_LIST, args);
    }

    getBallerinaProject(params: GetBallerinaProjectParams): Thenable<BallerinaProject> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.PACKAGE_METADATA)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.PACKAGE_METADATA, params);
    }

    getBallerinaProjectComponents(params: GetBallerinaPackagesParams): Thenable<BallerinaProjectComponents> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.PACKAGE_COMPONENTS)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.PACKAGE_COMPONENTS, params);
    }

    getBallerinaProjectConfigSchema(params: GetBallerinaProjectParams): Thenable<PackageConfigSchemaResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.PACKAGE_CONFIG_SCHEMA)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.PACKAGE_CONFIG_SCHEMA, params);
    }

    getSyntaxTreeNode(params: SyntaxTreeNodeRequestParams): Thenable<SyntaxTreeNodeResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_ST_NODE)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.DOCUMENT_ST_NODE, params);
    }

    getExecutorPositions(params: GetBallerinaProjectParams): Thenable<ExecutorPositionsResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_EXECUTOR_POSITIONS)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.DOCUMENT_EXECUTOR_POSITIONS, params);
    }

    convertJsonToRecord(params: JsonToRecordRequest): Thenable<JsonToRecordResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.JSON_TO_RECORD_CONVERT)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.JSON_TO_RECORD_CONVERT, params);
    }

    getSTForSingleStatement(params: PartialSTRequestParams): Thenable<PartialSTResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.PARTIAL_PARSE_SINGLE_STATEMENT)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.PARTIAL_PARSE_SINGLE_STATEMENT, params);
    }

    getSTForExpression(params: PartialSTRequestParams): Thenable<PartialSTResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.PARTIAL_PARSE_EXPRESSION)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.PARTIAL_PARSE_EXPRESSION, params);
    }

    getSTForModuleMembers(params: PartialSTRequestParams): Thenable<PartialSTResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.PARTIAL_PARSE_MODULE_MEMBER)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.PARTIAL_PARSE_MODULE_MEMBER, params);
    }

    resolveMissingDependencies(req: GetSyntaxTreeParams): Thenable<GetSyntaxTreeResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.RESOLVE_MISSING_DEPENDENCIES)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.RESOLVE_MISSING_DEPENDENCIES, req);
    }

    initBalServices(params: BallerinaInitializeParams): Promise<BallerinaInitializeResult> {
        return this.sendRequest("initBalServices", params);
    }

    convertToOpenAPI(params: OpenAPIConverterRequest): Promise<OpenAPIConverterResponse> {
        if (!this.isExtendedServiceSupported(EXTENDED_APIS.BALLERINA_TO_OPENAPI)) {
            Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.BALLERINA_TO_OPENAPI, params);
    }

    codeAction(params: CodeActionParams): Promise<CodeAction[]> {
        return this.sendRequest("textDocument/codeAction", params);
    }

    executeCommand(params: ExecuteCommandParams): Promise<any> {
        return this.sendRequest("workspace/executeCommand", params);
    }

    async registerExtendedAPICapabilities() {
        if (!this.isDynamicRegistrationSupported) {
            return;
        }

        await this.initBalServices({
            ballerinaClientCapabilities: [
                {
                    name: EXTENDED_APIS_ORG.DOCUMENT, syntaxTreeNode: true, executorPositions: true,
                    syntaxTreeModify: true, diagnostics: true, syntaxTree: true, astModify: true, triggerModify: true,
                    resolveMissingDependencies: true
                },
                { name: EXTENDED_APIS_ORG.PACKAGE, components: true, metadata: true, configSchema: true },
                { name: EXTENDED_APIS_ORG.SYMBOL, type: true },
                {
                    name: EXTENDED_APIS_ORG.CONNECTOR, connectors: true, connector: true, record: true
                },
                {
                    name: EXTENDED_APIS_ORG.TRIGGER, triggers: true, trigger: true
                },
                { name: EXTENDED_APIS_ORG.EXAMPLE, list: true },
                { name: EXTENDED_APIS_ORG.JSON_TO_RECORD, convert: true },
                { name: EXTENDED_APIS_ORG.PERF_ANALYZER, getGraphData: true, getRealtimeData: true },
                { name: EXTENDED_APIS_ORG.PARTIAL_PARSER, getSTForSingleStatement: true, getSTForExpression: true },
                { name: EXTENDED_APIS_ORG.BALLERINA_TO_OPENAPI, generateOpenAPI: true }
            ]
        }).then(response => {
            this.ballerinaExtendedServices = new Set();
            response.ballerinaServerCapabilities.forEach((capability: BallerinaServerCapability) => {
                const keys: string[] = Object.keys(capability);
                const org: string = capability['name'];
                keys.forEach(key => {
                    if (key != 'name') {
                        this.ballerinaExtendedServices!.add(`${org}/${key}`);
                    }
                })
            })
        }).catch(_error => {
            this.isDynamicRegistrationSupported = false;
        });
    }

    isExtendedServiceSupported(serviceName: string): boolean {
        if (!this.isDynamicRegistrationSupported) {
            return true;
        }
        if (!this.ballerinaExtendedServices) {
            this.registerExtendedAPICapabilities();
        }
        return this.ballerinaExtendedServices?.has(serviceName) || true;
    }
}
