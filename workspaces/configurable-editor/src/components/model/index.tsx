/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

/**
 * Common properties in the config schema.
 */
export enum SchemaConstants {
    ENUM = "enum",
    ID = "id",
    ITEMS = "items",
    TYPE = "type",
    VALUE = "value",
    NAME = "name",
    DESCRIPTION = "description",
    PROPERTIES = "properties",
    REQUIRED = "required",
    ADDITIONAL_PROPERTIES = "additionalProperties",
    ANY_OF = "anyOf",
    CONFIG = "config",
}

/**
 * Types of config values mapped into the model from the config schema.
 */

export enum ConfigType {
    ARRAY = "array",
    BOOLEAN = "boolean",
    ENUM = "enum",
    INTEGER = "integer",
    FLOAT = "float",
    RECORD = "record",
    MAP = "map",
    NESTEDARRAY = "array",
    MODULE = "module",
    NUMBER = "number",
    OBJECT = "object",
    STRING = "string",
    UNION = "union",
    UNSUPPORTED = "unsupported",
    ANY_OF = "anyOf",
}

/**
 * These values are used to validate the config schema with that of existing configs, optional feature.
 */
export interface MetaData {
    orgName: string;
    packageName: string;
}

/**
 * A key value pair storing a leaf level config value and its name.
 */
export interface ConfigValue {
    key: string;
    value: any;
}

/**
 * An interface representing the config schema json object.
 */
export interface ConfigSchema {
    $schema: string;
    type: string;
    properties: object;
}

/**
 * An interface representing the connection schema json object.
 */
export interface ConnectionSchema {
    name: string;
    uuid: string;
    configurationData: GlobalConfigurationData[];
}

/**
 * An interface representing the global configuration data json object.
 */
export interface GlobalConfigurationData {
    configKey: string;
    valueType: string;
    valueRef: string;
}
