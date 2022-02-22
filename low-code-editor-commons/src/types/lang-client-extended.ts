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

// tslint:disable: no-empty-interface
import { STNode } from "@wso2-enterprise/syntax-tree";

import { LineRange } from ".";
import { FunctionDefinitionInfo } from "./config-spec";

export type STModificationConfig = {};

export interface STModification {
    startLine?: number;
    startColumn?: number;
    endLine?: number;
    endColumn?: number;
    type: string;
    config?: any;
    isImport?: boolean;
}

export interface BallerinaConstruct {
    id?: string;
    name: string;
    displayName?: string;
    moduleName?: string;
    package: Package;
    displayAnnotation?: any;
    icon?: string;
}

export interface Connector extends BallerinaConstruct { }

export interface Trigger extends BallerinaConstruct { }

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

export interface DisplayAnnotation { }

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

export interface BallerinaConnectorsRequest extends BallerinaConstructRequest { }

export interface BallerinaTriggersRequest extends BallerinaConstructRequest { }

export interface BallerinaModuleResponse {
    central: BallerinaConstruct[];
    local?: BallerinaConstruct[];
    error?: string;
}

export interface BallerinaConnectorsResponse extends BallerinaModuleResponse {
    central: Connector[];
    local?: Connector[];
    error?: string;
}

export interface BallerinaTriggersResponse extends BallerinaModuleResponse {
    central: Trigger[];
    error?: string;
}

export interface BallerinaTriggerRequest {
    id: string
}

export interface BallerinaTriggerResponse extends BallerinaTriggerInfo {
    error?: string;
}

export interface BallerinaConnectorRequest {
    id?: string
    orgName?: string
    packageName?: string
    moduleName?: string
    version?: string
    name?: string
    targetFile?: string
}
export interface BallerinaConnectorResponse extends BallerinaConnectorInfo {
    error?: string;
}

export interface BallerinaRecordResponse {
    org: string;
    module: string;
    version: string;
    name: string;
    ast?: STNode;
    error?: any;
}

export interface BallerinaRecordRequest {
    org: string;
    module: string;
    version: string;
    name: string;
}

export interface BallerinaSTModifyRequest {
    documentIdentifier: { uri: string; };
    astModifications: STModification[];
}

export interface BallerinaSTModifyResponse {
    source: string;
    syntaxTree: STNode;
    parseSuccess: boolean;
}

export interface STModifyRequest {
    documentIdentifier: { uri: string; };
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

export interface ServiceTriggerModifyRequest extends STModifyRequest {
    type: "service";
    config: ServiceConfig;
}

export type TriggerModifyRequest = MainTriggerModifyRequest | ServiceTriggerModifyRequest;

export interface BallerinaProjectParams {
    documentIdentifier: {
        uri: string;
    };
}

export interface JsonToRecordRequest {
    jsonString: string;
    recordName: string;
    isRecordTypeDesc: boolean;
    isClosed: boolean;
}

export interface JsonToRecordResponse {
    codeBlock: string;
}

export interface DocumentIdentifier {
    uri: string;
}

export interface Range {
    start: Position;
    end: Position;
}

export interface Position {
    line: number;
    character: number;
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

export interface Values {
    min?: number;
    max: number;
}

export interface PerformanceAnalyzerEndpointsRequest {
    documentIdentifier: DocumentIdentifier;
}

export interface GraphPoint {
    concurrency: string;
    latency: string;
    tps: string;
}

export interface SequenceGraphPoint {
    concurrency: string;
    values: SequenceGraphPointValue[];
}

export interface SequenceGraphPointValue {
    name: string;
    latency: number;
    tps: number;
}

export interface GraphData {
    name: string,
    graphData: GraphPoint[];
}

export interface PerformanceGraphRequest {
    file: string;
    data: GraphData;
}

export interface BallerinaSyntaxTreeByRangeRequest {
    documentIdentifier: TextDocumentIdentifier;
    lineRange: Range
}
export interface TextDocumentIdentifier {
    uri: string;
}
