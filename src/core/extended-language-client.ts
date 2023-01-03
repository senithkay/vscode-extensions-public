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
import { CodeAction, CodeActionParams, DocumentSymbol, DocumentSymbolParams, ExecuteCommandParams, RenameParams, SymbolInformation, WorkspaceEdit } from "monaco-languageclient";
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
} from "@wso2-enterprise/ballerina-low-code-editor-distribution";
import {
    BallerinaConnectorsRequest,
    BallerinaTriggerRequest,
    BallerinaTriggerResponse,
    BallerinaTriggersRequest,
    BallerinaTriggersResponse,
    FormField
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { BallerinaExtension } from "./index";
import { showChoreoPushMessage } from "../editor-support/git-status";
import { showChoreoSigninMessage } from "../forecaster";
import { debug } from "../utils";
import { CMP_LS_CLIENT_COMPLETIONS, CMP_LS_CLIENT_DIAGNOSTICS, getMessageObject, sendTelemetryEvent, TM_EVENT_LANG_CLIENT } from "../telemetry";
import { DefinitionParams, Location, LocationLink } from 'vscode-languageserver-protocol';
import { ComponentModel } from "../project-design-diagrams/resources";

export const CONNECTOR_LIST_CACHE = "CONNECTOR_LIST_CACHE";
export const HTTP_CONNECTOR_LIST_CACHE = "HTTP_CONNECTOR_LIST_CACHE";
export const BALLERINA_LANG_ID = "ballerina";
export const NOT_SUPPORTED = {};

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
    PARTIAL_PARSE_MODULE_PART = 'partialParser/getSTForModulePart',
    PARTIAL_PARSE_RESOURCE = 'partialParser/getSTForResource',
    EXAMPLE_LIST = 'ballerinaExample/list',
    PERF_ANALYZER_RESOURCES_ENDPOINTS = 'performanceAnalyzer/getResourcesWithEndpoints',
    RESOLVE_MISSING_DEPENDENCIES = 'ballerinaDocument/resolveMissingDependencies',
    BALLERINA_TO_OPENAPI = 'openAPILSExtension/generateOpenAPI',
    NOTEBOOK_RESULT = "balShell/getResult",
    NOTEBOOK_FILE_SOURCE = "balShell/getShellFileSource",
    NOTEBOOK_RESTART = "balShell/restartNotebook",
    NOTEBOOK_VARIABLES = "balShell/getVariableValues",
    NOTEBOOK_DELETE_DCLNS = "balShell/deleteDeclarations",
    SYMBOL_DOC = 'ballerinaSymbol/getSymbol',
    SYMBOL_TYPE_FROM_EXPRESSION = 'ballerinaSymbol/getTypeFromExpression',
    SYMBOL_TYPE_FROM_SYMBOL = 'ballerinaSymbol/getTypeFromSymbol',
    SYMBOL_TYPES_FROM_FN_SIGNATURE = 'ballerinaSymbol/getTypesFromFnDefinition',
    COMPONENT_MODEL_ENDPOINT = 'projectDesignService/getProjectComponentModels',
    DOCUMENT_ST_FUNCTION = 'ballerinaDocument/syntaxTreeByName'
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
    BALLERINA_TO_OPENAPI = 'openAPILSExtension',
    NOTEBOOK_SUPPORT = "balShell"
}

export enum DIAGNOSTIC_SEVERITY {
    INTERNAL = "INTERNAL",
    HINT = "HINT",
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR"
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
    forceFormatRecordFields?: boolean;
}

export interface JsonToRecordResponse {
    codeBlock: string;
    diagnostics?: JsonToRecordMapperDiagnostic[];
}

export interface JsonToRecordMapperDiagnostic {
    message: string;
    severity?: DIAGNOSTIC_SEVERITY;
}

export interface NoteBookCellOutputRequest {
    source: string;
}

export interface NoteBookCellOutputValue {
    value: string;
    mimeType: string;
    type: string;
}

export interface NotebookCellMetaInfo {
    definedVars: string[];
    moduleDclns: string[];
}

export interface NoteBookCellOutputResponse {
    shellValue?: NoteBookCellOutputValue;
    errors: string[];
    diagnostics: string[];
    metaInfo?: NotebookCellMetaInfo;
    consoleOut: string;
}

export interface NotebookFileSourceResponse {
    content: string;
    filePath: string;
}

