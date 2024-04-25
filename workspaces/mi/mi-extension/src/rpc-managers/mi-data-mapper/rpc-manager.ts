/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    IOTypeRequest,
    IOTypeResponse,
    MIDataMapperAPI,
    UpdateFileContentRequest,
    GenerateDMInputRequest,
    GenerateDMInputResponse,
    BrowseSchemaRequest,
    BrowseSchemaResponse,
    LoadDMConfigsRequest,
    LoadDMConfigsResponse,
    ConvertRegPathToAbsPathRequest,
    ConvertRegPathToAbsPathResponse,
    ImportDMSchemaRequest,
    ImportDMSchemaResponse,
    UpdateDMCRequest,
    UpdateDMCResponse
} from "@wso2-enterprise/mi-core";
import { fetchIOTypes } from "../../util/dataMapper";
import { Project } from "ts-morph";
import { navigate } from "../../stateMachine";
import { generateSchemaForJSON, generateSchemaForJSONSchema, generateSchemaForXML, Schema } from "../../util/schemaBuilder";
import { JSONSchema3or4 } from "to-json-schema";
import { updateDMC, updateDMCContent } from "../../util/tsBuilder";
import * as fs from "fs";
import * as os from 'os';
import { window, Uri, workspace } from "vscode";
import path = require("path");

export class MiDataMapperRpcManager implements MIDataMapperAPI {
    async getIOTypes(params: IOTypeRequest): Promise<IOTypeResponse> {
        return new Promise(async (resolve, reject) => {
            const { filePath, functionName } = params;
            try {
                const {inputTypes, outputType} = fetchIOTypes(filePath, functionName);

                return resolve({
                    inputTrees: inputTypes,
                    outputTree: outputType
                });
            } catch (error: any) {
                reject(error);
            }
        });
    }

    async updateFileContent(params: UpdateFileContentRequest): Promise<void> {
        const project = new Project();
        const sourceFile = project.addSourceFileAtPath(params.filePath);
        sourceFile.replaceWithText(params.fileContent);
        sourceFile.formatText();
        await sourceFile.save();
        navigate();
    }

