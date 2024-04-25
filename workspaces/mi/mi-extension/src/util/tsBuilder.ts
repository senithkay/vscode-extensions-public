/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 */

import { compileFromFile } from './../datamapper/schema-to-typescript'
import  { FromSchema, JSONSchema } from 'json-schema-to-ts';
import * as fs from "fs";
import * as os from 'os';
import path = require("path");
import { Uri, workspace } from "vscode";
import { convertTypeScriptToJavascript } from './schemaBuilder';

export function generateTSInterfacesFromSchemaFile(schemaPath: string): Promise<string> {
    const ts = compileFromFile(schemaPath, {bannerComment: ""});
    return ts;
}

export function generateTypescriptFromSchema(schema: any): string {
    const dogSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
          hobbies: { type: "array", items: { type: "string" } },
          favoriteFood: {
            type: "object",
            properties: {
              name: { type: "string" },
              calories: { type: "number" },
            }
           },
        },
        required: ["name", "age"],
      } as const;
      
      type Dog = FromSchema<typeof dogSchema>;
      type DogType = typeof dogSchema;
      // write the Dog type to a file
      return '';
}

export async function updateDMC(dmName:string, sourcePath: string): Promise<string> {
    const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(sourcePath));
    if (workspaceFolder) {
        const dataMapperConfigFolder = path.join(
            workspaceFolder.uri.fsPath,  'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper');
        const tsFilepath = path.join(dataMapperConfigFolder, `${dmName}.ts`);
        const inputSchemaPath = path.join(dataMapperConfigFolder, `${dmName}_inputSchema.json`);
        const outputSchemaPath = path.join(dataMapperConfigFolder, `${dmName}_outputSchema.json`);
        const dmcFilePath = path.join(dataMapperConfigFolder, `${dmName}.dmc`);

        let tsContent = "";

        tsContent += `function mapFunction(input: InputRoot): OutputRoot {\nreturn {}\n};\n\n`;

        const inputSchemaContent = fs.readFileSync(inputSchemaPath, 'utf8');
        const outputSchemaContent = fs.readFileSync(outputSchemaPath, 'utf8');

        if (inputSchemaContent.length > 0) {
            let inputTSInterfaces = await generateTSInterfacesFromSchemaFile(inputSchemaPath);
            if (inputTSInterfaces.startsWith("export ")) {
                inputTSInterfaces = inputTSInterfaces.replace("export ", "");
            }
            tsContent += `${inputTSInterfaces}\n\n`;
        } else {
            tsContent += "interface InputRoot {\n}\n\n";
        }

        if (outputSchemaContent.length > 0) {
            let outputTSInterfaces = await generateTSInterfacesFromSchemaFile(outputSchemaPath);
            if (outputTSInterfaces.startsWith("export ")) {
                outputTSInterfaces = outputTSInterfaces.replace("export ", "");
            }
            tsContent += `${outputTSInterfaces}\n\n`;
        } else {
            tsContent += "interface OutputRoot {\n}\n";
        }
        fs.writeFileSync(tsFilepath, tsContent);
        const jsContent = convertTypeScriptToJavascript(tsContent);
        fs.writeFileSync(dmcFilePath, jsContent);
    }
    return "";
}

export async function updateDMCContent(dmName:string, sourcePath: string): Promise<string> {
    const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(sourcePath));
    if (workspaceFolder) {
        const dataMapperConfigFolder = path.join(
            workspaceFolder.uri.fsPath,  'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper');
        const tsFilepath = path.join(dataMapperConfigFolder, `${dmName}.ts`);
        const dmcFilePath = path.join(dataMapperConfigFolder, `${dmName}.dmc`);
        const tsContent = fs.readFileSync(tsFilepath, 'utf8');
        const jsContent = convertTypeScriptToJavascript(tsContent);
        fs.writeFileSync(dmcFilePath, jsContent);
    }
    return "";
}