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
    DMTypeRequest,
    IOTypeResponse,
    SubMappingTypesResponse,
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
    UpdateDMUndoRedoMangerRequest,
    GetCompletionsRequest,
    GetCompletionsResponse,
    GetDMDiagnosticsRequest,
    GetDMDiagnosticsResponse,
    DMDiagnostic,
    DMDiagnosticCategory,
    DataMapWriteRequest,
    EVENT_TYPE,
    MACHINE_VIEW
} from "@wso2-enterprise/mi-core";
import { fetchIOTypes, fetchSubMappingTypes, fetchCompletions, fetchDiagnostics } from "../../util/dataMapper";
import { Project } from "ts-morph";
import { StateMachine, navigate } from "../../stateMachine";
import { generateSchemaFromContent } from "../../util/schemaBuilder";
import { JSONSchema3or4 } from "to-json-schema";
import { updateDMC } from "../../util/tsBuilder";
import * as fs from "fs";
import * as os from 'os';
import { window, Uri, workspace, commands, TextEdit, WorkspaceEdit } from "vscode";
import path = require("path");
import { extension } from "../../MIExtensionContext";
import { MiDiagramRpcManager } from "../mi-diagram/rpc-manager";
import { UndoRedoManager } from "../../undoRedoManager";
import * as ts from 'typescript';
import { DMProject } from "../../datamapper/DMProject";
import { DM_OPERATORS_FILE_NAME, DM_OPERATORS_IMPORT_NAME, READONLY_MAPPING_FUNCTION_NAME } from "../../constants";
import { getSources } from "../../util/dataMapper";
import { refreshAuthCode } from '../../ai-panel/auth';
import { DATAMAP_BACKEND_URL } from "../../constants";
import { MiVisualizerRpcManager } from "../mi-visualizer/rpc-manager";

const undoRedoManager = new UndoRedoManager();

export class MiDataMapperRpcManager implements MIDataMapperAPI {
    async getIOTypes(params: DMTypeRequest): Promise<IOTypeResponse> {
        return new Promise(async (resolve, reject) => {
            const { filePath, functionName } = params;
            try {
                const { inputTypes, outputType } = fetchIOTypes(filePath, functionName);

                return resolve({
                    inputTrees: inputTypes,
                    outputTree: outputType
                });
            } catch (error: any) {
                reject(error);
            }
        });
    }

    async getSubMappingTypes(params: DMTypeRequest): Promise<SubMappingTypesResponse> {
        return new Promise(async (resolve, reject) => {
            const { filePath, functionName } = params;
            try {
                const subMappingTypes = fetchSubMappingTypes(filePath, functionName);

                return resolve({
                    variableTypes: subMappingTypes
                });
            } catch (error: any) {
                reject(error);
            }
        });
    }

