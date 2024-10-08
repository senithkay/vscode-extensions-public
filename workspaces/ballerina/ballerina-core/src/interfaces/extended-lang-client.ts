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
import { BallerinaConnectorInfo, BallerinaExampleCategory, BallerinaModuleResponse, BallerinaModulesRequest, BallerinaTrigger, BallerinaTriggerInfo, BallerinaConnector, ExecutorPosition, ExpressionRange, JsonToRecordMapperDiagnostic, MainTriggerModifyRequest, NoteBookCellOutputValue, NotebookCellMetaInfo, OASpec, PackageSummary, PartialSTModification, ResolvedTypeForExpression, ResolvedTypeForSymbol, STModification, SequenceModel, SequenceModelDiagnostic, ServiceTriggerModifyRequest, SymbolDocumentation, XMLToRecordConverterDiagnostic, TypeField } from "./ballerina";
import { ModulePart, STNode } from "@wso2-enterprise/syntax-tree";
import { CodeActionParams, DefinitionParams, DocumentSymbolParams, ExecuteCommandParams, InitializeParams, InitializeResult, LocationLink, RenameParams } from "vscode-languageserver-protocol";
import { Category, Flow, FlowNode, CodeData } from "./eggplant";
import { ConnectorRequest, ConnectorResponse } from "../rpc-types/connector-wizard/interfaces";
import { SqFlow, SqLocation, SqParticipant } from "../rpc-types/sequence-diagram/interfaces";

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
    id: string
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

// <------------ EXTENDED LANG CLIENT INTERFACE --------->



// <------------ EGGPLANT INTERFACES --------->
export interface EggplantFlowModelRequest {
    filePath: string;
    startLine: LinePosition;
    endLine: LinePosition;
}

export interface EggplantSuggestedFlowModelRequest extends EggplantFlowModelRequest {
    text: string;
    position: LinePosition;
}

export type EggplantFlowModelResponse = {
    flowModel: Flow;
};

export interface EggplantSourceCodeRequest {
    filePath: string;
    flowNode: FlowNode;
}

export type EggplantSourceCodeResponse = {
    textEdits:  {
        [key: string]: TextEdit[];
    };
};

export interface EggplantAvailableNodesRequest {
    position: LineRange;
    filePath: string;
}

export type EggplantAvailableNodesResponse = {
    categories: Category[];
};

export interface EggplantNodeTemplateRequest {
    position: LinePosition;
    filePath: string;
    id: CodeData;
}

export type EggplantNodeTemplateResponse = {
    flowNode: FlowNode;
};

export type EggplantGetFunctionsRequest = {
    position: LineRange;
    filePath: string;
    queryMap: any;
}

export type EggplantGetFunctionsResponse = {
    categories: Category[];
}


export type EggplantConnectorsRequest = {
    keyword: string;
}

export type EggplantConnectorsResponse = {
    categories: Category[];
}

export interface EggplantCopilotContextRequest {
    position: LinePosition;
    filePath: string;
}

export interface EggplantCopilotContextResponse {
    prefix: string;
    suffix: string;
}

export interface SequenceModelRequest {
    filePath: string;
    startLine: LinePosition;
    endLine: LinePosition;
}

export type SequenceModelResponse = {
    sequenceDiagram: SqFlow;
};

// <------------ EGGPLANT INTERFACES --------->

export interface BaseLangClientInterface {
    init?: (params: InitializeParams) => Promise<InitializeResult>;
    didOpen: (Params: DidOpenParams) => void;
    didClose: (params: DidCloseParams) => void;
    didChange: (params: DidChangeParams) => void;
    definition: (params: DefinitionParams) => Promise<Location | Location[] | LocationLink[] | null>;
    close?: () => void;
}

export interface EggplantInterface extends BaseLangClientInterface {
    getSTByRange: (params: BallerinaSTParams) => Promise<SyntaxTree | NOT_SUPPORTED_TYPE>;
    getFlowModel: (params: EggplantFlowModelRequest) => Promise<EggplantFlowModelResponse>;
    getSourceCode: (params: EggplantSourceCodeRequest) => Promise<EggplantSourceCodeResponse>;
    getAvailableNodes: (params: EggplantAvailableNodesRequest) => Promise<EggplantAvailableNodesResponse>;
    getNodeTemplate: (params: EggplantNodeTemplateRequest) => Promise<EggplantNodeTemplateResponse>;
    getEggplantConnectors: (params: EggplantConnectorsRequest) => Promise<EggplantConnectorsResponse>;
    getSequenceDiagramModel: (params: SequenceModelRequest) => Promise<SequenceModelResponse>;
}

export interface ExtendedLangClientInterface extends EggplantInterface {
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
