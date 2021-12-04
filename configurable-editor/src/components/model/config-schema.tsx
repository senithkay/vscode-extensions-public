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
    DESCRIPTION = "description",
    PROPERTIES = "properties",
    REQUIRED = "required",
}

/**
 * Types of config values mapped into the model from the config schema.
 */
export enum ConfigType {
    ARRAY = "array",
    BOOLEAN = "boolean",
    NUMBER = "number", // Represent both number and integer.
    OBJECT = "object",
    STRING = "string",
    UNSUPPORTED = "unsupported", // Types other than the above ones.
}

/**
 * These values are used to validate the config schema with that of existing configs, optional feature.
 */
export interface MetaData {
    orgName: string;
    packageName: string;
}
