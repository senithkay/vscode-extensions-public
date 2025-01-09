/* eslint-disable @typescript-eslint/no-explicit-any */
/**
* Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 LLC. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
* You may not alter or remove any copyright or other notice from copies of this content.
*/

import { CodeAction, Diagnostic, DocumentSymbol, SymbolInformation, TextDocumentItem, WorkspaceEdit } from "vscode-languageserver-types";
import { CMDiagnostics, ComponentModel } from "./component";
import { DocumentIdentifier, LinePosition, LineRange, NOT_SUPPORTED_TYPE, Range } from "./common";
import { BallerinaConnectorInfo, BallerinaExampleCategory, BallerinaModuleResponse, BallerinaModulesRequest, BallerinaTrigger, BallerinaTriggerInfo, BallerinaConnector, ExecutorPosition, ExpressionRange, JsonToRecordMapperDiagnostic, MainTriggerModifyRequest, NoteBookCellOutputValue, NotebookCellMetaInfo, OASpec, PackageSummary, PartialSTModification, ResolvedTypeForExpression, ResolvedTypeForSymbol, STModification, SequenceModel, SequenceModelDiagnostic, ServiceTriggerModifyRequest, SymbolDocumentation, XMLToRecordConverterDiagnostic, TypeField, ComponentInfo } from "./ballerina";
import { ModulePart, STNode } from "@wso2-enterprise/syntax-tree";
import { CodeActionParams, DefinitionParams, DocumentSymbolParams, ExecuteCommandParams, InitializeParams, InitializeResult, LocationLink, RenameParams } from "vscode-languageserver-protocol";
import { Category, Flow, FlowNode, CodeData, ConfigVariable } from "./bi";
import { ConnectorRequest, ConnectorResponse } from "../rpc-types/connector-wizard/interfaces";
import { SqFlow } from "../rpc-types/sequence-diagram/interfaces";
import { TriggerFunction, TriggerNode } from "./triggers";
import { FunctionModel, ListenerModel, ServiceModel } from "./service";
import { CDModel } from "./component-diagram";

