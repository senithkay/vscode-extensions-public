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

import { STNode } from "@ballerina/syntax-tree";

export type STModificationConfig = {};

export interface STModification {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    type: string;
    config?: STModificationConfig;
}

export interface BallerinaSyntaxTreeModifyRequest {
    documentIdentifier: { uri: string; };
    astModifications: STModification[];
}

export interface BallerinaSyntaxTreeResponse {
    syntaxTree: any;
    parseSuccess: boolean;
    source: string;
}

export interface Connector {
    org: string;
    module: string;
    version: string;
    name: string;
    displayName: string;
    beta: boolean;
    category: string;
}

export interface BallerinaRecord {
    org: string;
    module: string;
    version: string;
    name: string;
}

export interface BallerinaConnectorsInfo extends Connector {
    logoBase64Encoded: string;
}

export interface BallerinaConnectorsResponse {
    connectors: any;
}

export interface BallerinaConnectorResponse {
    org: string;
    module: string;
    version: string;
    name: string;
    ast?: STNode;
}

// tslint:disable-next-line: no-empty-interface
export interface BallerinaConnectorRequest extends Connector {
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
