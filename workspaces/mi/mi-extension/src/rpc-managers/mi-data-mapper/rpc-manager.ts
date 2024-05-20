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
    UpdateDMCRequest
} from "@wso2-enterprise/mi-core";
import { fetchDMTypes } from "../../util/dataMapper";
import { Project } from "ts-morph";
import { navigate } from "../../stateMachine";
import { generateSchema } from "../../util/schemaBuilder";
import { JSONSchema3or4 } from "to-json-schema";
import { updateDMC, updateDMCContent } from "../../util/tsBuilder";
import * as fs from "fs";
import * as os from 'os';
import { window, Uri, workspace, commands, TextEdit, WorkspaceEdit } from "vscode";
import path = require("path");
import { extension } from "../../MIExtensionContext";
import { MiDiagramRpcManager } from "../mi-diagram/rpc-manager";

export class MiDataMapperRpcManager implements MIDataMapperAPI {
    async getIOTypes(params: IOTypeRequest): Promise<IOTypeResponse> {
        return new Promise(async (resolve, reject) => {
            const { filePath, functionName } = params;
            try {
                const {inputTypes, outputType, variableTypes} = fetchDMTypes(filePath, functionName);

                return resolve({
                    inputTrees: inputTypes,
                    outputTree: outputType,
                    variableTypes
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

    getAbsoluteFilePath(filePath: string, sourcePath: string, configName: string) {
        const regPathParts = filePath.split('/');
        const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(sourcePath));
        if (workspaceFolder) {
            const dataMapperConfigFolder = path.join(
                workspaceFolder.uri.fsPath,  'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper');
            const absPath = path.join(dataMapperConfigFolder, configName, regPathParts[regPathParts.length - 1]);
            return absPath;
        };
        return '';
    }

    async browseSchema(params: BrowseSchemaRequest): Promise<BrowseSchemaResponse> {
        return new Promise(async (resolve) => {
            const { documentUri, overwriteSchema, resourceName, sourcePath, ioType, schemaType, configName } = params;
            const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(documentUri));
            if (overwriteSchema) {
                const response = await window.showInformationMessage(
                    "Are you sure you want to override the existing schema?\n\nPlease note that this will remove all existing mappings.",
                    { modal: true }, 
                    "Yes", 
                    "No"
                );
                if (!response || response === "No") {
                    resolve({success: false});
                    return;
                }
            }
            const selectedFile = await window.showOpenDialog({
                defaultUri: Uri.file(os.homedir()),
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                title: `Select a schema file`
            });
            if (selectedFile) {
                const filePath = selectedFile[0].fsPath;
                let schema: JSONSchema3or4;
                try {
                    schema = await generateSchema(ioType, schemaType, schemaType, extension.context, filePath);
                } catch (error: any) {
                    console.error(error);
                    window.showErrorMessage("Error while generating schema. Please check the input file and Resource Type and try again.");
                    return resolve({success: false});
                }
                
                if (workspaceFolder) {
                    const dataMapperConfigFolder = path.join(
                        workspaceFolder.uri.fsPath,  'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper');
                    const newFilePath = path.join(dataMapperConfigFolder, configName, `${resourceName}.json`);
                    fs.writeFileSync(newFilePath, JSON.stringify(schema, null, 4));
                }
                try {
                    await updateDMC(configName, sourcePath);
                    await this.formatDMC(documentUri);
                    navigate();
                    return resolve({success: true});
                } catch (error: any) {
                    console.error(error);
                    window.showErrorMessage("Error while updating DMC file.");
                    return resolve({success: false});
                }
            };
            resolve({success: false});
            return;
        });
    }

    async formatDMC(documentUri: string): Promise<void> {
        const uri = Uri.file(documentUri);
        const edits: TextEdit[] = await commands.executeCommand("vscode.executeFormatDocumentProvider", uri);
        const workspaceEdit = new WorkspaceEdit();
        workspaceEdit.set(uri, edits);
        await workspace.applyEdit(workspaceEdit);
        return;
    }

    async loadDMConfigs(params: LoadDMConfigsRequest): Promise<LoadDMConfigsResponse> {
        return new Promise(async (resolve, reject) => {
            const fileUri = Uri.file(params.filePath);
            const workspaceFolder = workspace.getWorkspaceFolder(fileUri);
            if (workspaceFolder) {
                const dataMapperConfigFolder = path.join(
                    workspaceFolder.uri.fsPath,  'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper');
                if (!fs.existsSync(dataMapperConfigFolder)) {
                    return resolve({dmConfigs: []});
                }
                const dmConfigs: string[] = [];
                for (const folder of fs.readdirSync(dataMapperConfigFolder)) {
                    if (fs.lstatSync(path.join(dataMapperConfigFolder, folder)).isDirectory() && 
                        fs.existsSync(path.join(dataMapperConfigFolder, folder, `${folder}.dmc`))) {
                        dmConfigs.push(folder);
                    }
                }
                resolve({dmConfigs});
                return;
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
                const absPath = path.join(dataMapperConfigFolder, configName, `${configName}.ts`);
                resolve ({absPath, configName});
            };
            reject({absPath: '', configName: ''});
        });
    }

    async updateDMCFileContent(params: UpdateDMCRequest): Promise<void> {
        const { dmName, sourcePath } = params;
        updateDMCContent(dmName, sourcePath);
    }

    async createDMFiles(params: GenerateDMInputRequest): Promise<GenerateDMInputResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                const dmContent = `interface InputRoot {\n}\n\ninterface OutputRoot {\n}\n\nfunction mapFunction(input: InputRoot): OutputRoot {\nreturn {}\n};`;
                const { filePath, dmName } = params;
                const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(filePath));
                let miDiagramRpcManager: MiDiagramRpcManager = new MiDiagramRpcManager();
                if (workspaceFolder) {
                    const dataMapperConfigFolder = path.join(
                        workspaceFolder.uri.fsPath,  'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper', dmName);
                    if (!fs.existsSync(dataMapperConfigFolder)) {
                        fs.mkdirSync(dataMapperConfigFolder, { recursive: true });
                    }
                    const tsFilePath = path.join(dataMapperConfigFolder, `${dmName}.ts`);
                    if (!fs.existsSync(tsFilePath)) {
                        fs.writeFileSync(tsFilePath, dmContent);
                    }
                    const dmcFilePath = path.join(dataMapperConfigFolder, `${dmName}.dmc`);
                    if (!fs.existsSync(dmcFilePath)) {
                        miDiagramRpcManager.createRegistryResource({
                            filePath: "",
                            projectDirectory: workspaceFolder.uri.fsPath,
                            templateType: "Data Mapper",
                            resourceName: dmName,
                            artifactName: dmName,
                            registryRoot: "gov",
                            registryPath: `/datamapper/${dmName}`,
                            createOption : "new",
                            content: ""
                        
                        });
                    }
                    const inputSchemaFilePath = path.join(dataMapperConfigFolder, `${dmName}_inputSchema.json`);
                    if (!fs.existsSync(inputSchemaFilePath)) {
                        miDiagramRpcManager.createRegistryResource({
                            filePath: "",
                            projectDirectory: workspaceFolder.uri.fsPath,
                            templateType: "Data Mapper Schema",
                            resourceName: `${dmName}_inputSchema`,
                            artifactName: `${dmName}_inputSchema`,
                            registryRoot: "gov",
                            registryPath: `/datamapper/${dmName}`,
                            createOption : "new",
                            content: "{}"
                        
                        });
                    }
                    const outputSchemaFilePath = path.join(dataMapperConfigFolder, `${dmName}_outputSchema.json`);
                    if (!fs.existsSync(outputSchemaFilePath)) {
                        miDiagramRpcManager.createRegistryResource({
                            filePath: "",
                            projectDirectory: workspaceFolder.uri.fsPath,
                            templateType: "Data Mapper Schema",
                            resourceName: `${dmName}_outputSchema`,
                            artifactName: `${dmName}_outputSchema`,
                            registryRoot: "gov",
                            registryPath: `/datamapper/${dmName}`,
                            createOption : "new",
                            content: "{}"
                        
                        });
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