export interface DidOpenParams {
    textDocument: TextDocumentItem;
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

export interface Completion {
    detail: string;
    insertText: string;
    insertTextFormat: number;
    kind: number;
    label: string;
    additionalTextEdits?: TextEdit[];
    documentation?: string;
    sortText?: string;
    filterText?: string;
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


// <-------- BALLERINA RELATED --------->

interface BallerinaCapability {
    name: string;
    [key: string]: boolean | string;
}

export interface BallerinaInitializeParams {
    ballerinaClientCapabilities: BallerinaCapability[];
}

export interface BallerinaInitializeResult {
    ballerinaServerCapabilities: BallerinaCapability[];
}

export interface ComponentModelsParams {
    documentUris: string[];
}

export interface ComponentModels {
    componentModels: {
        [key: string]: ComponentModel;
    };
    diagnostics: CMDiagnostics[];
}

export interface PersistERModelParams {
    documentUri: string;
}

export interface PersistERModel {
    persistERModel: {
        [key: string]: ComponentModel;
    };
    diagnostics: CMDiagnostics[];
}

export interface DiagnosticsParams {
    documentIdentifier: {
        uri: string;
    };
}

export interface Diagnostics {
    uri: string;
    diagnostics: Diagnostic[];
}

export interface TypeParams {
    documentIdentifier: {
        uri: string;
    };
    position: LinePosition;
}

export interface ExpressionType {
    documentIdentifier: {
        uri: string;
    };
    types: string[];
}

export interface ConnectorsParams extends BallerinaModulesRequest { }

export interface Connectors {
    central: BallerinaConnector[];
    local?: BallerinaConnector[];
    error?: string;
}

export interface TriggersParams extends BallerinaModulesRequest { }

export interface Triggers extends BallerinaModuleResponse {
    central: BallerinaTrigger[];
    error?: string;
}

export interface ConnectorParams extends BallerinaConnector { }

export interface Connector extends BallerinaConnectorInfo {
    error?: string;
}

export interface TriggerParams {
    id?: string;
    orgName?: string;
    packageName?: string;
}

export interface Trigger extends BallerinaTriggerInfo {
    error?: string;
}

export interface RecordParams {
    org: string;
    module: string;
    version: string;
    name: string;
}

export interface BallerinaRecord {
    org: string;
    module: string;
    version: string;
    name: string;
    ast?: STNode;
    error?: any;
}

export interface STModifyParams {
    documentIdentifier: { uri: string; };
    astModifications: STModification[];
}

export interface BallerinaSTParams {
    lineRange: Range;
    documentIdentifier: DocumentIdentifier;
}

export type TriggerModifyParams = MainTriggerModifyRequest | ServiceTriggerModifyRequest;

export interface SymbolInfoParams {
    textDocumentIdentifier: {
        uri: string;
    },
    position: {
        line: number;
        character: number;
    }
}

export interface SymbolInfo {
    symbolKind: string,
    documentation: SymbolDocumentation
}

export interface TypeFromExpressionParams {
    documentIdentifier: {
        uri: string;
    };
    expressionRanges: ExpressionRange[];
}

export interface TypesFromExpression {
    types: ResolvedTypeForExpression[];
}

export interface TypeFromSymbolParams {
    documentIdentifier: {
        uri: string;
    };
    positions: LinePosition[];
}

export interface TypesFromSymbol {
    types: ResolvedTypeForSymbol[];
}

export interface TypesFromFnDefinitionParams {
    documentIdentifier: {
        uri: string;
    };
    fnPosition: LinePosition;
    returnTypeDescPosition: LinePosition;
}

export interface VisibleVariableTypesParams {
    filePath: string;
    position: LinePosition;
}

export interface VisibleVariableTypes {
    categories: VisibleType[];
}

export interface VisibleType {
    name: string;
    types: TypeWithIdentifier[];
}

export interface TypeWithIdentifier {
    name: string;
    type: TypeField;
}

export interface GraphqlDesignServiceParams {
    filePath: string;
    startLine: LinePosition;
    endLine: LinePosition;
}

export interface GraphqlDesignService {
    graphqlDesignModel: any;
    isIncompleteModel: boolean;
    errorMsg: string;
}

export interface SyntaxTreeParams {
    documentIdentifier: {
        uri: string;
    };
}

export interface SyntaxTree {
    syntaxTree: ModulePart | STNode;
    parseSuccess: boolean;
    source?: string;
    defFilePath?: string;
}

export interface BallerinaExampleListParams {
    filter?: string;
}

export interface BallerinaExampleList {
    samples: Array<BallerinaExampleCategory>;
}

export interface BallerinaProjectParams {
    documentIdentifier: DocumentIdentifier;
}

export interface BallerinaProject {
    kind?: string;
    path?: string;
    version?: string;
    author?: string;
    packageName?: string;
}

export interface BallerinaPackagesParams {
    documentIdentifiers: DocumentIdentifier[];
}

export interface BallerinaProjectComponents {
    packages?: PackageSummary[];
}

export interface PackageConfigSchema {
    configSchema: any;
}

export interface SyntaxTreeNodeParams {
    documentIdentifier: DocumentIdentifier;
    range: Range;
}

export interface SyntaxTreeNode {
    kind: string;
}

export interface SequenceDiagramModelParams {
    filePath: string;
    startLine: LinePosition;
    endLine: LinePosition;
}

export type SequenceDiagramModel = {
    sequenceDiagram: SequenceModel;
    modelDiagnostic?: SequenceModelDiagnostic
};

export interface ExecutorPositions {
    executorPositions?: ExecutorPosition[];
}

export interface JsonToRecordParams {
    jsonString: string;
    recordName: string;
    isRecordTypeDesc: boolean;
    isClosed: boolean;
    forceFormatRecordFields?: boolean;
}

export interface JsonToRecord {
    codeBlock: string;
    diagnostics?: JsonToRecordMapperDiagnostic[];
}

export interface XMLToRecordParams {
    xmlValue: string;
    isRecordTypeDesc?: boolean;
    isClosed?: boolean;
    forceFormatRecordFields?: boolean;
}

export interface XMLToRecord {
    codeBlock: string;
    diagnostics?: XMLToRecordConverterDiagnostic[];
}

export interface NoteBookCellOutputParams {
    source: string;
}

export interface NoteBookCellOutput {
    shellValue?: NoteBookCellOutputValue;
    errors: string[];
    diagnostics: string[];
    metaInfo?: NotebookCellMetaInfo;
    consoleOut: string;
}

export interface NotebookFileSource {
    content: string;
    filePath: string;
}

export interface NotebookVariable {
    name: string;
    type: string;
    value: string;
}

export interface NotebookDeleteDclnParams {
    varToDelete: string;
}

export interface PartialSTParams {
    codeSnippet: string;
    stModification?: PartialSTModification;
}

export interface PartialST {
    syntaxTree: STNode;
}

export interface OpenAPIConverterParams {
    documentFilePath: string;
}

export interface OpenAPISpec {
    content: OASpec[];
    error?: string;
}

// <------ OTHERS -------

export interface PerformanceAnalyzerParams {
    documentIdentifier: DocumentIdentifier;
    isWorkerSupported: boolean;
}

export interface PerformanceAnalyzer {
    resourcePos: Range;
    endpoints: any;
    actionInvocations: any;
    type: string;
    message: string;
    name: string;
}

export interface BallerinaServerCapability {
    name: string;
    [key: string]: boolean | string;
}

export interface ProjectDiagnosticsRequest {
    projectRootIdentifier: DocumentIdentifier;
}

export interface ProjectDiagnosticsResponse {
    errorDiagnosticMap?: Map<string, Diagnostic[]>;
}

export interface MainFunctionParamsRequest {
    projectRootIdentifier: DocumentIdentifier;
}

export interface MainFunctionParamsResponse {
    hasMain: boolean;
    params?: TypeBindingPair[];
    restParams?: TypeBindingPair;
}

export interface TypeBindingPair {
    type: string;
    paramName: string;
    defaultValue?: string;
}

// <------------ EXTENDED LANG CLIENT INTERFACE --------->



// <------------ BI INTERFACES --------->
export interface BIFlowModelRequest {
    filePath: string;
    startLine: LinePosition;
    endLine: LinePosition;
    forceAssign?: boolean;
}

export interface BISuggestedFlowModelRequest extends BIFlowModelRequest {
    text: string;
    position: LinePosition;
}

export type BIFlowModelResponse = {
    flowModel: Flow;
};

export interface BISourceCodeRequest {
    filePath: string;
    flowNode: FlowNode;
    isConnector?: boolean;
    isDataMapperFormUpdate?: boolean;
}

export type BISourceCodeResponse = {
    textEdits: {
        [key: string]: TextEdit[];
    };
};

export type BIDeleteByComponentInfoRequest = {
    filePath: string;
    component: ComponentInfo;
}

export type BIDeleteByComponentInfoResponse = {
    textEdits: {
        [key: string]: TextEdit[];
    };
};

export interface BIAvailableNodesRequest {
    position: LinePosition;
    filePath: string;
}

export type BIAvailableNodesResponse = {
    categories: Category[];
};

export interface BIGetVisibleVariableTypesRequest {
    filePath: string;
    position: LinePosition;
}

export interface BIGetVisibleVariableTypesResponse {
    categories: VisibleType[];
}

export interface BINodeTemplateRequest {
    position: LinePosition;
    filePath: string;
    id: CodeData;
    forceAssign?: boolean;
}

export type BINodeTemplateResponse = {
    flowNode: FlowNode;
};

export interface BIModuleNodesRequest {
    filePath: string;
}

export type BIModuleNodesResponse = {
    flowModel: Flow;
};

export type SearchQueryParams = {
    q?: string;
    limit?: number;
    offset?: number;
    includeAvailableFunctions?: string;
}

export type BIGetFunctionsRequest = {
    position: LineRange;
    filePath: string;
    queryMap: SearchQueryParams;
}

export type BIGetEnclosedFunctionRequest = {
    filePath: string;
    position: LinePosition;
}

export type BIGetEnclosedFunctionResponse = {
    filePath: string;
    startLine: LinePosition;
    endLine: LinePosition;
}

export type BIGetFunctionsResponse = {
    categories: Category[];
}


export type BIConnectorsRequest = {
    queryMap: SearchQueryParams;
}

export type BIConnectorsResponse = {
    categories: Category[];
}

export type ServiceFromOASRequest = {
    openApiContractPath: string;
    projectPath: string;
    port: number;
}

export type ServiceFromOASResponse = {
    service: {
        fileName: string,
        startLine: LinePosition;
        endLine: LinePosition;
    },
    errorMsg?: string;
}

export interface ConfigVariableRequest {
    projectPath: string;
}

export type ConfigVariableResponse = {
    configVariables: ConfigVariable[];
}

export interface UpdateConfigVariableRequest {
    configFilePath: string;
    configVariable: ConfigVariable;
}

export interface UpdateConfigVariableResponse {

}

export interface BICopilotContextRequest {
    position: LinePosition;
    filePath: string;
}

export interface BICopilotContextResponse {
    prefix: string;
    suffix: string;
}

export interface BIDesignModelRequest {
    projectPath: string;
}

export type BIDesignModelResponse = {
    designModel: CDModel;
};

export interface SequenceModelRequest {
    filePath: string;
    startLine: LinePosition;
    endLine: LinePosition;
}

export type SequenceModelResponse = {
    sequenceDiagram: SqFlow;
};

export interface ComponentsFromContent {
    content: string;
}

export enum TriggerKind {
    INVOKED = 1,
    TRIGGER_CHARACTER = 2,
    TRIGGER_FOR_INCOMPLETE_COMPLETIONS = 3,
}

export const TRIGGER_CHARACTERS = [':', '.', '>', '@', '/', '\\', '?'] as const;

export type TriggerCharacter = typeof TRIGGER_CHARACTERS[number];

export interface ExpressionEditorContext {
    expression: string;
    startLine: LinePosition;
    offset: number;
    node: FlowNode | TriggerNode;
    branch?: string;
    property: string;
}

export interface ExpressionCompletionsRequest {
    filePath: string;
    context: ExpressionEditorContext;
    completionContext: {
        triggerKind: TriggerKind;
        triggerCharacter?: TriggerCharacter;
    };
}

export interface ExpressionCompletionItem {
    label: string;
    kind: number;
    detail: string;
    sortText: string;
    filterText: string;
    insertText: string;
    insertTextFormat: number;
}

export type ExpressionCompletionsResponse = ExpressionCompletionItem[];

export interface SignatureHelpRequest {
    filePath: string;
    context: ExpressionEditorContext;
    signatureHelpContext: {
        isRetrigger: boolean;
        triggerCharacter?: TriggerCharacter;
        triggerKind: number;
    }
}

export interface SignatureInfo {
    label: string;
    documentation: {
        kind: string;
        value: string;
    };
    parameters: {
        label: number[];
        documentation: {
            kind: string;
            value: string;
        }
    }[];
}

export interface SignatureHelpResponse {
    signatures: SignatureInfo[];
    activeSignature: number;
    activeParameter: number;
}

export interface VisibleTypesRequest {
    filePath: string;
    position: LinePosition;
}

export interface VisibleTypesResponse {
    types: string[];
}

export interface ReferenceLSRequest {
    textDocument: {
        uri: string;
    };
    position: {
        character: number;
        line: number;
    };
    context: {
        includeDeclaration: boolean;
    };
}
export interface Reference {
    uri: string;
    range: Range;
}

export interface ExpressionDiagnosticsRequest {
    filePath: string;
    context: ExpressionEditorContext;
}

export interface ExpressionDiagnosticsResponse {
    diagnostics: Diagnostic[];
}


// <-------- Trigger Related ------->
export interface TriggerModelsRequest {
    organization?: string;
    packageName?: string;
    query?: string;
    keyWord?: string;
}

export interface TriggerModelsResponse {
    local: TriggerNode[];
}

export interface TriggerModelRequest {
    id?: string;
    organization?: string;
    packageName?: string;
    moduleName?: string;
    serviceName?: string;
    query?: string;
    keyWords?: string;
}

export interface TriggerModelResponse {
    trigger: TriggerNode;
}


export interface TriggerSourceCodeRequest {
    filePath: string;
    codedata?: {
        lineRange: LineRange; // For the entire service declaration
    };
    trigger: TriggerNode;
}

export interface TriggerSourceCodeResponse {
    textEdits: {
        [key: string]: TextEdit[];
    };
}
export interface TriggerModelFromCodeRequest {
    filePath: string;
    codedata: {
        lineRange: LineRange; // For the entire service declaration
    };
}

export interface TriggerModelFromCodeResponse {
    trigger: TriggerNode
}
export interface TriggerFunctionRequest {
    filePath: string;
    codedata?: {
        lineRange: LineRange; // For the entire service declaration
    };
    function: TriggerFunction;
}

export interface TriggerFunctionResponse {
    textEdits: {
        [key: string]: TextEdit[];
    };
}
// <-------- Trigger Related ------->

// <-------- Service Designer Related ------->
export interface ListenersRequest {
    filePath: string;
    moduleName: string;
    orgName?: string;
    pkgName?: string;
    listenerTypeName?: string;
}
export interface ListenersResponse {
    hasListeners: boolean;
    listeners: string[];
}
export interface ListenerModelRequest {
    moduleName: string;
    orgName?: string;
    pkgName?: string;
    listenerTypeName?: string;
}
export interface ListenerModelResponse {
    listener: ListenerModel;
}

export interface ListenerSourceCodeRequest {
    filePath: string;
    listener: ListenerModel;
}
export interface ListenerSourceCodeResponse {
    textEdits: {
        [key: string]: TextEdit[];
    };
}
export interface ServiceModelRequest {
    filePath: string;
    moduleName: string;
    listenerName?: string;
    orgName?: string;
    pkgName?: string;
}
export interface ServiceModelResponse {
    service: ServiceModel;
}
export interface ServiceSourceCodeRequest {
    filePath: string;
    service: ServiceModel;
}
export interface ServiceSourceCodeResponse {
    textEdits: {
        [key: string]: TextEdit[];
    };
}
export interface ServiceModelFromCodeRequest {
    filePath: string;
    codedata: {
        lineRange: LineRange; // For the entire service
    };
}
export interface ServiceModelFromCodeResponse {
    service: ServiceModel;
}
export interface ListenerModelFromCodeRequest {
    filePath: string;
    codedata: {
        lineRange: LineRange; // For the entire service
    };
}
export interface ListenerModelFromCodeResponse {
    listener: ListenerModel;
}
export interface HttpResourceModelRequest {
}
export interface HttpResourceModelResponse {
    resource: FunctionModel;
}
export interface ResourceSourceCodeRequest {
    filePath: string;
    resource: FunctionModel;
    codedata: {
        lineRange: LineRange; // For the entire service
    };
}
export interface ResourceSourceCodeResponse {
    textEdits: {
        [key: string]: TextEdit[];
    };
}
// <-------- Service Designer Related ------->

// <------------ BI INTERFACES --------->

export interface BaseLangClientInterface {
    init?: (params: InitializeParams) => Promise<InitializeResult>;
    didOpen: (Params: DidOpenParams) => void;
    didClose: (params: DidCloseParams) => void;
    didChange: (params: DidChangeParams) => void;
    definition: (params: DefinitionParams) => Promise<Location | Location[] | LocationLink[] | null>;
    close?: () => void;
}

export interface BIInterface extends BaseLangClientInterface {
    getSTByRange: (params: BallerinaSTParams) => Promise<SyntaxTree | NOT_SUPPORTED_TYPE>;
    getFlowModel: (params: BIFlowModelRequest) => Promise<BIFlowModelResponse>;
    getSourceCode: (params: BISourceCodeRequest) => Promise<BISourceCodeResponse>;
    getAvailableNodes: (params: BIAvailableNodesRequest) => Promise<BIAvailableNodesResponse>;
    getNodeTemplate: (params: BINodeTemplateRequest) => Promise<BINodeTemplateResponse>;
    getBIConnectors: (params: BIConnectorsRequest) => Promise<BIConnectorsResponse>;
    getSequenceDiagramModel: (params: SequenceModelRequest) => Promise<SequenceModelResponse>;
    generateServiceFromOAS: (params: ServiceFromOASRequest) => Promise<ServiceFromOASResponse>;
    getExpressionCompletions: (params: ExpressionCompletionsRequest) => Promise<ExpressionCompletionsResponse>;
    getConfigVariables: (params: ConfigVariableRequest) => Promise<ConfigVariableResponse>;
    updateConfigVariables: (params: UpdateConfigVariableRequest) => Promise<UpdateConfigVariableResponse>;
    getComponentsFromContent: (params: ComponentsFromContent) => Promise<BallerinaProjectComponents>;
    getSignatureHelp: (params: SignatureHelpRequest) => Promise<SignatureHelpResponse>;
    getVisibleTypes: (params: VisibleTypesRequest) => Promise<VisibleTypesResponse>;
    getExpressionDiagnostics: (params: ExpressionDiagnosticsRequest) => Promise<ExpressionDiagnosticsResponse>;
    getTriggerModels: (params: TriggerModelsRequest) => Promise<TriggerModelsResponse>;
    getTriggerModel: (params: TriggerModelRequest) => Promise<TriggerModelResponse>;
    getTriggerSourceCode: (params: TriggerSourceCodeRequest) => Promise<TriggerSourceCodeResponse>;
    updateTriggerSourceCode: (params: TriggerSourceCodeRequest) => Promise<TriggerSourceCodeResponse>;
    getTriggerModelFromCode: (params: TriggerModelFromCodeRequest) => Promise<TriggerModelFromCodeResponse>;
    addTriggerFunction: (params: TriggerFunctionRequest) => Promise<TriggerFunctionResponse>;
    updateTriggerFunction: (params: TriggerFunctionRequest) => Promise<TriggerFunctionResponse>;

