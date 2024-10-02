/**
 * Copyright (c) 2018, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { LanguageClient, LanguageClientOptions, ServerOptions } from "vscode-languageclient/node";
import { CodeAction, CodeActionParams, DocumentSymbol, DocumentSymbolParams, ExecuteCommandParams, RenameParams, SymbolInformation, WorkspaceEdit } from "monaco-languageclient";
import {
    Connectors,
    STModifyParams,
    SyntaxTree,
    DiagnosticsParams,
    CompletionParams,
    Completion,
    DidChangeParams,
    TypesFromExpression,
    NOT_SUPPORTED_TYPE,
    SymbolInfo,
    APITimeConsumption,
    BallerinaProject,
    NotebookVariable,
    DidOpenParams,
    DidCloseParams,
    BallerinaInitializeParams,
    BallerinaInitializeResult,
    ComponentModelsParams,
    ComponentModels,
    PersistERModelParams,
    PersistERModel,
    Diagnostics,
    TypeParams,
    ExpressionType,
    ConnectorsParams,
    TriggersParams,
    Triggers,
    Connector,
    TriggerParams,
    Trigger,
    RecordParams,
    BallerinaRecord,
    BallerinaSTParams,
    TriggerModifyParams,
    SymbolInfoParams,
    TypeFromExpressionParams,
    TypeFromSymbolParams,
    TypesFromFnDefinitionParams,
    GraphqlDesignServiceParams,
    SyntaxTreeParams,
    BallerinaExampleListParams,
    BallerinaExampleList,
    BallerinaProjectParams,
    BallerinaPackagesParams,
    BallerinaProjectComponents,
    PackageConfigSchema,
    SyntaxTreeNodeParams,
    SyntaxTreeNode,
    ExecutorPositions,
    JsonToRecordParams,
    XMLToRecordParams,
    XMLToRecord,
    JsonToRecord,
    NoteBookCellOutputParams,
    NoteBookCellOutput,
    NotebookFileSource,
    NotebookDeleteDclnParams,
    PartialSTParams,
    OpenAPIConverterParams,
    OpenAPISpec,
    TypesFromSymbol,
    GraphqlDesignService,
    PartialST,
    BallerinaServerCapability,
    ExtendedLangClientInterface,
    EggplantAvailableNodesRequest,
    EggplantAvailableNodesResponse,
    EggplantNodeTemplateRequest,
    EggplantNodeTemplateResponse,
    EggplantFlowModelRequest,
    EggplantFlowModelResponse,
    EggplantSourceCodeRequest,
    EggplantSourceCodeResponse,
    EggplantConnectorsRequest,
    EggplantConnectorsResponse,
    ConnectorRequest,
    ConnectorResponse,
    EggplantSuggestedFlowModelRequest,
    EggplantCopilotContextRequest,
    EggplantCopilotContextResponse,
    SequenceModelRequest,
    SequenceModelResponse,
    ServiceFromOASRequest,
    ServiceFromOASResponse,
    EggplantGetFunctionsRequest,
    EggplantGetFunctionsResponse,
} from "@wso2-enterprise/ballerina-core";
import { BallerinaExtension } from "./index";
import { debug } from "../utils";
import { CMP_LS_CLIENT_COMPLETIONS, CMP_LS_CLIENT_DIAGNOSTICS, getMessageObject, sendTelemetryEvent, TM_EVENT_LANG_CLIENT } from "../features/telemetry";
import { CancellationToken, DefinitionParams, InitializeParams, InitializeResult, Location, LocationLink, TextDocumentPositionParams } from 'vscode-languageserver-protocol';

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
    XML_TO_RECORD_CONVERT = 'xmlToRecord/convert',
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
    GRAPHQL_DESIGN_MODEL = 'graphqlDesignService/getGraphqlModel',
    DOCUMENT_ST_FUNCTION = 'ballerinaDocument/syntaxTreeByName',
    DEFINITION_POSITION = 'ballerinaDocument/syntaxTreeNodeByPosition',
    PERSIST_MODEL_ENDPOINT = 'persistERGeneratorService/getPersistERModels',
    DOCUMENT_ST_BY_RANGE = 'ballerinaDocument/syntaxTreeByRange',
    SEQUENCE_DIAGRAM_MODEL = 'sequenceModelGeneratorService/getSequenceDiagramModel',
    EGGPLANT_FLOW_MODEL = 'flowDesignService/getFlowModel',
    EGGPLANT_SUGGESTED_FLOW_MODEL = 'flowDesignService/getSuggestedFlowModel',
    EGGPLANT_COPILOT_CONTEXT = 'flowDesignService/getCopilotContext',
    EGGPLANT_SOURCE_CODE = 'flowDesignService/getSourceCode',
    EGGPLANT_DELETE_NODE = 'flowDesignService/deleteFlowNode',
    EGGPLANT_AVAILABLE_NODES = 'flowDesignService/getAvailableNodes',
    EGGPLANT_GET_FUNCTIONS = 'flowDesignService/getFunctions',
    EGGPLANT_NODE_TEMPLATE = 'flowDesignService/getNodeTemplate',
    EGGPLANT_CONNECTOR = 'flowDesignService/getConnectors',
    EGGPLANT_GEN_OPEN_API = 'flowDesignService/generateServiceFromOpenApiContract'
}

enum EXTENDED_APIS_ORG {
    DOCUMENT = 'ballerinaDocument',
    PACKAGE = 'ballerinaPackage',
    EXAMPLE = 'ballerinaExample',
    JSON_TO_RECORD = 'jsonToRecord',
    XML_TO_RECORD = 'xmlToRecord',
    SYMBOL = 'ballerinaSymbol',
    CONNECTOR = 'ballerinaConnector',
    TRIGGER = 'ballerinaTrigger',
    PERF_ANALYZER = 'performanceAnalyzer',
    PARTIAL_PARSER = 'partialParser',
    BALLERINA_TO_OPENAPI = 'openAPILSExtension',
    NOTEBOOK_SUPPORT = "balShell",
    GRAPHQL_DESIGN = "graphqlDesignService",
    SEQUENCE_DIAGRAM = "sequenceModelGeneratorService"
}

export enum DIAGNOSTIC_SEVERITY {
    INTERNAL = "INTERNAL",
    HINT = "HINT",
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR"
}

enum VSCODE_APIS {
    DID_OPEN = 'textDocument/didOpen',
    DID_CLOSE = 'textDocument/didClose',
    DID_CHANGE = 'textDocument/didChange',
    DEFINITION = 'textDocument/definition',
    COMPLETION = 'textDocument/completion',
    RENAME = 'textDocument/rename',
    DOC_SYMBOL = 'textDocument/documentSymbol',
    CODE_ACTION = 'textDocument/codeAction',
    EXECUTE_CMD = 'workspace/executeCommand',
    PUBLISH_DIAGNOSTICS = 'textDocument/publishDiagnostics'
}

export class ExtendedLangClient extends LanguageClient implements ExtendedLangClientInterface {
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
    init?: (params: InitializeParams) => Promise<InitializeResult>;

    // <------------ VS CODE RELATED APIS START --------------->
    didOpen(params: DidOpenParams): void {
        debug(`didOpen at ${new Date()} - ${new Date().getTime()}`);
        this.sendNotification(VSCODE_APIS.DID_OPEN, params);
    }

    didClose(params: DidCloseParams): void {
        debug(`didClose at ${new Date()} - ${new Date().getTime()}`);
        this.sendNotification(VSCODE_APIS.DID_CLOSE, params);
    }

    didChange(params: DidChangeParams): void {
        debug(`didChange at ${new Date()} - ${new Date().getTime()}`);
        this.sendNotification(VSCODE_APIS.DID_CHANGE, params);
    }

    registerPublishDiagnostics(): void {
        this.onNotification(VSCODE_APIS.PUBLISH_DIAGNOSTICS, () => {
        });
    }

    async definition(params: DefinitionParams): Promise<Location | Location[] | LocationLink[]> {
        return this.sendRequest<Location | Location[] | LocationLink[]>(VSCODE_APIS.DEFINITION, params);
    }

    async getCompletion(params: CompletionParams): Promise<Completion[]> {
        const start = new Date().getTime();
        const response: Completion[] = await this.sendRequest(VSCODE_APIS.COMPLETION, params);
        this.timeConsumption.completion.push(new Date().getTime() - start);
        return response;
    }

    async rename(params: RenameParams): Promise<WorkspaceEdit | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(VSCODE_APIS.RENAME, params);
    }

    async getDocumentSymbol(params: DocumentSymbolParams): Promise<DocumentSymbol[] | SymbolInformation[] | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(VSCODE_APIS.DOC_SYMBOL, params);
    }

    async codeAction(params: CodeActionParams): Promise<CodeAction[]> {
        return this.sendRequest(VSCODE_APIS.CODE_ACTION, params);
    }

    async executeCommand(params: ExecuteCommandParams): Promise<any> {
        return this.sendRequest(VSCODE_APIS.EXECUTE_CMD, params);
    }
    // <------------ VS CODE RELATED APIS END --------------->

    // <------------ EXTENDED APIS START --------------->
    async initBalServices(params: BallerinaInitializeParams): Promise<BallerinaInitializeResult> {
        return this.sendRequest("initBalServices", params);
    }

    async getPackageComponentModels(params: ComponentModelsParams): Promise<ComponentModels> {
        return this.sendRequest(EXTENDED_APIS.COMPONENT_MODEL_ENDPOINT, params);
    }

    async getPersistERModel(params: PersistERModelParams): Promise<PersistERModel> {
        return this.sendRequest(EXTENDED_APIS.PERSIST_MODEL_ENDPOINT, params);
    }

    async getDiagnostics(params: DiagnosticsParams): Promise<Diagnostics[] | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_DIAGNOSTICS);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        const start = new Date().getTime();
        const response = await this.sendRequest<Diagnostics[]>(EXTENDED_APIS.DOCUMENT_DIAGNOSTICS, params);
        this.timeConsumption.diagnostics.push(new Date().getTime() - start);
        return response;
    }

    async getType(params: TypeParams): Promise<ExpressionType | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(EXTENDED_APIS.SYMBOL_TYPE, params);
    }

    async getConnectors(params: ConnectorsParams, reset?: boolean): Promise<Connectors | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.CONNECTOR_CONNECTORS);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        if (!reset && params.query === "" && !params.keyword && !params.organization && !params.offset) {
            let connectorList = this.ballerinaExtInstance?.context?.globalState.get(CONNECTOR_LIST_CACHE) as Connectors;
            if (connectorList && connectorList.central?.length > 0) {
                return Promise.resolve().then(() => connectorList);
            }
        } else if (!reset && params.query === "http" && !params.keyword && !params.organization && !params.offset) {
            const connectorList = this.ballerinaExtInstance?.context?.globalState.get(HTTP_CONNECTOR_LIST_CACHE) as Connectors;
            if (connectorList && connectorList.central?.length > 0) {
                return Promise.resolve().then(() => connectorList);
            }
        }
        return this.sendRequest<Connectors>(EXTENDED_APIS.CONNECTOR_CONNECTORS, params);
    }

    async getTriggers(params: TriggersParams): Promise<Triggers | NOT_SUPPORTED_TYPE> {
        return this.sendRequest<Triggers>(EXTENDED_APIS.TRIGGER_TRIGGERS, params);
    }

    async getConnector(params: ConnectorRequest): Promise<ConnectorResponse | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.CONNECTOR_CONNECTOR);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<Connector>(EXTENDED_APIS.CONNECTOR_CONNECTOR, params);
    }

    async getTrigger(params: TriggerParams): Promise<Trigger | NOT_SUPPORTED_TYPE> {
        return this.sendRequest<Trigger>(EXTENDED_APIS.TRIGGER_TRIGGER, params);
    }

    async getRecord(params: RecordParams): Promise<BallerinaRecord | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.CONNECTOR_RECORD);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<BallerinaRecord>(EXTENDED_APIS.CONNECTOR_RECORD, params);
    }

    async astModify(params: STModifyParams): Promise<SyntaxTree | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_AST_MODIFY);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<SyntaxTree>(EXTENDED_APIS.DOCUMENT_AST_MODIFY, params);
    }

    async stModify(params: STModifyParams): Promise<SyntaxTree | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_ST_MODIFY);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<SyntaxTree>(EXTENDED_APIS.DOCUMENT_ST_MODIFY, params);
    }

    async getSTForFunction(params: STModifyParams): Promise<SyntaxTree | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_ST_FUNCTION);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<SyntaxTree>(EXTENDED_APIS.DOCUMENT_ST_FUNCTION, params);
    }

    async getDefinitionPosition(params: TextDocumentPositionParams): Promise<SyntaxTree | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DEFINITION_POSITION);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<SyntaxTree>(EXTENDED_APIS.DEFINITION_POSITION, params);
    }

    async getSTByRange(params: BallerinaSTParams): Promise<SyntaxTree | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_ST_BY_RANGE);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<SyntaxTree>(EXTENDED_APIS.DOCUMENT_ST_BY_RANGE, params);
    }

    async triggerModify(params: TriggerModifyParams): Promise<SyntaxTree | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_TRIGGER_MODIFY);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<SyntaxTree>(EXTENDED_APIS.DOCUMENT_TRIGGER_MODIFY, params);
    }

    async getSymbolDocumentation(params: SymbolInfoParams): Promise<SymbolInfo | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.SYMBOL_DOC);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<SymbolInfo>(EXTENDED_APIS.SYMBOL_DOC, params);
    }

    async getTypeFromExpression(params: TypeFromExpressionParams): Promise<TypesFromExpression | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.SYMBOL_TYPE_FROM_EXPRESSION);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<TypesFromExpression>(EXTENDED_APIS.SYMBOL_TYPE_FROM_EXPRESSION, params);
    }

    async getTypeFromSymbol(params: TypeFromSymbolParams): Promise<TypesFromSymbol | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.SYMBOL_TYPE_FROM_SYMBOL);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<TypesFromSymbol>(EXTENDED_APIS.SYMBOL_TYPE_FROM_SYMBOL, params);
    }

    async getTypesFromFnDefinition(params: TypesFromFnDefinitionParams): Promise<TypesFromSymbol | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.SYMBOL_TYPES_FROM_FN_SIGNATURE);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest<TypesFromSymbol>(EXTENDED_APIS.SYMBOL_TYPES_FROM_FN_SIGNATURE, params);
    }

    async getGraphqlModel(params: GraphqlDesignServiceParams): Promise<GraphqlDesignService | NOT_SUPPORTED_TYPE> {
        return this.sendRequest<GraphqlDesignService>(EXTENDED_APIS.GRAPHQL_DESIGN_MODEL, params);
    }

    async getSyntaxTree(req: SyntaxTreeParams): Promise<SyntaxTree | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_ST);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.DOCUMENT_ST, req);
    }

    async fetchExamples(args: BallerinaExampleListParams = {}): Promise<BallerinaExampleList | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.EXAMPLE_LIST);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.EXAMPLE_LIST, args);
    }

    async getBallerinaProject(params: BallerinaProjectParams): Promise<BallerinaProject | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.PACKAGE_METADATA);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.PACKAGE_METADATA, params);
    }

    async getBallerinaProjectComponents(params: BallerinaPackagesParams): Promise<BallerinaProjectComponents | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.PACKAGE_COMPONENTS);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.PACKAGE_COMPONENTS, params);
    }

    async getBallerinaProjectConfigSchema(params: BallerinaProjectParams): Promise<PackageConfigSchema | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.PACKAGE_CONFIG_SCHEMA);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.PACKAGE_CONFIG_SCHEMA, params);
    }

    async getSyntaxTreeNode(params: SyntaxTreeNodeParams): Promise<SyntaxTreeNode | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_ST_NODE);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.DOCUMENT_ST_NODE, params);
    }

    async getExecutorPositions(params: BallerinaProjectParams): Promise<ExecutorPositions | NOT_SUPPORTED_TYPE> {
        const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.DOCUMENT_EXECUTOR_POSITIONS);
        if (!isSupported) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.DOCUMENT_EXECUTOR_POSITIONS, params);
    }

    async convertJsonToRecord(params: JsonToRecordParams): Promise<JsonToRecord | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(EXTENDED_APIS.JSON_TO_RECORD_CONVERT, params);
    }

    async convertXMLToRecord(params: XMLToRecordParams): Promise<XMLToRecord | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(EXTENDED_APIS.XML_TO_RECORD_CONVERT, params);
    }

    async getBalShellResult(params: NoteBookCellOutputParams): Promise<NoteBookCellOutput | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(EXTENDED_APIS.NOTEBOOK_RESULT, params);
    }

    async getShellBufferFilePath(): Promise<NotebookFileSource | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(EXTENDED_APIS.NOTEBOOK_FILE_SOURCE);
    }

    async restartNotebook(): Promise<boolean | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(EXTENDED_APIS.NOTEBOOK_RESTART);
    }

    async getNotebookVariables(): Promise<NotebookVariable[] | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(EXTENDED_APIS.NOTEBOOK_VARIABLES);
    }

    async deleteDeclarations(params: NotebookDeleteDclnParams): Promise<boolean | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(EXTENDED_APIS.NOTEBOOK_DELETE_DCLNS, params);
    }

    async getSTForSingleStatement(params: PartialSTParams): Promise<PartialST | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(EXTENDED_APIS.PARTIAL_PARSE_SINGLE_STATEMENT, params);
    }

    async getSTForExpression(params: PartialSTParams): Promise<PartialST | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(EXTENDED_APIS.PARTIAL_PARSE_EXPRESSION, params);
    }

    async getSTForModulePart(params: PartialSTParams): Promise<PartialST | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(EXTENDED_APIS.PARTIAL_PARSE_MODULE_PART, params);
    }

    async getSTForResource(params: PartialSTParams): Promise<PartialST | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(EXTENDED_APIS.PARTIAL_PARSE_RESOURCE, params);
    }

    async getSTForModuleMembers(params: PartialSTParams): Promise<PartialST | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(EXTENDED_APIS.PARTIAL_PARSE_MODULE_MEMBER, params);
    }

    async resolveMissingDependencies(req: SyntaxTreeParams, cancellationToken?: CancellationToken): Promise<SyntaxTree | NOT_SUPPORTED_TYPE> {
        if (cancellationToken?.isCancellationRequested) {
            return Promise.resolve(NOT_SUPPORTED);
        }
        return this.sendRequest(EXTENDED_APIS.RESOLVE_MISSING_DEPENDENCIES, req, cancellationToken);
    }

    async convertToOpenAPI(params: OpenAPIConverterParams): Promise<OpenAPISpec | NOT_SUPPORTED_TYPE> {
        return this.sendRequest(EXTENDED_APIS.BALLERINA_TO_OPENAPI, params);
    }

    // <------------ EXTENDED APIS END --------------->

    // <------------ EGGPLANT APIS START --------------->

    async getFlowModel(params: EggplantFlowModelRequest): Promise<EggplantFlowModelResponse> {
        return this.sendRequest<EggplantFlowModelResponse>(EXTENDED_APIS.EGGPLANT_FLOW_MODEL, params);
    }

    async getSourceCode(params: EggplantSourceCodeRequest): Promise<EggplantSourceCodeResponse> {
        return this.sendRequest<EggplantSourceCodeResponse>(EXTENDED_APIS.EGGPLANT_SOURCE_CODE, params);
    }

    async getAvailableNodes(params: EggplantAvailableNodesRequest): Promise<EggplantAvailableNodesResponse> {
        return this.sendRequest<EggplantAvailableNodesResponse>(EXTENDED_APIS.EGGPLANT_AVAILABLE_NODES, params);
    }

    async getFunctions(params: EggplantGetFunctionsRequest): Promise<EggplantGetFunctionsResponse> {
        return this.sendRequest<EggplantGetFunctionsResponse>(EXTENDED_APIS.EGGPLANT_GET_FUNCTIONS, params);
    }

    async getNodeTemplate(params: EggplantNodeTemplateRequest): Promise<EggplantNodeTemplateResponse> {
        return this.sendRequest<EggplantNodeTemplateResponse>(EXTENDED_APIS.EGGPLANT_NODE_TEMPLATE, params);
    }

    async getEggplantConnectors(params: EggplantConnectorsRequest): Promise<EggplantConnectorsResponse> {
        return this.sendRequest<EggplantConnectorsResponse>(EXTENDED_APIS.EGGPLANT_CONNECTOR, params);
    }

    async generateServiceFromOAS(params: ServiceFromOASRequest): Promise<ServiceFromOASResponse> {
        return this.sendRequest<ServiceFromOASResponse>(EXTENDED_APIS.EGGPLANT_GEN_OPEN_API, params);
    }

    async getSuggestedFlowModel(params: EggplantSuggestedFlowModelRequest): Promise<EggplantFlowModelResponse> {
        return this.sendRequest<EggplantFlowModelResponse>(EXTENDED_APIS.EGGPLANT_SUGGESTED_FLOW_MODEL, params);
    }

    async getCopilotContext(params: EggplantCopilotContextRequest): Promise<EggplantCopilotContextResponse> {
        return this.sendRequest<EggplantCopilotContextResponse>(EXTENDED_APIS.EGGPLANT_COPILOT_CONTEXT, params);
    }

    async deleteFlowNode(params: EggplantSourceCodeRequest): Promise<EggplantSourceCodeResponse> {
        return this.sendRequest<EggplantSourceCodeResponse>(EXTENDED_APIS.EGGPLANT_DELETE_NODE, params);
    }

    async getSequenceDiagramModel(params: SequenceModelRequest): Promise<SequenceModelResponse> {
        // const isSupported = await this.isExtendedServiceSupported(EXTENDED_APIS.SEQUENCE_DIAGRAM_MODEL);
        return this.sendRequest(EXTENDED_APIS.SEQUENCE_DIAGRAM_MODEL, params);
    }

    // <------------ EGGPLANT APIS END --------------->


    // <------------ OTHER UTILS START --------------->

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
                { name: EXTENDED_APIS_ORG.XML_TO_RECORD, convert: true },
                { name: EXTENDED_APIS_ORG.PERF_ANALYZER, getResourcesWithEndpoints: true },
                { name: EXTENDED_APIS_ORG.PARTIAL_PARSER, getSTForSingleStatement: true, getSTForExpression: true, getSTForResource: true },
                { name: EXTENDED_APIS_ORG.BALLERINA_TO_OPENAPI, generateOpenAPI: true },
                { name: EXTENDED_APIS_ORG.GRAPHQL_DESIGN, getGraphqlModel: true },
                { name: EXTENDED_APIS_ORG.SEQUENCE_DIAGRAM, getSequenceDiagramModel: true },
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

    public pushLSClientTelemetries() {
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

    public close(): void {
    }

    public updateStatusBar() {
        if (!this.ballerinaExtInstance || !this.ballerinaExtInstance.getCodeServerContext().statusBarItem) {
            return;
        }
        this.ballerinaExtInstance.getCodeServerContext().statusBarItem?.updateGitStatus();
    }

    public getDidOpenParams(): DidOpenParams {
        return {
            textDocument: {
                uri: "file://",
                languageId: "ballerina",
                text: '',
                version: 1
            }
        };
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
