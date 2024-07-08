/* eslint-disable @typescript-eslint/no-explicit-any */
/**
* Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 LLC. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
* You may not alter or remove any copyright or other notice from copies of this content.
*/

import { Diagnostic, TextDocumentItem } from "vscode-languageserver-types";
import { CMDiagnostics, ComponentModel } from "./component";
import { DocumentIdentifier, LinePosition } from "./common";
import { BallerinaConnectorInfo, BallerinaExampleCategory, BallerinaModuleResponse, BallerinaModulesRequest, BallerinaTriggerInfo, Connector, ExecutorPosition, ExpressionRange, JsonToRecordMapperDiagnostic, MainTriggerModifyRequest, NoteBookCellOutputValue, NotebookCellMetaInfo, OASpec, PackageSummary, PartialSTModification, ResolvedTypeForExpression, ResolvedTypeForSymbol, STModification, SequenceModel, SequenceModelDiagnostic, ServiceTriggerModifyRequest, SymbolDocumentation, Trigger, XMLToRecordConverterDiagnostic } from "./ballerina";
import { ModulePart, STNode } from "@wso2-enterprise/syntax-tree";

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
    central: Connector[];
    local?: Connector[];
    error?: string;
}

export interface TriggersParams extends BallerinaModulesRequest { }

export interface Triggers extends BallerinaModuleResponse {
    central: Trigger[];
    error?: string;
}


export interface ConnectorParams extends Connector { }

export interface BallerinaConnector extends BallerinaConnectorInfo {
    error?: string;
}

export interface TriggerParams {
    id: string
}

export interface BallerinaTrigger extends BallerinaTriggerInfo {
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

export interface STModify {
    source: string;
    defFilePath: string;
    syntaxTree: ModulePart;
    parseSuccess: boolean;
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
    syntaxTree: any;
    parseSuccess: boolean;
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
