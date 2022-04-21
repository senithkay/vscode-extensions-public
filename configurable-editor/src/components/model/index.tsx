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

/**
 * Common properties in the config schema.
 */
export enum SchemaConstants {
    ITEMS = "items",
    TYPE = "type",
    VALUE = "value",
    NAME = "name",
    DESCRIPTION = "description",
    PROPERTIES = "properties",
    REQUIRED = "required",
    ADDITIONAL_PROPERTIES = "additionalProperties",
    ANY_OF = "anyOf",
}

/**
 * Types of config values mapped into the model from the config schema.
 */

export enum ConfigType {
    ARRAY = "array",
    BOOLEAN = "boolean",
    INTEGER = "integer",
    FLOAT = "float",
    RECORD = "record",
    MAP = "map",
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
