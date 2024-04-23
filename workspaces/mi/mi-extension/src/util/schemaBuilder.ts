/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 */

import { JSONSchema3or4 } from "to-json-schema";
import toJsonSchema = require("to-json-schema");
import xmltojs = require("xml2js");

const HTTP_WSO2JSONSCHEMA_ORG = "http://wso2jsonschema.org";
const HTTP_JSON_SCHEMA_ORG_DRAFT_04_SCHEMA = "http://wso2.org/json-schema/wso2-data-mapper-v5.0.0/schema#";

export interface Schema {
    $schema?: string;
    id?: string;
    type?: string;
    inputType?: string;
    title?: string;
    properties?: { [k: string]: JSONSchema3or4; } | undefined,
    namespaces?: [{
        "prefix": string,
        "uri": string
    }],
    attributes?: [{
        "name": string,
        "type": string
    }]
}

export function generateSchemaForJSON(fileContent: string, fileType: string, title: string): Schema {
    let input: JSON = JSON.parse(fileContent);
    let generatedSchema: JSONSchema3or4 = toJsonSchema(input);
    let schema: Schema = {};
    schema.properties = generatedSchema.properties;
    schema.$schema = HTTP_JSON_SCHEMA_ORG_DRAFT_04_SCHEMA;
    schema.id = HTTP_WSO2JSONSCHEMA_ORG;
    if (title.toLowerCase() === "input") {
        schema.title = "InputRoot";
    } else {
        schema.title = "OutputRoot";
    }
    return schema;
}

export function generateSchemaForJSONSchema(fileContent: string, fileType: string, title: string): JSONSchema3or4 {
    let schema = JSON.parse(fileContent);
    schema.$schema = HTTP_JSON_SCHEMA_ORG_DRAFT_04_SCHEMA;
    schema.id = HTTP_WSO2JSONSCHEMA_ORG;
    if (title.toLowerCase() === "input") {
        schema.title = "InputRoot";
    } else {
        schema.title = "OutputRoot";
    }
    return schema;
}

export function generateSchemaForXML(fileContent: string, fileType: string, title: string): Schema {
    const parser = new xmltojs.Parser();
    let input: JSON;
    let schema: Schema = {};
    parser.parseString(fileContent, (err: any, result: any) => {
        input = result;
        // todo: replace attributes with elements
        schema = generateSchemaForJSON(JSON.stringify(input), fileType, title);
    });
    return schema;
}
