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
import toJsonSchema from "./../datamapper/to-json-schema";
import xmltojs = require("xml2js");
import transformTypescript from "@babel/plugin-transform-typescript";
import getBabelOptions from "recast/parsers/_babel_options";
import { parser } from "recast/parsers/babel";
import { parse, print } from "recast";
import { transformFromAstSync } from "@babel/core";
import { MILanguageClient } from "./../lang-client/activator";
import { ExtensionContext } from "vscode";

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
    }],
    required?: string[] | boolean
}

export function generateSchemaForJSON(fileContent: string, fileType: string, title: string): Schema {
    let input: JSON = JSON.parse(fileContent);
    let generatedSchema: JSONSchema3or4 = toJsonSchema(input, {required: true});
    let schema: Schema = {};
    schema.properties = generatedSchema.properties;
    schema.$schema = HTTP_JSON_SCHEMA_ORG_DRAFT_04_SCHEMA;
    schema.id = HTTP_WSO2JSONSCHEMA_ORG;
    schema.required = generatedSchema.required;
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

export async function generateSchemaForXML(fileContent: string, fileType: string, title: string, context: ExtensionContext, filePath: string): Promise<Schema> {
    const langClient = (await MILanguageClient.getInstance(context)).languageClient!;
    const response = await langClient.generateSchema({
      filePath: filePath,
      delimiter: "",
      type: "XML",
      title: title
    });
    let schema = JSON.parse(response.schema);

    return schema;
}

export async function generateSchema(ioType: string, fileType: string, title: string, context: ExtensionContext, filePath: string): Promise<Schema> {
  const langClient = (await MILanguageClient.getInstance(context)).languageClient!;
  const response = await langClient.generateSchema({
    filePath: filePath,
    delimiter: "",
    type: fileType.toUpperCase(),
    title: title
  });
  let schema = JSON.parse(response.schema);
  if (ioType.toLowerCase() === "input") {
      schema.title = "InputRoot";
  } else {
      schema.title = "OutputRoot";
  }
  return schema;
}

export function convertTypeScriptToJavascript(fileContent: string): string {
    try {
        const ast = parse(fileContent, {
          parser: {
            parse: (source, options) => {
              const babelOptions = getBabelOptions(options);
              babelOptions.plugins.push("typescript", "jsx");
              return parser.parse(source, babelOptions);
            }
          }
        });

        const options = {
          cloneInputAst: false, 
          code: false,
          ast: true,
          plugins: [transformTypescript],
          configFile: false
        };
        const { ast: transformedAST } = transformFromAstSync(
          ast,
          fileContent,
          options
        );
        const result = print(transformedAST).code;
        return result;
      } catch (e) {
        console.error(e);
        return "";
      }
}
