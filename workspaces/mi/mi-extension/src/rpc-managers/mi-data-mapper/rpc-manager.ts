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
} from "@wso2-enterprise/mi-core";
import { fetchIOTypes, fetchSubMappingTypes, fetchCompletions, fetchDiagnostics } from "../../util/dataMapper";
import { Project, QuoteKind } from "ts-morph";
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
import { DM_OPERATORS_FILE_NAME, DM_OPERATORS_IMPORT_NAME, DATAMAP_BACKEND_URL, READONLY_MAPPING_FUNCTION_NAME } from "../../constants";
import { getSources } from "../../util/dataMapper";
import { refreshAuthCode } from '../../ai-panel/auth';
import { fetchBackendUrl, openSignInView, showMappingEndNotification, showSignedOutNotification } from "./ai-datamapper-utils";

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
                return resolve ({
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

    async authenticateUser(): Promise<boolean> {
        let token;
        try {
            // Get the user token from the secrets
            token = await extension.context.secrets.get('MIAIUser');
            if (!token) {
                showSignedOutNotification();
                openSignInView();
                return false; //If there is no token, return 'no'
            }
        } catch (error) {
            console.error('Error while getting user token.');
            showSignedOutNotification();
            openSignInView();
            return false; //If there is an error while getting the token, return 'no'
        }
        return true;
    }

    // Function to ask whether the user wants to replace all existing mappings with ai generated mappings
    async confirmMappingAction(): Promise<boolean> {
        // Define the message based on the action
        let message = "This will replace any existing mappings with AI. Are you sure?";
        // Show the confirmation dialog
        const response = await window.showInformationMessage(
            message,
            { modal: true },
            "Yes",
            "No"
        );
        // If user confirms the action by choosing Yes, return true. Otherwise, return false.
        if (!response || response === "No") {
            return false;
        }
        return true;
    }

    // Function to read the TypeScript file which contains the schema interfaces to be mapped
    async readTSFile(): Promise<string> {
        //sourcePath is the path of the TypeScript file which contains the schema interfaces to be mapped
        const sourcePath = StateMachine.context().dataMapperProps?.filePath;
        // Check if sourcePath is defined
        if (sourcePath) {
            const [tsFullText, _] = getSources(sourcePath);
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
        // sourcePath is the path of the TypeScript file which contains the schema interfaces to be mapped
        const sourcePath = StateMachine.context().dataMapperProps?.filePath;

        if (sourcePath) {
            try {
                // Get the project from the sourcePath
                const project = DMProject.getInstance(sourcePath).getProject();
                // Get the source file from the project
                const sourceFile = project.getSourceFileOrThrow(sourcePath);
                // find the mapFunction declaration
                const functionDeclaration = sourceFile.getFunction(READONLY_MAPPING_FUNCTION_NAME);

                if (functionDeclaration) {
                    // update the function body
                    functionDeclaration.setBodyText(`${dataMapping}`);
                    // write the updates to the file
                    await sourceFile.save();
                } else {
                    console.error("Error in writing data mapping, mapFunction not found in target ts file.");
                }
            } catch (error) {
                console.error('Failed to write data mapping to files: ', error);
                throw error; // Rethrow the error to handle it further up the call stack if necessary
            }
        }
    }

    // Main function to get the mapping from OpenAI and write it to the relevant files
    async getMappingFromAI(): Promise<void> {
        try {
            await this.writeDataMapping({ dataMapping: "" });

            // Function to read the TypeScript file
            let tsContent = await this.readTSFile();
            // Function to remove the mapFunction line from the TypeScript file
            function removeMapFunctionEntry(content: string): string {
                const project = new Project({
                    useInMemoryFileSystem: true,
                    manipulationSettings: {
                        quoteKind: QuoteKind.Single
                    }
                });
                // Create a temporary TypeScript file with the content of the source file
                const sourceFile = project.createSourceFile('temp.ts', content);
                // Get the mapFunction from the source file
                const mapFunction = sourceFile.getFunction('mapFunction');
                if (!mapFunction) {
                    throw new Error('mapFunction not found in TypeScript file.');
                }
                let functionContent;
                if (mapFunction.getBodyText()) {
                    // Get the function body text and remove any leading or trailing whitespace
                    functionContent = mapFunction.getBodyText()?.trim();
                }
                else {
                    throw new Error('No function body text found for mapFunction in TypeScript file.');
                }
                // Remove the mapFunction line from the source file
                sourceFile.removeText(mapFunction.getPos(), mapFunction.getEnd());
                return functionContent;
            }

            const backendRootUri = await fetchBackendUrl();
            const url = backendRootUri + DATAMAP_BACKEND_URL;

            let token;
            try {
                // Get the user token from the secrets
                token = await extension.context.secrets.get('MIAIUser');
                if (!token) {
                    openSignInView();
                }
            }
            catch (error) {
                console.error('Error while getting user token.');
                openSignInView();
                return; // If there is no token, return early to exit the function
            }

            // Function to make a request to the backend to get the data mapping
            const makeRequest = async (url: string, token: string) => {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ ts_file: tsContent })
                });
                if (!response.ok) throw new Error(`Error while checking token: ${response.statusText}`);
                return response.json();
            }

            let response;
            try {
                // Make a request to the backend to get the data mapping
                response = await makeRequest(url, token);
                // If not succesful, try refreshing the token
                if (response.status === 401 || response.status === 403) {
                    try {
                        token = await refreshAuthCode();
                        if (!token) {
                            throw new Error('Token refresh failed. Please relogin.');
                        }
                        // Retry the request after refreshing the token
                        response = await makeRequest(url, token);
                    }
                    catch (refreshError) {
                        openSignInView();
                        return;
                    }
                }
            } catch (error) {
                console.error('Error while making request to backend', error);
                openSignInView();
                return;
            }

            try {
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
                    // Remove the mapFunction line from the mapping string
                    const mappingRet = removeMapFunctionEntry(mappingString);
                    // Create an object of type DataMapWriteRequest
                    const dataMapWriteRequest: DataMapWriteRequest = {
                        dataMapping: mappingRet
                    };
                    await this.writeDataMapping(dataMapWriteRequest);
                    // Show a notification to the user
                    showMappingEndNotification();
                }
                else {
                    // Log error or perform error handling
                    console.error('Data mapping was not successful');
                }
            }
            catch (error) {
                console.error('Error while generating data mapping', error);
                throw error;
            }
        }
        catch (requestError) {
            console.error('Error while making request to backend', requestError);
            return;
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