export interface NotebookVariable {
    name: string;
    type: string;
    value: string;
}

export interface NotebookDeleteDclnRequest {
    varToDelete: string;
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

export interface GetPackageComponentModelsRequest {
    documentUris: string[]
}

export interface GetPackageComponentModelsResponse {
    componentModels: Map<string, ComponentModel>;
    diagnostics: ComponentModelDiagnostics[];
}

export interface ComponentModelDiagnostics {
    message: string;
    severity?: DIAGNOSTIC_SEVERITY;
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
    filePath: string;
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

export interface PerformanceAnalyzerRequest {
    documentIdentifier: DocumentIdentifier;
    isWorkerSupported: boolean;
}

export interface PerformanceAnalyzerResponse {
    resourcePos: Range;
    endpoints: any;
    actionInvocations: any;
    type: string;
    message: string;
    name: string;
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

export interface APITimeConsumption {
    diagnostics: number[];
    completion: number[];
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
    name: string,
    description: string,
    kind: string,
    type: string
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

export interface TypesFromFnDefinitionRequest {
    documentIdentifier: {
        uri: string;
    };
    fnPosition: LinePosition;
    returnTypeDescPosition: LinePosition;
}

export interface ResolvedTypeForSymbol {
    type: FormField;
    requestedPosition: LinePosition;
}

export interface TypesFromSymbolResponse {
    types: ResolvedTypeForSymbol[];
}

interface NOT_SUPPORTED_TYPE {

};

export class ExtendedLangClient extends LanguageClient {
    private ballerinaExtendedServices: Set<String> | undefined;
    private isDynamicRegistrationSupported: boolean;
    isInitialized: boolean = true;
    private ballerinaExtInstance: BallerinaExtension | undefined;
    private timeConsumption: APITimeConsumption;
    private initBalRequestSent = false;