    async updateFileContent(params: UpdateFileContentRequest): Promise<void> {
        const project = DMProject.getInstance(params.filePath).getProject();
        const sourceFile = project.getSourceFileOrThrow(params.filePath);
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
                workspaceFolder.uri.fsPath, 'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper');
            const absPath = path.join(dataMapperConfigFolder, configName, regPathParts[regPathParts.length - 1]);
            return absPath;
        };
        return '';
    }

    async browseSchema(params: BrowseSchemaRequest): Promise<BrowseSchemaResponse> {
        return new Promise(async (resolve) => {
            const { documentUri, overwriteSchema, resourceName, content, ioType, schemaType, configName } = params;
            if (overwriteSchema) {
                const response = await window.showInformationMessage(
                    "Are you sure you want to override the existing schema?\n\nPlease note that this will remove all existing mappings.",
                    { modal: true },
                    "Yes",
                    "No"
                );
                if (!response || response === "No") {
                    resolve({ success: false });
                    return;
                }
            }
            if (content) {
                let schema: JSONSchema3or4;
                try {
                    schema = await generateSchemaFromContent(ioType, content, schemaType);
                } catch (error: any) {
                    console.error(error);
                    window.showErrorMessage("Error while generating schema. Please check the input file and Resource Type and try again.");
                    return resolve({ success: false });
                }

                try {
                    await updateDMC(configName, documentUri, schema, ioType);
                    await this.formatDMC(documentUri);
                    navigate();
                    return resolve({ success: true });
                } catch (error: any) {
                    console.error(error);
                    window.showErrorMessage("Error while updating DMC file.");
                    return resolve({ success: false });
                }
            };
            resolve({ success: false });
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
                    workspaceFolder.uri.fsPath, 'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper');
                if (!fs.existsSync(dataMapperConfigFolder)) {
                    return resolve({ dmConfigs: [] });
                }
                const dmConfigs: string[] = [];
                for (const folder of fs.readdirSync(dataMapperConfigFolder)) {
                    if (fs.lstatSync(path.join(dataMapperConfigFolder, folder)).isDirectory() &&
                        fs.existsSync(path.join(dataMapperConfigFolder, folder, `${folder}.ts`))) {
                        dmConfigs.push(folder);
                    }
                }
                resolve({ dmConfigs });
                return;
            }
            reject({ dmConfigs: [] });
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
                    workspaceFolder.uri.fsPath, 'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper');
                const absPath = path.join(dataMapperConfigFolder, configName, `${configName}.ts`);
                resolve({ absPath, configName });
            };
            reject({ absPath: '', configName: '' });
        });
    }

    // Function to read the TypeScript file which contains the schema interfaces to be mapped
    async readTSFile(): Promise<string> {
        //sourcePath is the path of the TypeScript file which contains the schema interfaces to be mapped
        const sourcePath = StateMachine.context().dataMapperProps?.filePath;
        // Check if sourcePath is defined
        if (sourcePath) {
            const [tsFullText, tsInterfacesText] = getSources(sourcePath);
            try {
                return tsFullText;
            } catch (error) {
                console.error('Failed to read TypeScript file: ', error);
                throw error;
            }
        } else {
            throw new Error("sourcePath is undefined");
        }
    }

    //Function to update the body of a function in a TypeScript file
    async writeDataMapping(params: DataMapWriteRequest): Promise<void> {
        const { dataMapping } = params;
        const sourcePath = StateMachine.context().dataMapperProps?.filePath;
        if (sourcePath) {
            try {
                const project = DMProject.getInstance(sourcePath).getProject();

                const sourceFile = project.getSourceFileOrThrow(sourcePath);
                
                // find the function declaration
                const functionDeclaration = sourceFile.getFunction(READONLY_MAPPING_FUNCTION_NAME);
                if (functionDeclaration) {
                    // update the function body
                    functionDeclaration.setBodyText(`return {${dataMapping}};`);
                    // write the updates to the file
                    await sourceFile.save();
                } else {
                    console.error("Error in writing data mapping. mapFunction not found in target ts file.");
                }
            } catch (error) {
                console.error('Failed to write data mapping to files: ', error);
                throw error; // Rethrow the error to handle it further up the call stack if necessary
            }
        }
    }

    async fetchBackendUrl() {
        try {
            let miDiagramRpcManager: MiDiagramRpcManager = new MiDiagramRpcManager();
            const { url } = await miDiagramRpcManager.getBackendRootUrl();

            return url;
            // Do something with backendRootUri
        } catch (error) {
            console.error('Failed to fetch backend URL:', error);
        }
    }

    // Main function to get the mapping from OpenAI and write it to the relevant files
    async getMappingFromOpenAI(): Promise<void> {
        try {
            let tsContent = await this.readTSFile();

            // Recursive function to find the content of each interface with the given name
            const findInterfaceText = (node: ts.Node, interfaceName: string): string | null | undefined => {
                if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
                    return node.getText();
                }
                return node.forEachChild(child => findInterfaceText(child, interfaceName));
            };

            // Function to extract InputRoot and OutputRoot names from tsContent
            const extractRootNames = (content: string): { inputRoot: string, outputRoot: string } => {
                const mapFunctionRegex = /function\s+mapFunction\s*\(\s*input\s*:\s*(\w+)\s*\)\s*:\s*(\w+)\s*{/;
                const match = content.match(mapFunctionRegex);
                if (!match) {
                    throw new Error('mapFunction signature not found in TypeScript file.');
                }
                return { inputRoot: match[1], outputRoot: match[2] };
            };

            const makeRequest = async (url: string, token: string) => {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(schema)
                });
                if (!response.ok) throw new Error(`Error while checking token: ${response.statusText}`);
                return response.json();
            }

            // Extract InputRoot and OutputRoot names
            const { inputRoot, outputRoot } = extractRootNames(tsContent);

            const backendRootUri = await this.fetchBackendUrl();
            const url = backendRootUri + DATAMAP_BACKEND_URL;

            // Parse the TypeScript content into an AST to find the InputRoot and OutputRoot interfaces
            const sourceFile = ts.createSourceFile('temp.ts', tsContent, ts.ScriptTarget.Latest, true);

            const inputSchema = findInterfaceText(sourceFile, inputRoot);
            const outputSchema = findInterfaceText(sourceFile, outputRoot);

            if (!inputSchema || !outputSchema) {
                throw new Error('InputRoot or OutputRoot interface not found in TypeScript file.');
            }

            const schema = {
                input: inputSchema,
                output: outputSchema
            };

            const openSignInView = () => {
                let miVisualizerRpcClient: MiVisualizerRpcManager = new MiVisualizerRpcManager();
                miVisualizerRpcClient.openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.LoggedOut } });
            };

            let token;
            try {
                token = await extension.context.secrets.get('MIAIUser');
            }
            catch (error) {
                console.error('User not signed in', error);
                openSignInView();
                return; // If there is no token, return early to exit the function
            }

            let response;
            try {
                response = await makeRequest(url, token);
            }
            catch (error) {
                // Handle 401 and 403 errors by refreshing the auth code
                if (response.status === 401 || response.status === 403) {
                    const newToken = await refreshAuthCode();
                    if (!newToken) {
                        console.error('Could not refresh auth code');
                        throw new Error('Could not refresh auth code');
                    }
                    response = await makeRequest(url, newToken);
                }
                else {
                    throw error;
                }
            }

            interface DataMapResponse {
                mapping: string;
                event: string;
                usage: string;
            }

            // Parse the response from the request
            const data = await response as DataMapResponse;
            if (data.event === "data_mapping_success") {
                // Extract the mapping string and pass it to the writeDataMapping function
                const mappingString = data.mapping;

                // Create an object of type DataMapWriteRequest
                const dataMapWriteRequest: DataMapWriteRequest = {
                    dataMapping: mappingString
                };

                await this.writeDataMapping(dataMapWriteRequest);
            }
            else {
                // Log error or perform error handling
                console.error('Data mapping was not successful');
            }
        } catch (error) {
            console.error('Error while generating data mapping', error);
            throw error;
        }
    }


    async createDMFiles(params: GenerateDMInputRequest): Promise<GenerateDMInputResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                const dmContent = `import * as ${DM_OPERATORS_IMPORT_NAME} from "./${DM_OPERATORS_FILE_NAME}";\n\n/**\n* inputType:unknown\n*/\ninterface InputRoot {\n}\n\n/**\n* outputType:unknown\n*/\ninterface OutputRoot {\n}\n\nexport function mapFunction(input: InputRoot): OutputRoot {\nreturn {}\n};`;
                const { filePath, dmName } = params;
                const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(filePath));
                let miDiagramRpcManager: MiDiagramRpcManager = new MiDiagramRpcManager();

                if (workspaceFolder) {
                    const dataMapperConfigFolder = path.join(
                        workspaceFolder.uri.fsPath, 'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper', dmName);
                    if (!fs.existsSync(dataMapperConfigFolder)) {
                        fs.mkdirSync(dataMapperConfigFolder, { recursive: true });
                    }
                    const tsFilePath = path.join(dataMapperConfigFolder, `${dmName}.ts`);
                    if (!fs.existsSync(tsFilePath)) {
                        fs.writeFileSync(tsFilePath, dmContent);
                    }

                    const operatorsSrcFilePath = path.join(extension.context.extensionUri.fsPath, "resources", "data-mapper-utils", `${DM_OPERATORS_FILE_NAME}.ts.lib`);
                    const operatorsDstFilePath = path.join(dataMapperConfigFolder, `${DM_OPERATORS_FILE_NAME}.ts`);
                    fs.copyFileSync(operatorsSrcFilePath, operatorsDstFilePath, fs.constants.COPYFILE_FICLONE);

                    const dmcFilePath = path.join(dataMapperConfigFolder, `${dmName}.dmc`);
                    if (!fs.existsSync(dmcFilePath)) {
                        await miDiagramRpcManager.createRegistryResource({
                            filePath: "",
                            projectDirectory: workspaceFolder.uri.fsPath,
                            templateType: "Data Mapper",
                            resourceName: dmName,
                            artifactName: dmName,
                            registryRoot: "gov",
                            registryPath: `/datamapper/${dmName}`,
                            createOption: "entryOnly",
                            content: ""

                        });
                    }
                    const inputSchemaFilePath = path.join(dataMapperConfigFolder, `${dmName}_inputSchema.json`);
                    if (!fs.existsSync(inputSchemaFilePath)) {
                        await miDiagramRpcManager.createRegistryResource({
                            filePath: "",
                            projectDirectory: workspaceFolder.uri.fsPath,
                            templateType: "Data Mapper Schema",
                            resourceName: `${dmName}_inputSchema`,
                            artifactName: `${dmName}_inputSchema`,
                            registryRoot: "gov",
                            registryPath: `/datamapper/${dmName}`,
                            createOption: "entryOnly",
                            content: "{}"

                        });
                    }
                    const outputSchemaFilePath = path.join(dataMapperConfigFolder, `${dmName}_outputSchema.json`);
                    if (!fs.existsSync(outputSchemaFilePath)) {
                        await miDiagramRpcManager.createRegistryResource({
                            filePath: "",
                            projectDirectory: workspaceFolder.uri.fsPath,
                            templateType: "Data Mapper Schema",
                            resourceName: `${dmName}_outputSchema`,
                            artifactName: `${dmName}_outputSchema`,
                            registryRoot: "gov",
                            registryPath: `/datamapper/${dmName}`,
                            createOption: "entryOnly",
                            content: "{}"

                        });
                    }
                    resolve({ success: true });
                }
            } catch (error: any) {
                console.error(error);
                reject(error);
            }
        });
    }

    async initDMUndoRedoManager(params: UpdateDMUndoRedoMangerRequest): Promise<void> {
        undoRedoManager.updateContent(params.filePath, params.fileContent);
    }

    async dmUndo(): Promise<string | undefined> {
        return new Promise(async (resolve) => {
            const undoContent = undoRedoManager.undo();
            resolve(undoContent);
        });
    }

    async dmRedo(): Promise<string | undefined> {
        return new Promise(async (resolve) => {
            const redoContent = undoRedoManager.redo();
            resolve(redoContent);
        });
    }

    async addToDMUndoStack(source: string): Promise<void> {
        undoRedoManager.addModification(source);
    }

    async updateDMUndoRedoManager(params: UpdateDMUndoRedoMangerRequest): Promise<void> {
        undoRedoManager.updateContent(params.filePath, params.fileContent);
    }

    async getCompletions(params: GetCompletionsRequest): Promise<GetCompletionsResponse> {
        return new Promise(async (resolve, reject) => {
            const { filePath, fileContent, cursorPosition } = params;
            try {
                resolve({ completions: fetchCompletions(filePath, fileContent, cursorPosition) });
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }

    async getDMDiagnostics(params: GetDMDiagnosticsRequest): Promise<GetDMDiagnosticsResponse> {
        const diagnostics = fetchDiagnostics(params.filePath);

        const formattedDiagnostics: DMDiagnostic[] = diagnostics.map((diagnostic) => {
            return {
                messageText: typeof diagnostic.messageText !== "string"
                    ? diagnostic.messageText.messageText : diagnostic.messageText,
                category: diagnostic.category as unknown as DMDiagnosticCategory,
                code: diagnostic.code,
                start: diagnostic.start,
                length: diagnostic.length,
                source: diagnostic.source
            };
        });

        return { diagnostics: formattedDiagnostics };
    }
}

