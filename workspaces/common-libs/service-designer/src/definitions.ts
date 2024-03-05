/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodePosition } from "@wso2-enterprise/syntax-tree";

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

export interface ServiceData {
    path: string;
    port: number;
}

export interface Resource {
    methods: string[];
    path: string;
    pathSegments?: ParameterConfig[];
    params?: ParameterConfig[];
    advancedParams?: Map<string, ParameterConfig>;
    payloadConfig?: ParameterConfig;
    responses?: ResponseConfig[];
    expandable?: boolean;
    updatePosition?: NodePosition; // Insert or Edit position of the resource
    position?: NodePosition; // Actual position of the resource which is used to render the resource
    addtionalInfo?: JSX.Element; // Addtional information to be displayed in the resource expanded view
}

export interface PathConfig {
    path: string;
    resources: ParameterConfig[];
}

export interface Service {
    path: string;
    port: number;
    serviceType?: string;
    resources: Resource[];
    position?: NodePosition;
}
