/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

export const EXECUTE_RUN_WITH_CONFIGS: string = 'ballerina.executeRunWithConfigs';

export interface ConfigProperty {
    id: string;
    headerNames: string[];
    configs: ConfigValue[];
    isNested?: boolean;
}

export interface ConfigValue {
    configName: string;
    configType: string;
    configArrayType?: string;
    configValue?: any;
}

export enum Constants {
    ENUM = "enum",
    ITEMS = "items",
    TYPE = "type",
    VALUE = "value",
    NAME = "name",
    DESCRIPTION = "description",
    PROPERTIES = "properties",
    REQUIRED = "required",
    ADDITIONAL_PROPERTIES = "additionalProperties",
    ANY_OF = "anyOf",
    ARRAY = "array",
    MODULE = "module",
    OBJECT = "object",
    ARRAY_TYPE = "arrayType",
    FLOAT = "float",
    INTEGER= "integer",
}

export enum Commands {
    RUN = "Run",
    DEBUG = "Debug",
}
