/* eslint-disable @typescript-eslint/no-explicit-any */
/**
* Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 LLC. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
* You may not alter or remove any copyright or other notice from copies of this content.
*/

import { ModulePart, STNode } from "@wso2-enterprise/syntax-tree";
import { DocumentIdentifier, LinePosition, LineRange, Position, Range } from "./common";
import { ClientCapabilities, DefinitionParams, InitializeParams, InitializeResult, Location, LocationLink } from "vscode-languageserver-protocol";
import { CodeAction, Diagnostic, DocumentSymbol, SymbolInformation } from "vscode-languageserver-types";
import { BallerinaTriggerRequest, BallerinaTriggerResponse, BallerinaTriggersResponse } from "../rpc-types/project-design-diagram/interfaces";
import { ExecutorPositionsResponse, BallerinaProjectComponents } from "../rpc-types/lang-server/interfaces";
import { JsonToRecordRequest, JsonToRecordResponse, XMLToRecordRequest, XMLToRecordResponse } from "../rpc-types/record-creator/interfaces";
import { DiagramDiagnostic, FunctionDefinitionInfo, NonPrimitiveBal } from "./config-spec";

export enum DIAGNOSTIC_SEVERITY {
    INTERNAL = "INTERNAL",
    HINT = "HINT",
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR"
}

export interface GoToSourceParams {
    textDocumentIdentifier: {
        uri: string;
    };
    position: Position;
}

export interface RevealRangeParams {
    textDocumentIdentifier: {
        uri: string;
    };
    range: Range;
}

export interface BallerinaExample {
    title: string;
    url: string;
}

export interface BallerinaExampleCategory {
    title: string;
    column: number;
    samples: BallerinaExample[];
}

export interface BallerinaExampleListParams {
    filter?: string;
}

export interface BallerinaExampleListResponse {
    samples: BallerinaExampleCategory[];
}

export interface BallerinaProject {
    kind?: string;
    path?: string;
    version?: string;
    author?: string;
    packageName?: string;
}

