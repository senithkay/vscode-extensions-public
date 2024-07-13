/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 */

import transformTypescript from "@babel/plugin-transform-typescript";
import getBabelOptions from "recast/parsers/_babel_options";
import { parser } from "recast/parsers/babel";
import { parse, print } from "recast";
import { transformFromAstSync } from "@babel/core";
import { ExtensionContext } from "vscode";
import { JSONSchema3or4 } from "to-json-schema";
import { StateMachine } from "../stateMachine";

export function convertToJSONSchema(fileContent: string): JSONSchema3or4 {
    let schema = JSON.parse(fileContent);
    return schema;
}

export async function generateSchema(ioType: string, fileType: string, title: string, context: ExtensionContext, filePath: string): Promise<JSONSchema3or4> {
  const langClient = StateMachine.context().langClient!;
  const response = await langClient.generateSchema({
    filePath: filePath,
    delimiter: "",
    type: fileType.toUpperCase(),
    title: title
  });
  let schema = JSON.parse(response.schema);
  return schema;
}

export async function generateSchemaFromContent(content: string, fileType: string, title: string): Promise<JSONSchema3or4> {
  const langClient = StateMachine.context().langClient!;
  const response = await langClient.generateSchemaFromContent({
    fileContent: content,
    delimiter: "",
    type: fileType.toUpperCase(),
    title: title
  });
  let schema = JSON.parse(response.schema);
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
