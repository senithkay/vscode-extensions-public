/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */



export interface TriggerModel {
    name: string;
    listener: Record<string, ListenerConfiguration>;
    service: ServiceConfiguration
}

export interface ListenerConfiguration {
    required: boolean;
    type: string;
    record?: boolean;
    description?: string;
}

export interface TriggerProperty {
    required: boolean;
    type: string;
    description?: string;
}



export interface ServiceConfiguration {
    basePath?: BasePath;
    functions: Record<string, FunctionDetail>;
}

export interface BasePath {
    required: boolean;
    description?: string;
}

export interface FunctionDetail {
    required: boolean;
    params: Record<string, FunctionParam>;
    returns: Return;
    description?: string;
}

export interface FunctionParam {
    type: string;
    required: boolean;
    description?: string;
}

export interface Return {
    error?: boolean
    nilable?: boolean;
    type: string;
    description?: string;
}

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