    getAbsoluteFilePath(filePath: string, sourcePath: string) {
        const regPathParts = filePath.split('/');
        const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(sourcePath));
        if (workspaceFolder) {
            const dataMapperConfigFolder = path.join(
                workspaceFolder.uri.fsPath,  'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper');
            const absPath = path.join(dataMapperConfigFolder, regPathParts[regPathParts.length - 1]);
            return absPath;
        };
        return '';
    }

    async browseSchema(params: BrowseSchemaRequest): Promise<BrowseSchemaResponse> {
        return new Promise(async (resolve) => {
            const selectedFile = await window.showOpenDialog({
                defaultUri: Uri.file(os.homedir()),
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                title: `Select a schema file`,
            });
            if (selectedFile) {
                resolve({ filePath: selectedFile[0].fsPath });
            }
        });
    }

    async loadDMConfigs(params: LoadDMConfigsRequest): Promise<LoadDMConfigsResponse> {
        return new Promise(async (resolve, reject) => {
            const fileUri = Uri.file(params.filePath);
            const workspaceFolder = workspace.getWorkspaceFolder(fileUri);
            if (workspaceFolder) {
                const dataMapperConfigFolder = path.join(
                    workspaceFolder.uri.fsPath,  'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper');
                const dmConfigs: string[] = [];
                for (const file of fs.readdirSync(dataMapperConfigFolder)) {
                    if (file.endsWith('.dmc')) {
                        dmConfigs.push(file.slice(0, -4));
                    }
                }
                resolve({dmConfigs});
            }
            reject({dmConfigs: []});
        });
    }

    async convertRegPathToAbsPath(params: ConvertRegPathToAbsPathRequest): Promise<ConvertRegPathToAbsPathResponse> {
        return new Promise(async (resolve, reject) => {
            const { regPath, sourcePath } = params;
            const regPathParts = regPath.split('/');
            const configName = regPathParts[regPathParts.length - 1].slice(0, -4);
            const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(sourcePath));
            if (workspaceFolder) {
                const dataMapperConfigFolder = path.join(
                    workspaceFolder.uri.fsPath,  'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper');
                const absPath = path.join(dataMapperConfigFolder, `${configName}.ts`);
                resolve ({absPath, configName});
            };
            reject({absPath: '', configName: ''});
        });
    }

    async importDMSchema(params: ImportDMSchemaRequest): Promise<ImportDMSchemaResponse> {
        return new Promise(async (resolve, reject) => {
            const { importPath, resourceName, sourcePath, ioType, schemaType } = params;
            const dmInput = fs.readFileSync(importPath, 'utf8');
            let schema: Schema|JSONSchema3or4;
            if (schemaType === 'json') {
                schema = generateSchemaForJSON(dmInput, schemaType, ioType);
            } else if (schemaType === 'xml') {
                schema = generateSchemaForXML(dmInput, schemaType, ioType);
            } else if (schemaType === 'jsonschema') {
                schema = generateSchemaForJSONSchema(dmInput, schemaType, ioType);
            } else {
                throw new Error("Unsupported file type.");
            }
            const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(sourcePath));
            if (workspaceFolder) {
                const dataMapperConfigFolder = path.join(
                    workspaceFolder.uri.fsPath,  'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper');
                const newFilePath = path.join(dataMapperConfigFolder, `${resourceName}.json`);
                fs.writeFileSync(newFilePath, JSON.stringify(schema, null, 4));
                resolve({success: true});
            }
            reject({success: false});
        });
    }

    

    async updateDMC(params: UpdateDMCRequest): Promise<UpdateDMCResponse> {
        return new Promise((resolve, reject) => {
            try {
                const { dmName, sourcePath } = params;
                updateDMC(dmName, sourcePath).then(() => {
                    resolve({success: true});
                });
                navigate();
                resolve({success: false});
            } catch (error: any) {
                console.error(error);
                reject(error);
            }
        });
    }

    async updateDMCFileContent(params: UpdateDMCRequest): Promise<void> {
        const { dmName, sourcePath } = params;
        updateDMCContent(dmName, sourcePath).then(() => {
            // navigate();
        });
    }

    async createDMFiles(params: GenerateDMInputRequest): Promise<GenerateDMInputResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                const dmContent = `interface InputRoot {\n}\n\ninterface OutputRoot {\n}\n\nfunction mapFunction(input: InputRoot): OutputRoot {\nreturn {}\n};`;
                const { filePath, dmName } = params;
                const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(filePath));
                if (workspaceFolder) {
                    const dataMapperConfigFolder = path.join(
                        workspaceFolder.uri.fsPath,  'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper');
                    if (!fs.existsSync(dataMapperConfigFolder)) {
                        fs.mkdirSync(dataMapperConfigFolder, { recursive: true });
                    }
                    const tsFilePath = path.join(dataMapperConfigFolder, `${dmName}.ts`);
                    if (!fs.existsSync(tsFilePath)) {
                        fs.writeFileSync(tsFilePath, dmContent);
                    }
                    const dmcFilePath = path.join(dataMapperConfigFolder, `${dmName}.dmc`);
                    if (!fs.existsSync(dmcFilePath)) {
                        fs.writeFileSync(dmcFilePath, "");
                    }
                    const inputSchemaFilePath = path.join(dataMapperConfigFolder, `${dmName}_inputSchema.json`);
                    if (!fs.existsSync(inputSchemaFilePath)) {
                        fs.writeFileSync(inputSchemaFilePath, "");
                    }
                    const outputSchemaFilePath = path.join(dataMapperConfigFolder, `${dmName}_outputSchema.json`);
                    if (!fs.existsSync(outputSchemaFilePath)) {
                        fs.writeFileSync(outputSchemaFilePath, "");
                    }
                    resolve({success: true});
                }
            } catch (error: any) {
                console.error(error);
                reject(error);
            }
        });
    }
}
