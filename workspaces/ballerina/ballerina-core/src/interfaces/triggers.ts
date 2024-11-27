/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DisplayAnnotation } from "./ballerina";


export type TriggerFormField = {
    key: string;
    label: string;
    type: null | string;
    optional: boolean;
    editable: boolean;
    documentation: string;
    value: string;
    items?: string[];
};


export interface TriggerNode {
    id: number;
    name: string;
    type: string;
    displayName: string;
    documentation: string;
    moduleName: string;
    orgName: string;
    version: string;
    packageName: string;
    listenerProtocol: string;
    icon: string;
    properties?: ConfigProperties;
    displayAnnotation?: DisplayAnnotation;
    listener?: XProperty;
    services?: Service[];
    service?: Service;
}
export interface XMetaData {
    label: string;
    description: string;
    groupNo: number;
    groupName: string;
}

export interface XProperty {
    metadata: XMetaData;
    enabled: boolean;
    editable: boolean;
    value: string;
    valueType: string;
    valueTypeConstraint: string;
    isType: boolean;
    placeholder: string;
    optional: boolean;
    advanced: boolean;
    properties?: ConfigProperties;
}
export interface ConfigProperties {
    [key: string]: XProperty;
}

export interface Service {
    enabled: boolean;
    functions: TriggerFunction[];
    properties?: ConfigProperties;
}

export interface TriggerFunction {
    metadata: XMetaData;
    kind: string;
    name: XProperty;
    parameters: XParameter[];
    returnType: XReturnType;
    enabled: boolean;
    optional: boolean;
    editable: boolean;
}

export interface XParameter {
    metadata: XMetaData;
    kind: string;
    type: ParameterType;
    name: ParameterName;
    enabled: boolean;
    editable: boolean;
    optional: boolean;
}

export interface ParameterType {
    metadata: XMetaData;
    enabled: boolean;
    editable: boolean;
    value: string;
    valueType: string;
    valueTypeConstraint: string;
    isType: boolean;
    placeholder: string;
    optional: boolean;
    advanced: boolean;
}

export interface ParameterName {
    metadata: XMetaData;
    enabled: boolean;
    editable: boolean;
    value: string;
    valueType: string;
    valueTypeConstraint: string;
    isType: boolean;
    placeholder: string;
    optional: boolean;
    advanced: boolean;
}

export interface XReturnType {
    metadata: XMetaData;
    enabled: boolean;
    editable: boolean;
    value: string;
    valueType: string;
    valueTypeConstraint: string;
    isType: boolean;
    placeholder: string;
    optional: boolean;
    advanced: boolean;
}