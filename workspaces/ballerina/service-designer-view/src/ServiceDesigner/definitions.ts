/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ResourceAccessorDefinition } from "@wso2-enterprise/syntax-tree";

export interface ResponseConfig {
    id: number;
    code?: number;
    type?: string;
    source?: string;
}

export enum PARAM_TYPES {
    DEFAULT = 'Query',
    PAYLOAD = 'Payload',
    REQUEST = 'Request',
    CALLER = 'Caller',
    HEADER = 'Header',
}

export interface ParameterConfig {
    id: number;
    name: string;
    type?: string;
    option?: PARAM_TYPES;
    defaultValue?: string;
    isRequired?: boolean;
}

export interface ResourceInfo {
    method: string;
    path: string;
    pathSegments?: ParameterConfig[];
    params?: ParameterConfig[];
    advancedParams?: Map<string, ParameterConfig>;
    payloadConfig?: ParameterConfig;
    responses?: ResponseConfig[];
    ST?: ResourceAccessorDefinition;
}

export interface PathConfig {
    path: string;
    resources: ParameterConfig[];
}