export interface GetBallerinaProjectParams {
    documentIdentifier: {
        uri: string;
    };
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

export interface BallerinaRecordResponse {
    org: string;
    module: string;
    version: string;
    name: string;
    ast?: STNode;
    error?: any;
}

export interface VisibleEndpoint {
    kind?: string;
    isCaller: boolean;
    isExternal: boolean;
    isModuleVar: boolean;
    moduleName: string;
    name: string;
    packageName: string;
    orgName: string;
    version: string;
    typeName: string;
    position: NodePosition;
    viewState?: any;
    isParameter?: boolean;
    isClassField?: boolean;
}
export interface NodePosition {
    startLine?: number;
    startColumn?: number;
    endLine?: number;
    endColumn?: number;
}

export interface BallerinaRecordRequest {
    org: string;
    module: string;
    version: string;
    name: string;
}

export interface TypeField {
    typeName: string;
    name?: string;
    displayName?: string;
    memberType?: TypeField;
    inclusionType?: TypeField;
    paramType?: TypeField;
    selectedDataType?: string;
    description?: string;
    defaultValue?: any;
    value?: any;
    optional?: boolean;
    defaultable?: boolean;
    fields?: TypeField[];
    members?: TypeField[];
    references?: TypeField[];
    restType?: TypeField;
    constraintType?: TypeField;
    rowType?: TypeField;
    keys?: string[];
    isReturn?: boolean;
    isTypeDef?: boolean;
    isReference?: boolean;
    isStream?: boolean;
    isErrorUnion?: boolean;
    typeInfo?: NonPrimitiveBal;
    hide?: boolean;
    aiSuggestion?: string;
    noCodeGen?: boolean;
    requestName?: string; // only for http form used when there's a request object in the request
    tooltip?: string;
    tooltipActionLink?: string;
    tooltipActionText?: string;
    isErrorType?: boolean;
    isRestParam?: boolean; // TODO: unified rest params
    hasRestType?: boolean;
    isRestType?: boolean;
    customAutoComplete?: string[];
    validationRegex?: any;
    leftTypeParam?: any;
    rightTypeParam?: any;
    initialDiagnostics?: DiagramDiagnostic[];
    documentation?: string;
    displayAnnotation?: any;
    position?: NodePosition;
    selected?: boolean;
    originalTypeName?: string;
    resolvedUnionType?: TypeField | TypeField[];
}

export interface BallerinaConnectorInfo extends Connector {
    functions: FunctionDefinitionInfo[];
    documentation?: string;
}

export interface BallerinaConnectorsRequest {
    query: string;
    packageName?: string;
    organization?: string;
    connector?: string;
    description?: string;
    template?: string;
    keyword?: string;
    ballerinaVersion?: string;
    platform?: boolean;
    userPackages?: boolean;
    limit?: number;
    offset?: number;
    sort?: string;
    targetFile?: string;
}
export interface BallerinaConnectorsResponse {
    central: Connector[];
    local?: Connector[];
    error?: string;
}

// tslint:disable-next-line: no-empty-interface
export interface BallerinaConnectorRequest extends Connector {
}


export interface Package {
    organization: string;
    name: string;
    version: string;
    platform?: string;
    languageSpecificationVersion?: string;
    URL?: string;
    balaURL?: string;
    balaVersion?: string;
    digest?: string;
    summary?: string;
    readme?: string;
    template?: boolean;
    licenses?: any[];
    authors?: any[];
    sourceCodeLocation?: string;
    keywords?: any[];
    ballerinaVersion?: string;
    icon?: string;
    pullCount?: number;
    createdDate?: number;
    modules?: any[];
}



export interface BallerinaProjectParams {
    documentIdentifier: {
        uri: string;
    };
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


export interface BallerinaModule {
    id?: string;
    name: string;
    displayName?: string;
    moduleName?: string;
    package: Package;
    displayAnnotation?: DisplayAnnotation;
    icon?: string;
}

// tslint:disable-next-line: no-empty-interface
export interface Connector extends BallerinaModule { }

// tslint:disable-next-line: no-empty-interface
export interface Trigger extends BallerinaModule { }

export interface Package {
    organization: string;
    name: string;
    version: string;
    platform?: string;
    languageSpecificationVersion?: string;
    URL?: string;
    balaURL?: string;
    balaVersion?: string;
    digest?: string;
    summary?: string;
    readme?: string;
    template?: boolean;
    licenses?: any[];
    authors?: any[];
    sourceCodeLocation?: string;
    keywords?: any[];
    ballerinaVersion?: string;
    icon?: string;
    pullCount?: number;
    createdDate?: number;
    visibility?: string;
    modules?: any[];
}

export interface BallerinaRecord {
    org: string;
    module: string;
    version: string;
    name: string;
}

export interface BallerinaConnectorInfo extends Connector {
    functions: FunctionDefinitionInfo[];
    documentation?: string;
}

export interface BallerinaTriggerInfo extends Trigger {
    serviceTypes: ServiceType[],
    listenerParams: Parameter[],
    documentation?: string,
}

export interface ServiceType {
    name: string;
    description?: string;
    functions?: RemoteFunction[];
}

export interface RemoteFunction {
    isRemote?: boolean;
    documentation?: string;
    name: string;
    parameters?: Parameter[];
    returnType?: ReturnType;
}

export interface Parameter {
    name: string;
    typeName: string;
    optional?: boolean;
    typeInfo?: TypeInfo;
    displayAnnotation?: DisplayAnnotation;
    fields?: Field[];
    hasRestType?: boolean;
    restType?: ReturnType;
    defaultable?: boolean;
}

export interface DisplayAnnotation {
    label?: string;
}

export interface MemberField {
    typeName?: string;
    optional?: boolean;
    defaultable?: boolean;
}
export interface Field {
    name?: string;
    typeName?: string;
    optional?: boolean;
    defaultable?: boolean;
    fields?: ReturnType[];
    hasRestType?: boolean;
    restType?: ReturnType;
    members?: MemberField[];
    defaultType?: string;
}

export interface ReturnType {
    name?: string;
    typeName?: string;
    optional?: boolean;
    defaultable?: boolean;
    displayAnnotation?: DisplayAnnotation;
}

export interface TypeInfo {
    name?: string;
    orgName?: string;
    moduleName?: string;
    version?: string;
}

export interface BallerinaModulesRequest {
    query: string;
    packageName?: string;
    organization?: string;
    connector?: string;
    description?: string;
    template?: string;
    keyword?: string;
    ballerinaVersion?: string;
    platform?: boolean;
    userPackages?: boolean;
    limit?: number;
    offset?: number;
    sort?: string;
    targetFile?: string;
}

// tslint:disable-next-line: no-empty-interface
export interface BallerinaConnectorsRequest extends BallerinaModulesRequest { }

// tslint:disable-next-line: no-empty-interface
export interface BallerinaTriggersRequest extends BallerinaModulesRequest { }

export interface BallerinaModuleResponse {
    central: BallerinaModule[];
    local?: BallerinaModule[];
    error?: string;
}

export interface BallerinaConnectorsResponse extends BallerinaModuleResponse {
    central: Connector[];
    local?: Connector[];
    error?: string;
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

export interface BallerinaSTModifyResponse {
    source: string;
    defFilePath: string;
    syntaxTree: ModulePart;
    parseSuccess: boolean;
}

export interface MainTriggerModifyRequest extends STModifyRequest {
    type: "main";
    config?: MainConfig;
}

export interface ServiceConfig {
    SERVICE: string;
    RESOURCE: string;
    RES_PATH: string;
    PORT: string;
    METHODS: string;
    CURRENT_TRIGGER?: string;
}

export interface MainConfig {
    COMMENT?: string;
    CURRENT_TRIGGER?: string;
}

export interface STModifyRequest {
    documentIdentifier: { uri: string; };
    astModifications: STModification[];
}

export interface ServiceTriggerModifyRequest extends STModifyRequest {
    type: "service";
    config: ServiceConfig;
}

export type TriggerModifyRequest = MainTriggerModifyRequest | ServiceTriggerModifyRequest;

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

export interface ExecutorPosition {
    kind: string;
    range: LineRange;
    name: string;
    filePath: string;
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
    description?: string,
    kind: string,
    type: string,
    modelPosition?: NodePosition,
    fields?: ParameterInfo[]
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


export interface ResolvedTypeForExpression {
    type: TypeField;
    requestedRange: ExpressionRange;
}

export interface GraphqlDesignServiceRequest {
    filePath: string;
    startLine: LinePosition;
    endLine: LinePosition;
}
export interface GraphqlDesignServiceResponse {
    graphqlDesignModel: any;
    isIncompleteModel: boolean;
    errorMsg: string;
}

export interface ResolvedTypeForSymbol {
    type: TypeField;
    requestedPosition: LinePosition;
}

export interface GetComponentModelRequest {
    documentUris: string[];
}

export interface GetPersistERModelRequest {
    documentUri: string;
}

export interface BallerinaConstructRequest {
    query: string;
    packageName?: string;
    organization?: string;
    connector?: string;
    description?: string;
    template?: string;
    keyword?: string;
    ballerinaVersion?: string;
    platform?: boolean;
    userPackages?: boolean;
    limit?: number;
    offset?: number;
    sort?: string;
    targetFile?: string;
}

export interface Package {
    organization: string;
    name: string;
    version: string;
    platform?: string;
    languageSpecificationVersion?: string;
    URL?: string;
    balaURL?: string;
    balaVersion?: string;
    digest?: string;
    summary?: string;
    readme?: string;
    template?: boolean;
    licenses?: any[];
    authors?: any[];
    sourceCodeLocation?: string;
    keywords?: any[];
    ballerinaVersion?: string;
    icon?: string;
    pullCount?: number;
    createdDate?: number;
    visibility?: string;
    modules?: any[];
}

export interface BallerinaConnectorResponse extends BallerinaConnectorInfo {
    error?: string;
}
export interface BallerinaFunctionSTRequest {
    lineRange: Range;
    documentIdentifier: DocumentIdentifier;
}

export interface IBallerinaLangClient extends DiagramEditorLangClientInterface {

}
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
export interface BaseLangClientInterface {
    init?: (params: InitializeParams) => Promise<InitializeResult>;
    didOpen: (Params: DidOpenParams) => void;
    didClose: (params: DidCloseParams) => void;
    didChange: (params: DidChangeParams) => void;
    definition: (params: DefinitionParams) => Promise<Location | Location[] | LocationLink[] | null>;
    close?: () => void;
}

export interface DiagramEditorLangClientInterface extends BaseLangClientInterface {
    getConnectors: (params: BallerinaConnectorsRequest) => Thenable<BallerinaConnectorsResponse>;
    getTriggers: (params: BallerinaTriggersRequest) => Thenable<BallerinaTriggersResponse>;
    getTrigger: (params: BallerinaTriggerRequest) => Thenable<BallerinaTriggerResponse>;
    getConnector: (params: BallerinaConnectorRequest) => Thenable<BallerinaConnectorResponse>;
    getRecord: (params: BallerinaRecordRequest) => Thenable<BallerinaRecordResponse>;
    stModify: (params: STModifyRequest) => Thenable<BallerinaSTModifyResponse>;
    triggerModify: (params: TriggerModifyRequest) => Thenable<BallerinaSTModifyResponse>;
    getSyntaxTree: (params: GetSyntaxTreeParams) => Thenable<GetSyntaxTreeResponse>;
    getDocumentSymbol: (params: any) => Thenable<DocumentSymbol[] | SymbolInformation[] | null>;
    getPerfEndpoints: (params: any) => Thenable<PerformanceAnalyzerResponse[]>;
    resolveMissingDependencies: (params: GetSyntaxTreeParams) => Thenable<GetSyntaxTreeResponse>;
    getExecutorPositions: (params: GetBallerinaProjectParams) => Thenable<ExecutorPositionsResponse>;
    convert: (params: JsonToRecordRequest) => Thenable<JsonToRecordResponse>;
    convertXml: (params: XMLToRecordRequest) => Thenable<XMLToRecordResponse>;
    getSTForFunction: (params: BallerinaFunctionSTRequest) => Thenable<BallerinaSTModifyResponse>;
    getDefinitionPosition: (params: any) => Thenable<BallerinaSTModifyResponse>;
    getDiagnostics: (params: BallerinaProjectParams) => Thenable<any[]>;
    codeAction: (params: any) => Thenable<CodeAction[]>;
    getBallerinaProjectComponents: (params: any) => Promise<BallerinaProjectComponents>;
    getGraphqlModel: (params: GraphqlDesignServiceRequest) => Thenable<GraphqlDesignServiceResponse>;
}

export interface PublishDiagnosticsParams {
    uri: string;
    diagnostics: Diagnostic[];
}
export interface CurrentFile {
    content: string;
    path: string;
    size: number;
}

export interface BallerinaConstruct {
    id?: string;
    name: string;
    displayName?: string;
    moduleName?: string;
    package: Package;
    displayAnnotation?: DisplayAnnotation;
    icon?: string;
}

export interface APITimeConsumption {
    diagnostics: number[];
    completion: number[];
}

export interface OADiagnostic {
    message: string;
    serverity: string;
    location?: LineRange;
}

export interface OASpec {
    file: string;
    serviceName: string;
    spec: any;
    diagnostics: OADiagnostic[];
}

export interface OpenAPIConverterResponse {
    content: OASpec[];
    error?: string;
}
export interface OpenAPIConverterRequest {
    documentFilePath: string;
}

export interface PerformanceAnalyzerGraphRequest {
    documentIdentifier: DocumentIdentifier;
    range: Range;
    choreoAPI: string;
    choreoCookie: string;
    choreoToken: string;
}

export interface SyntaxTreeNodeResponse {
    kind: string;
}

export interface NoteBookCellOutputResponse {
    shellValue?: NoteBookCellOutputValue;
    errors: string[];
    diagnostics: string[];
    metaInfo?: NotebookCellMetaInfo;
    consoleOut: string;
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

export interface NotebookFileSourceResponse {
    content: string;
    filePath: string;
}

export interface NotebookVariable {
    name: string;
    type: string;
    value: string;
}

export interface PackageConfigSchemaResponse {
    configSchema: any;
}

export interface ExtendedClientCapabilities extends ClientCapabilities {
    experimental: { introspection: boolean, showTextDocument: boolean };
}