    // New Service Designer APIs
    getListeners: (params: ListenersRequest) => Promise<ListenersResponse>;
    getListenerModel: (params: ListenerModelRequest) => Promise<ListenerModelResponse>;
    addListenerSourceCode: (params: ListenerSourceCodeRequest) => Promise<ListenerSourceCodeResponse>;
    getListenerFromSourceCode: (params: ListenerModelFromCodeRequest) => Promise<ListenerModelFromCodeResponse>;
    getServiceModel: (params: ServiceModelRequest) => Promise<ServiceModelResponse>;
    addServiceSourceCode: (params: ServiceSourceCodeRequest) => Promise<ListenerSourceCodeResponse>;
    getServiceModelFromCode: (params: ServiceModelFromCodeRequest) => Promise<ServiceModelFromCodeResponse>;
    getHttpResourceModel: (params: HttpResourceModelRequest) => Promise<HttpResourceModelResponse>;
    addResourceSourceCode: (params: ResourceSourceCodeRequest) => Promise<ResourceSourceCodeResponse>;

    getDesignModel: (params: BIDesignModelRequest) => Promise<BIDesignModelResponse>;
}

export interface ExtendedLangClientInterface extends BIInterface {
    rename(params: RenameParams): Promise<WorkspaceEdit | NOT_SUPPORTED_TYPE>;
    getDocumentSymbol(params: DocumentSymbolParams): Promise<DocumentSymbol[] | SymbolInformation[] | NOT_SUPPORTED_TYPE>;
    codeAction(params: CodeActionParams): Promise<CodeAction[]>;
    getCompletion(params: CompletionParams): Promise<Completion[]>;
    executeCommand(params: ExecuteCommandParams): Promise<any>;
    initBalServices(params: BallerinaInitializeParams): Promise<BallerinaInitializeResult>;
    getPackageComponentModels(params: ComponentModelsParams): Promise<ComponentModels>;
    getPersistERModel(params: PersistERModelParams): Promise<PersistERModel>;
    getDiagnostics(params: DiagnosticsParams): Promise<Diagnostics[] | NOT_SUPPORTED_TYPE>;
    getType(params: TypeParams): Promise<ExpressionType | NOT_SUPPORTED_TYPE>;
    getConnectors(params: ConnectorsParams, reset?: boolean): Promise<Connectors | NOT_SUPPORTED_TYPE>;
    getTriggers(params: TriggersParams): Promise<Triggers | NOT_SUPPORTED_TYPE>;
    getConnector(params: ConnectorRequest): Promise<ConnectorResponse | NOT_SUPPORTED_TYPE>;
    getTrigger(params: TriggerParams): Promise<Trigger | NOT_SUPPORTED_TYPE>;
    getRecord(params: RecordParams): Promise<BallerinaRecord | NOT_SUPPORTED_TYPE>;
    getSymbolDocumentation(params: SymbolInfoParams): Promise<SymbolInfo | NOT_SUPPORTED_TYPE>;
    getTypeFromExpression(params: TypeFromExpressionParams): Promise<TypesFromExpression | NOT_SUPPORTED_TYPE>;
    getTypeFromSymbol(params: TypeFromSymbolParams): Promise<TypesFromSymbol | NOT_SUPPORTED_TYPE>;
    getTypesFromFnDefinition(params: TypesFromFnDefinitionParams): Promise<TypesFromSymbol | NOT_SUPPORTED_TYPE>;
    getGraphqlModel(params: GraphqlDesignServiceParams): Promise<GraphqlDesignService | NOT_SUPPORTED_TYPE>;
    getSyntaxTree(req: SyntaxTreeParams): Promise<SyntaxTree | NOT_SUPPORTED_TYPE>;
    fetchExamples(args: BallerinaExampleListParams): Promise<BallerinaExampleList | NOT_SUPPORTED_TYPE>;
    getBallerinaProject(params: BallerinaProjectParams): Promise<BallerinaProject | NOT_SUPPORTED_TYPE>;
    getBallerinaProjectComponents(params: BallerinaPackagesParams): Promise<BallerinaProjectComponents | NOT_SUPPORTED_TYPE>;
    getBallerinaProjectConfigSchema(params: BallerinaProjectParams): Promise<PackageConfigSchema | NOT_SUPPORTED_TYPE>;
    getSyntaxTreeNode(params: SyntaxTreeNodeParams): Promise<SyntaxTreeNode | NOT_SUPPORTED_TYPE>;
    updateStatusBar(): void;
    getDidOpenParams(): DidOpenParams;
}
