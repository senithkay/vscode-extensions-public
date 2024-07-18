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
import { StateMachine } from "../stateMachine";

export function convertToJSONSchema(fileContent: JSONSchema3or4): JSONSchema3or4 {
    let schema = JSON.parse(fileContent);
    return schema;
}

export async function generateSchema(ioType: string, schemaType: string, filePath: string): Promise<JSONSchema3or4> {
  const langClient = StateMachine.context().langClient!;
  const response = await langClient.generateSchema({
    filePath: filePath,
    delimiter: "",
    type: schemaType.toUpperCase(),
    title: ""
  });
  let schema = JSON.parse(response.schema);
  let schemaIOMetadataKey = ioType.toLowerCase() + 'Type';
  let schemaIOMetadataValue = schemaType === 'JSONSCHEMA' ? 'JSON' : schemaType;
  schema[schemaIOMetadataKey] = schemaIOMetadataValue.toUpperCase();
  return schema;
}

export async function generateSchemaFromContent(ioType: string, content: string, fileType: string): Promise<JSONSchema3or4> {
  const langClient = StateMachine.context().langClient!;
  const response = await langClient.generateSchemaFromContent({
    fileContent: content,
    delimiter: "",
    type: fileType.toUpperCase(),
    title: ""
  });
  let schema = JSON.parse(response.schema);
  let schemaIOMetadataKey = ioType.toLowerCase() + 'Type';
  let schemaIOMetadataValue = fileType === 'JSONSCHEMA' ? 'JSON' : fileType;
  schema[schemaIOMetadataKey] = schemaIOMetadataValue.toUpperCase();
  return schema;
}
