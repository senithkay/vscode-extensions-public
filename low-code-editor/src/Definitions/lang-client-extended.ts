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

import { STNode } from "@ballerina/syntax-tree";

import { FunctionDefinitionInfo } from "../ConfigurationSpec/types";

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

export interface BallerinaModule {
    id?: string;
    name: string;
    displayName?: string;
    moduleName?: string;
    package: Package;
    displayAnnotation?: any;
}

export interface Connector extends BallerinaModule {}

export interface Trigger extends BallerinaModule {}

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

export interface PerformanceAnalyzerGraphRequest {
    documentIdentifier: DocumentIdentifier;
    range: Range;
    choreoAPI: string;
    choreoCookie: string;
    choreoToken: string;
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
    concurrency: string;
    latency: string;
    tps: string;
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