    constructor(id: string, name: string, serverOptions: ServerOptions, clientOptions: LanguageClientOptions,
        ballerinaExtInstance: BallerinaExtension | undefined, forceDebug?: boolean) {
        super(id, name, serverOptions, clientOptions, forceDebug);
        this.isDynamicRegistrationSupported = true;
        this.ballerinaExtInstance = ballerinaExtInstance;
        this.timeConsumption = { diagnostics: [], completion: [] };
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
    async definition(params: DefinitionParams): Promise<Location | Location[] | LocationLink[]> {
        return this.sendRequest<Location | Location[] | LocationLink[]>("textDocument/definition", params);
    }
    async getResourcesWithEndpoints(params: PerformanceAnalyzerRequest, skipLogin?: boolean): Promise<PerformanceAnalyzerResponse[] | NOT_SUPPORTED_TYPE> {
        if (!skipLogin && (!this.ballerinaExtInstance?.enabledPerformanceForecasting() ||
            !this.ballerinaExtInstance?.getChoreoSession().loginStatus ||
            this.ballerinaExtInstance.getPerformanceForecastContext().temporaryDisabled)) {
            return Promise.resolve([{
                type: 'error', message: "error",
                endpoints: null, actionInvocations: null,
                resourcePos: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
                name: ""
            }]);
        }
        // const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.PERF_ANALYZER_RESOURCES_ENDPOINTS);
        const isSupported = true;
        return isSupported ? this.sendRequest(EXTENDED_APIS.PERF_ANALYZER_RESOURCES_ENDPOINTS, params) :
            Promise.resolve(NOT_SUPPORTED);
    }
    async getPackageComponentModels(params: GetPackageComponentModelsRequest): Promise<GetPackageComponentModelsResponse> {
        return this.sendRequest(EXTENDED_APIS.COMPONENT_MODEL_ENDPOINT, params);
    }
    async getDiagnostics(params: BallerinaProjectParams): Promise<PublishDiagnosticsParams[] | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_DIAGNOSTICS);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        const start = new Date().getTime();
        const response = await this.sendRequest<PublishDiagnosticsParams[]>(EXTENDED_APIS.DOCUMENT_DIAGNOSTICS, params);
        this.timeConsumption.diagnostics.push(new Date().getTime() - start);
        return response;
    }
    async getCompletion(params: CompletionParams): Promise<CompletionResponse[]> {
        const start = new Date().getTime();
        const resoponse: CompletionResponse[] = await this.sendRequest("textDocument/completion", params);
        this.timeConsumption.completion.push(new Date().getTime() - start);
        return resoponse;
    }
    async getType(params: ExpressionTypeRequest): Promise<ExpressionTypeResponse | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.SYMBOL_TYPE);
        return isSupported ? this.sendRequest(EXTENDED_APIS.SYMBOL_TYPE, params) : Promise.resolve(NOT_SUPPORTED);
    }
    async getConnectors(params: BallerinaConnectorsRequest, reset?: boolean): Promise<BallerinaConnectorsResponse | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.CONNECTOR_CONNECTORS);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        if (!reset && params.query === "" && !params.keyword && !params.organization && !params.offset) {
            let connectorList = this.ballerinaExtInstance?.context?.globalState.get(CONNECTOR_LIST_CACHE) as BallerinaConnectorsResponse;
            if (connectorList && connectorList.central?.length > 0) {
                return Promise.resolve().then(() => connectorList);
            }
        } else if (!reset && params.query === "http" && !params.keyword && !params.organization && !params.offset) {
            const connectorList = this.ballerinaExtInstance?.context?.globalState.get(HTTP_CONNECTOR_LIST_CACHE) as BallerinaConnectorsResponse;
            if (connectorList && connectorList.central?.length > 0) {
                return Promise.resolve().then(() => connectorList);
            }
        }
        return this.sendRequest<BallerinaConnectorsResponse>(EXTENDED_APIS.CONNECTOR_CONNECTORS, params);
    }
    async getTriggers(params: BallerinaTriggersRequest): Promise<BallerinaTriggersResponse | NOT_SUPPORTED_TYPE> {
        // const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.TRIGGER_TRIGGERS);
        const isSupported = true;
        return isSupported ? this.sendRequest<BallerinaTriggersResponse>(EXTENDED_APIS.TRIGGER_TRIGGERS, params) :
            Promise.resolve(NOT_SUPPORTED);
    }
    async getConnector(params: BallerinaConnectorRequest): Promise<BallerinaConnectorResponse | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.CONNECTOR_CONNECTOR)
        return isSupported ? this.sendRequest<BallerinaConnectorResponse>(EXTENDED_APIS.CONNECTOR_CONNECTOR, params) :
            Promise.resolve(NOT_SUPPORTED);
    }
    async getTrigger(params: BallerinaTriggerRequest): Promise<BallerinaTriggerResponse | NOT_SUPPORTED_TYPE> {
        // const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.TRIGGER_TRIGGER);
        const isSupported = true;
        return isSupported ? this.sendRequest<BallerinaTriggerResponse>(EXTENDED_APIS.TRIGGER_TRIGGER, params) :
            Promise.resolve(NOT_SUPPORTED);
    }
    async getRecord(params: BallerinaRecordRequest): Promise<BallerinaRecordResponse | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.CONNECTOR_RECORD);
        return isSupported ? this.sendRequest<BallerinaRecordResponse>(EXTENDED_APIS.CONNECTOR_RECORD, params) :
            Promise.resolve(NOT_SUPPORTED);
    }
    async astModify(params: BallerinaSTModifyRequest): Promise<BallerinaSTModifyResponse | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_AST_MODIFY);
        return isSupported ? this.sendRequest<BallerinaSTModifyResponse>(EXTENDED_APIS.DOCUMENT_AST_MODIFY, params) :
            Promise.resolve(NOT_SUPPORTED);
    }
    async stModify(params: BallerinaSTModifyRequest): Promise<BallerinaSTModifyResponse | NOT_SUPPORTED_TYPE> {
        if (this.ballerinaExtInstance) {
            showChoreoPushMessage(this.ballerinaExtInstance);
            if (!this.ballerinaExtInstance.getChoreoSession().loginStatus) {
                showChoreoSigninMessage(this.ballerinaExtInstance);
            }
        }
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_ST_MODIFY)
        return isSupported ? this.sendRequest<BallerinaSTModifyResponse>(EXTENDED_APIS.DOCUMENT_ST_MODIFY, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async getSTForFunction(params: BallerinaSTModifyRequest): Promise<BallerinaSTModifyResponse | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_ST_FUNCTION)
        return isSupported ? this.sendRequest<BallerinaSTModifyResponse>(EXTENDED_APIS.DOCUMENT_ST_FUNCTION, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async triggerModify(params: TriggerModifyRequest): Promise<BallerinaSTModifyResponse | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_TRIGGER_MODIFY);
        return isSupported ? this.sendRequest<BallerinaSTModifyResponse>(EXTENDED_APIS.DOCUMENT_TRIGGER_MODIFY, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async getSymbolDocumentation(params: SymbolInfoRequest): Promise<SymbolInfoResponse | null> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.SYMBOL_DOC);
        return isSupported ? this.sendRequest<SymbolInfoResponse>(EXTENDED_APIS.SYMBOL_DOC, params) :
            Promise.resolve(null);
    }

    async getTypeFromExpression(params: TypeFromExpressionRequest): Promise<TypesFromExpressionResponse | null> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.SYMBOL_TYPE_FROM_EXPRESSION);
        return isSupported
            ? this.sendRequest<TypesFromExpressionResponse>(EXTENDED_APIS.SYMBOL_TYPE_FROM_EXPRESSION, params)
            : Promise.resolve(null);
    }

    async getTypeFromSymbol(params: TypeFromSymbolRequest): Promise<TypesFromSymbolResponse | null> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.SYMBOL_TYPE_FROM_SYMBOL);
        return isSupported
            ? this.sendRequest<TypesFromSymbolResponse>(EXTENDED_APIS.SYMBOL_TYPE_FROM_SYMBOL, params)
            : Promise.resolve(null);
    }

    async getTypesFromFnDefinition(params: TypesFromFnDefinitionRequest): Promise<TypesFromSymbolResponse | null> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.SYMBOL_TYPES_FROM_FN_SIGNATURE);
        return isSupported
            ? this.sendRequest<TypesFromSymbolResponse>(EXTENDED_APIS.SYMBOL_TYPES_FROM_FN_SIGNATURE, params)
            : Promise.resolve(null);
    }

    async rename(params: RenameParams): Promise<WorkspaceEdit | null> {
        return this.sendRequest("textDocument/rename", params);
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

    async getSyntaxTree(req: GetSyntaxTreeParams): Promise<GetSyntaxTreeResponse | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_ST);
        return isSupported ? this.sendRequest(EXTENDED_APIS.DOCUMENT_ST, req) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async fetchExamples(args: BallerinaExampleListRequest = {}): Promise<BallerinaExampleListResponse | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.EXAMPLE_LIST);
        return isSupported ? this.sendRequest(EXTENDED_APIS.EXAMPLE_LIST, args) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async getBallerinaProject(params: GetBallerinaProjectParams): Promise<BallerinaProject | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.PACKAGE_METADATA);
        return isSupported ? this.sendRequest(EXTENDED_APIS.PACKAGE_METADATA, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async getBallerinaProjectComponents(params: GetBallerinaPackagesParams): Promise<BallerinaProjectComponents | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.PACKAGE_COMPONENTS);
        return isSupported ? this.sendRequest(EXTENDED_APIS.PACKAGE_COMPONENTS, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async getBallerinaProjectConfigSchema(params: GetBallerinaProjectParams): Promise<PackageConfigSchemaResponse | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.PACKAGE_CONFIG_SCHEMA);
        return isSupported ? this.sendRequest(EXTENDED_APIS.PACKAGE_CONFIG_SCHEMA, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async getSyntaxTreeNode(params: SyntaxTreeNodeRequestParams): Promise<SyntaxTreeNodeResponse | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_ST_NODE);
        return isSupported ? this.sendRequest(EXTENDED_APIS.DOCUMENT_ST_NODE, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async getExecutorPositions(params: GetBallerinaProjectParams): Promise<ExecutorPositionsResponse | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_EXECUTOR_POSITIONS);
        return isSupported ? this.sendRequest(EXTENDED_APIS.DOCUMENT_EXECUTOR_POSITIONS, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async convertJsonToRecord(params: JsonToRecordRequest): Promise<JsonToRecordResponse | NOT_SUPPORTED_TYPE> {
        // const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.JSON_TO_RECORD_CONVERT);
        const isSupported = true;
        return isSupported ? this.sendRequest(EXTENDED_APIS.JSON_TO_RECORD_CONVERT, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async getBalShellResult(params: NoteBookCellOutputRequest): Promise<NoteBookCellOutputResponse | NOT_SUPPORTED_TYPE> {
        // const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.NOTEBOOK_RESULT);
        const isSupported = true;
        return isSupported ? this.sendRequest(EXTENDED_APIS.NOTEBOOK_RESULT, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async getShellBufferFilePath(): Promise<NotebookFileSourceResponse | NOT_SUPPORTED_TYPE> {
        // const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.NOTEBOOK_FILE_SOURCE);
        const isSupported = true;
        return isSupported ? this.sendRequest(EXTENDED_APIS.NOTEBOOK_FILE_SOURCE) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async restartNotebook(): Promise<boolean | NOT_SUPPORTED_TYPE> {
        // const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.NOTEBOOK_RESTART);
        const isSupported = true;
        return isSupported ? this.sendRequest(EXTENDED_APIS.NOTEBOOK_RESTART) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async getNotebookVariables(): Promise<NotebookVariable[] | NOT_SUPPORTED_TYPE> {
        // const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.NOTEBOOK_VARIABLES);
        const isSupported = true;
        return isSupported ? this.sendRequest(EXTENDED_APIS.NOTEBOOK_VARIABLES) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async deleteDeclarations(params: NotebookDeleteDclnRequest): Promise<boolean | NOT_SUPPORTED_TYPE> {
        // const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.NOTEBOOK_DELETE_DCLNS);
        const isSupported = true;
        return isSupported ? this.sendRequest(EXTENDED_APIS.NOTEBOOK_DELETE_DCLNS, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async getSTForSingleStatement(params: PartialSTRequestParams): Promise<PartialSTResponse | NOT_SUPPORTED_TYPE> {
        // const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.PARTIAL_PARSE_SINGLE_STATEMENT);
        const isSupported = true;
        return isSupported ? this.sendRequest(EXTENDED_APIS.PARTIAL_PARSE_SINGLE_STATEMENT, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async getSTForExpression(params: PartialSTRequestParams): Promise<PartialSTResponse | NOT_SUPPORTED_TYPE> {
        // const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.PARTIAL_PARSE_EXPRESSION);
        const isSupported = true;
        return isSupported ? this.sendRequest(EXTENDED_APIS.PARTIAL_PARSE_EXPRESSION, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    getSTForModulePart(params: PartialSTRequestParams): Promise<PartialSTResponse | NOT_SUPPORTED_TYPE> {
        // const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.PARTIAL_PARSE_MODULE_PART);
        const isSupported = true;
        return isSupported ? this.sendRequest(EXTENDED_APIS.PARTIAL_PARSE_MODULE_PART, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    getSTForResource(params: PartialSTRequestParams): Promise<PartialSTResponse | NOT_SUPPORTED_TYPE> {
        // const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.PARTIAL_PARSE_MODULE_PART);
        const isSupported = true;
        return isSupported ? this.sendRequest(EXTENDED_APIS.PARTIAL_PARSE_RESOURCE, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async getSTForModuleMembers(params: PartialSTRequestParams): Promise<PartialSTResponse | NOT_SUPPORTED_TYPE> {
        // const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.PARTIAL_PARSE_MODULE_MEMBER);
        const isSupported = true;
        return isSupported ? this.sendRequest(EXTENDED_APIS.PARTIAL_PARSE_MODULE_MEMBER, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    async resolveMissingDependencies(req: GetSyntaxTreeParams): Promise<GetSyntaxTreeResponse | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.RESOLVE_MISSING_DEPENDENCIES);
        return isSupported ? this.sendRequest(EXTENDED_APIS.RESOLVE_MISSING_DEPENDENCIES, req) :
            Promise.resolve(NOT_SUPPORTED);
    }

    initBalServices(params: BallerinaInitializeParams): Promise<BallerinaInitializeResult> {
        return this.sendRequest("initBalServices", params);
    }

    async convertToOpenAPI(params: OpenAPIConverterRequest): Promise<OpenAPIConverterResponse | NOT_SUPPORTED_TYPE> {
        // const isSupported: boolean = await this.isExtendedServiceSupported(EXTENDED_APIS.BALLERINA_TO_OPENAPI);
        const isSupported = true;
        return isSupported ? this.sendRequest(EXTENDED_APIS.BALLERINA_TO_OPENAPI, params) :
            Promise.resolve(NOT_SUPPORTED);
    }

    codeAction(params: CodeActionParams): Promise<CodeAction[]> {
        return this.sendRequest("textDocument/codeAction", params);
    }

    executeCommand(params: ExecuteCommandParams): Promise<any> {
        return this.sendRequest("workspace/executeCommand", params);
    }

    async registerExtendedAPICapabilities(): Promise<Set<String>> {

        if (this.ballerinaExtendedServices || this.initBalRequestSent) {
            return Promise.resolve(this.ballerinaExtendedServices || new Set());
        }

        this.initBalRequestSent = true;

        await this.initBalServices({
            ballerinaClientCapabilities: [
                {
                    name: EXTENDED_APIS_ORG.DOCUMENT, syntaxTreeNode: true, executorPositions: true,
                    syntaxTreeModify: true, diagnostics: true, syntaxTree: true, astModify: true, triggerModify: true,
                    resolveMissingDependencies: true
                },
                { name: EXTENDED_APIS_ORG.PACKAGE, components: true, metadata: true, configSchema: true },
                {
                    name: EXTENDED_APIS_ORG.SYMBOL, type: true, getSymbol: true,
                    getTypeFromExpression: true, getTypeFromSymbol: true, getTypesFromFnDefinition: true
                },
                {
                    name: EXTENDED_APIS_ORG.CONNECTOR, connectors: true, connector: true, record: true
                },
                {
                    name: EXTENDED_APIS_ORG.TRIGGER, triggers: true, trigger: true
                },
                { name: EXTENDED_APIS_ORG.EXAMPLE, list: true },
                { name: EXTENDED_APIS_ORG.JSON_TO_RECORD, convert: true },
                { name: EXTENDED_APIS_ORG.PERF_ANALYZER, getResourcesWithEndpoints: true },
                { name: EXTENDED_APIS_ORG.PARTIAL_PARSER, getSTForSingleStatement: true, getSTForExpression: true, getSTForResource: true },
                { name: EXTENDED_APIS_ORG.BALLERINA_TO_OPENAPI, generateOpenAPI: true },
                {
                    name: EXTENDED_APIS_ORG.NOTEBOOK_SUPPORT, getResult: true, getShellFileSource: true,
                    getVariableValues: true, deleteDeclarations: true, restartNotebook: true
                }
            ]
        }).then(response => {
            const capabilities: Set<String> = new Set();
            response.ballerinaServerCapabilities.forEach((capability: BallerinaServerCapability) => {
                const keys: string[] = Object.keys(capability);
                const org: string = capability['name'];
                keys.forEach(key => {
                    if (key != 'name') {
                        capabilities.add(`${org}/${key}`);
                    }
                });
            });
            this.ballerinaExtendedServices = capabilities;
            return Promise.resolve(this.ballerinaExtendedServices);
        }).catch(_error => {
            this.isDynamicRegistrationSupported = false;
        });

        return Promise.resolve(new Set());
    }

    async isExtendedServiceSupported(serviceName: string): Promise<boolean> {
        if (!this.isDynamicRegistrationSupported) {
            return Promise.resolve(true);
        }

        return Promise.resolve((await this.registerExtendedAPICapabilities()).has(serviceName));
    }

    pushLSClientTelemetries() {
        if (this.timeConsumption.completion.length > 0) {
            const completionValues = calculateTelemetryValues(this.timeConsumption.completion, 'completion');
            sendTelemetryEvent(this.ballerinaExtInstance!, TM_EVENT_LANG_CLIENT, CMP_LS_CLIENT_COMPLETIONS,
                getMessageObject(process.env.HOSTNAME), completionValues);
            this.timeConsumption.completion = [];
        }

        if (this.timeConsumption.diagnostics.length > 0) {
            const diagnosticValues = calculateTelemetryValues(this.timeConsumption.diagnostics, 'diagnostic');
            this.timeConsumption.diagnostics = [];
            sendTelemetryEvent(this.ballerinaExtInstance!, TM_EVENT_LANG_CLIENT, CMP_LS_CLIENT_DIAGNOSTICS,
                getMessageObject(process.env.HOSTNAME), diagnosticValues);
        }
    }
}

function calculateTelemetryValues(array: number[], name: string): any {
    let values = {};
    let total = 0;
    let min = 99999999999;
    let max = -1;
    for (let i = 0; i < array.length; i++) {
        total += array[i];
        if (max < array[i]) {
            max = array[i];
        }
        if (min > array[i]) {
            min = array[i];
        }
    }
    values[name + '-average'] = total / array.length;
    values[name + '-min'] = min;
    values[name + '-max'] = max;
    return values;
}
