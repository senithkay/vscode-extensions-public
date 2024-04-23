/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 */

import { compileFromFile } from 'json-schema-to-typescript'
import * as fs from "fs";
import * as os from 'os';
import path = require("path");
import { Uri, workspace } from "vscode";

export function generateTSInterfacesFromSchemaFile(schemaPath: string): Promise<string> {
    const ts = compileFromFile(schemaPath, {bannerComment: ""});
    return ts;
}

export async function updateDMC(dmName:string, sourcePath: string): Promise<string> {
    const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(sourcePath));
    if (workspaceFolder) {
        const dataMapperConfigFolder = path.join(
            workspaceFolder.uri.fsPath,  'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper');
        const dmcFilePath = path.join(dataMapperConfigFolder, `${dmName}.ts`);
        const inputSchemaPath = path.join(dataMapperConfigFolder, `${dmName}_inputSchema.json`);
        const outputSchemaPath = path.join(dataMapperConfigFolder, `${dmName}_outputSchema.json`);

        let dmcContent = "";

        const inputSchemaContent = fs.readFileSync(inputSchemaPath, 'utf8');
        const outputSchemaContent = fs.readFileSync(outputSchemaPath, 'utf8');

        if (inputSchemaContent.length > 0) {
            let inputTSInterfaces = await generateTSInterfacesFromSchemaFile(inputSchemaPath);
            if (inputTSInterfaces.startsWith("export ")) {
                inputTSInterfaces = inputTSInterfaces.replace("export ", "");
            }
            dmcContent += `${inputTSInterfaces}\n\n`;
        } else {
            dmcContent += "interface InputRoot {\n}\n\n";
        }

        if (outputSchemaContent.length > 0) {
            let outputTSInterfaces = await generateTSInterfacesFromSchemaFile(outputSchemaPath);
            if (outputTSInterfaces.startsWith("export ")) {
                outputTSInterfaces = outputTSInterfaces.replace("export ", "");
            }
            dmcContent += `${outputTSInterfaces}\n\n`;
        } else {
            dmcContent += "interface OutputRoot {\n}\n\n";
        }

        dmcContent += `function mapFunction(input: InputRoot): OutputRoot {\nreturn {}\n};`;
        fs.writeFileSync(dmcFilePath, dmcContent);
    }
    return "";
}