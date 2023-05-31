/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

export const EXECUTE_RUN_WITH_CONFIGS: string = 'ballerina.executeRunWithConfigs';

export interface ConfigProperty {
    name: string,
    type: string,
    property: {
        properties?: {};
        required?: string[];
        description: string,
        items: { type: string, additionalProperties?: { type: string } },
        type: string,
        additionalProperties?: { type: string }
    }
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
    INTEGER = "integer",
}

export enum Commands {
    RUN = "Run",
    DEBUG = "Debug",
}


export enum ConfigTypes {
    BOOLEAN = "boolean",
    INTEGER = "integer", // Int, Byte
    NUMBER = "number", // Float, Decimal
    STRING = "string",
    ARRAY = "array", // Have items->type property
    OBJECT = "object",
    ENUM = "enum", // enums have enum key but value as a string
    ANY_OF = "anyOf", // unions have anyOf key and value as given type
    // xml no type defined but string value
    // tuple no type defined
    // map no type defined
    // record no type defined
    // table and table[] as arrays

}


