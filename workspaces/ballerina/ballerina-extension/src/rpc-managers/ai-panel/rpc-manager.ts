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
    AIPanelAPI,
    AIVisualizerState,
    AI_EVENT_TYPE,
    AddToProjectRequest,
    DiagnosticEntry,
    Diagnostics,
    ErrorCode,
    GenerateMappingsRequest,
    GenerateMappingsResponse,
    InitialPrompt,
    NOT_SUPPORTED_TYPE,
    NotifyAIMappingsRequest,
    ProjectDiagnostics,
    ProjectSource,
    STModification,
    SyntaxTree,
} from "@wso2-enterprise/ballerina-core";
import { ModulePart, RequiredParam, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import path from "path";
import { Uri, window, workspace } from 'vscode';

import { getPluginConfig } from "../../../src/utils";
import { extension } from "../../BalExtensionContext";
import { NOT_SUPPORTED } from "../../core";
import { StateMachine, updateView } from "../../stateMachine";
import { modifyFileContent } from "../../utils/modification";
import { StateMachineAI } from '../../views/ai-panel/aiMachine';
import { MODIFIYING_ERROR, PARSING_ERROR, UNAUTHORIZED, UNKNOWN_ERROR } from "../../views/ai-panel/errorCodes";
import { constructRecord, getDatamapperCode, getFunction, getParamDefinitions, handleLogin, handleStop, isErrorCode, isLoggedin, notifyNoGeneratedMappings, refreshAccessToken } from "./utils";
export let hasStopped: boolean = false;

export class AiPanelRpcManager implements AIPanelAPI {
    async getBackendURL(): Promise<string> {
        return new Promise(async (resolve) => {
            const config = getPluginConfig();
            const BACKEND_URL = config.get('rootUrl') as string;
            resolve(BACKEND_URL);
        });
    }

    async updateProject(): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getToken(): Promise<string> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async login(): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        StateMachineAI.service().send(AI_EVENT_TYPE.LOGIN);
    }

    async logout(): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        StateMachineAI.service().send(AI_EVENT_TYPE.LOGOUT);
    }

    async getAIVisualizerState(): Promise<AIVisualizerState> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getAiPanelState(): Promise<AIVisualizerState> {
        return { state: StateMachineAI.state() };
    }

    async getAccessToken(): Promise<string> {
        // return new Promise(async (resolve) => {
        //     resolve(StateMachineAI.context().token as string);
        // });
        return new Promise(async (resolve) => {
            const token = await extension.context.secrets.get('BallerinaAIUser');
            resolve(token as string);
        });
    }

    async refreshAccessToken(): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getProjectUuid(): Promise<string> {
        // ADD YOUR IMPLEMENTATION HERE
        return new Promise(async (resolve) => {
            console.log("Implementing getProjectUuid");
            // Check if there is at least one workspace folder
            if (!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
                console.error("No workspace folder is open.");
                resolve("");
                return;
            }

            // Use the path of the first workspace folder
            const workspaceFolderPath = workspace.workspaceFolders[0].uri.fsPath;

            // Create a hash of the workspace folder path
            const hash = crypto.createHash('sha256');
            hash.update(workspaceFolderPath);
            const hashedWorkspaceFolderPath = hash.digest('hex');

            console.log("Workspace folder path hashed successfully.");
            resolve(hashedWorkspaceFolderPath);
        });
    }

    async addToProject(req: AddToProjectRequest): Promise<void> {

        const workspaceFolders = workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error("No workspaces found.");
        }

        const workspaceFolderPath = workspaceFolders[0].uri.fsPath;
        // Check if workspaceFolderPath is a Ballerina project
        // Assuming a Ballerina project must contain a 'Ballerina.toml' file
        const ballerinaProjectFile = path.join(workspaceFolderPath, 'Ballerina.toml');
        if (!fs.existsSync(ballerinaProjectFile)) {
            throw new Error("Not a Ballerina project.");
        }

        const balFilePath = path.join(workspaceFolderPath, req.filePath);
        fs.writeFileSync(balFilePath, req.content.trim());
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateView();
    }

    async getRefreshToken(): Promise<string> {
        return new Promise(async (resolve) => {
            const token = await refreshAccessToken();
            resolve(token);
        });
    }

    async generateMappings(params: GenerateMappingsRequest): Promise<GenerateMappingsResponse> {
        const logged = await isLoggedin();

        if (!logged) {
            return { error: UNAUTHORIZED };
        }

        const { filePath, position } = params;

        const fileUri = Uri.file(filePath).toString();
        hasStopped = false;

        const fnSTByRange = await StateMachine.langClient().getSTByRange(
            {
                lineRange: {
                    start: {
                        line: position.startLine,
                        character: position.startColumn
                    },
                    end: {
                        line: position.endLine,
                        character: position.endColumn
                    }
                },
                documentIdentifier: {
                    uri: fileUri
                }
            }
        );

        if (fnSTByRange === NOT_SUPPORTED) {
            return { error: UNKNOWN_ERROR };
        }

        const {
            parseSuccess: fnSTByRangeParseSuccess,
            syntaxTree: fnSTByRangeSyntaxTree,
            source: oldSource
        } = fnSTByRange as SyntaxTree;
        const fnSt = fnSTByRangeSyntaxTree as STNode;

        if (!fnSTByRangeParseSuccess || !STKindChecker.isFunctionDefinition(fnSt)) {
            return { error: PARSING_ERROR };
        }

        const parameterDefinitions = await getParamDefinitions(fnSt, fileUri);

        if (isErrorCode(parameterDefinitions)) {
            return { error: (parameterDefinitions as ErrorCode) };
        }

        const codeObject: object | ErrorCode = await getDatamapperCode(parameterDefinitions);
        if (isErrorCode(codeObject)) {
            if ((codeObject as ErrorCode).code === 6) {
                return { userAborted: true };
            }
            return { error: codeObject as ErrorCode };
        }

        let codeString: string = constructRecord(codeObject);
        if (fnSt.functionSignature.returnTypeDesc.type.kind === "ArrayTypeDesc") {
            const parameter = fnSt.functionSignature.parameters[0];
            const param = parameter as RequiredParam;
            const paramName = param.paramName.value;
            codeString = codeString.startsWith(":") ? codeString.substring(1) : codeString;
            codeString = `=> from var ${paramName}Item in ${paramName}\n select ${codeString};`;
        } else {
            codeString = `=> ${codeString};`;
        }
        const modifications: STModification[] = [];
        modifications.push({
            type: "INSERT",
            config: { STATEMENT: codeString },
            endColumn: fnSt.functionBody.position.endColumn,
            endLine: fnSt.functionBody.position.endLine,
            startColumn: fnSt.functionBody.position.startColumn,
            startLine: fnSt.functionBody.position.startLine,
        });

        const stModifyResponse = await StateMachine.langClient().stModify({
            astModifications: modifications,
            documentIdentifier: {
                uri: fileUri
            }
        });

        const { parseSuccess, source, syntaxTree } = stModifyResponse as SyntaxTree;

        if (!parseSuccess) {
            return { error: MODIFIYING_ERROR };
        }

        const fn = getFunction(syntaxTree as ModulePart, fnSt.functionName.value);

        if (fn && fn.source !== oldSource) {
            modifyFileContent({ filePath, content: source });
            updateView();

            return { newFnPosition: fn.position };
        } else if (fn.source === oldSource) {
            notifyNoGeneratedMappings();
            return {};
        }

        return { error: UNKNOWN_ERROR };
    }

    async notifyAIMappings(params: NotifyAIMappingsRequest): Promise<boolean> {
        const { newFnPosition, prevFnSource, filePath } = params;
        const fileUri = Uri.file(filePath).toString();
        const undoAction = 'Undo';
        const msg = 'You have automatically generated mappings. Do you want to undo the changes?';
        const result = await window.showInformationMessage(msg, undoAction, 'Close');

        if (result === undoAction) {
            const res = await StateMachine.langClient().stModify({
                astModifications: [{
                    type: "INSERT",
                    config: { STATEMENT: prevFnSource },
                    ...newFnPosition
                }],
                documentIdentifier: {
                    uri: fileUri
                }
            });

            const { source } = res as SyntaxTree;
            modifyFileContent({ filePath, content: source });
            updateView();
        }

        return true;
    }

    async stopAIMappings(): Promise<GenerateMappingsResponse> {
        hasStopped = true;
        handleStop();
        return { userAborted: true };
    }

    async promptLogin(): Promise<boolean> {
        await handleLogin();
        return true;
    }

    async getProjectSource(): Promise<ProjectSource> {
        // Fetch the Ballerina project source
        const project: BallerinaProject = await getCurrentProjectSource();

        // Initialize the ProjectSource object
        const projectSource: ProjectSource = {
            sourceFiles: []
        };

        // Iterate through root-level sources
        for (const [filePath, content] of Object.entries(project.sources)) {
            projectSource.sourceFiles.push({ filePath, content });
        }

        // // Iterate through module sources
        // if (project.modules) {
        //     for (const module of project.modules) {
        //         for (const [fileName, content] of Object.entries(module.sources)) {
        //             const filePath = `modules/${module.moduleName}/${fileName}`;
        //             projectSource.sourceFiles.push({ filePath, content });
        //         }
        //     }
        // }

        return projectSource;
    }

    async getShadowDiagnostics(project: ProjectSource): Promise<ProjectDiagnostics> {

        //TODO: Move this to LS
        const projectRoot = await getBallerinaProjectRoot();

        if (!projectRoot) {
            return null;
        }
        const randomNum = Math.floor(Math.random() * 90000) + 10000;
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `bal-proj-${randomNum}-`));
        //Copy project
        const langClient = StateMachine.langClient();
        fs.cpSync(projectRoot, tempDir, { recursive: true });
        //Apply edits
        // const diagnostics: Diagnostic[] = [];
        for (const sourceFile of project.sourceFiles) {
            // Update lastUpdatedBalFile if it's a .bal file
            if (sourceFile.filePath.endsWith('.bal')) {
                const tempFilePath = path.join(tempDir, sourceFile.filePath);

                // Write content to file
                fs.writeFileSync(tempFilePath, sourceFile.content, 'utf8');

                //Open Project
                langClient.didOpen({
                    textDocument: {
                        uri: Uri.file(tempFilePath).toString(),
                        languageId: 'ballerina',
                        version: 1,
                        text: sourceFile.content
                    }
                });
            }
        }

        //remove unused imports?

        // check project diagnostics
        let projectDiags: Diagnostics[] = await checkProjectDiagnostics(project, langClient, tempDir);

        let projectModified = await addMissingImports(projectDiags);
        if (projectModified) {
            projectDiags = await checkProjectDiagnostics(project, langClient, tempDir);
        }

        let isDiagsRefreshed: boolean = await isModuleNotFoundDiagsExist(projectDiags, langClient);
        if (isDiagsRefreshed) {
            projectDiags = await checkProjectDiagnostics(project, langClient, tempDir);
        }
        const filteredDiags: DiagnosticEntry[] = getErrorDiagnostics(projectDiags);

        return {
            diagnostics: filteredDiags
        };
    }

    async getInitialPrompt(): Promise<InitialPrompt> {
        const initialPrompt = extension.initialPrompt;
        if (initialPrompt) {
            return {
                exists: true,
                text: initialPrompt
            };
        } else {
            return {
                exists: false,
                text: ""
            };
        }
    }

    async clearInitialPrompt(): Promise<void> {
        extension.initialPrompt = undefined;
    }
}

interface BalModification {
    fileUri: string;
    moduleName: string;
}

async function addMissingImports(diagnosticsResult: Diagnostics[]): Promise<boolean> {
    let modifications : BalModification[] = [];
    let projectModified = false;
    for (const diagnostic of diagnosticsResult) {
        const fielUri = diagnostic.uri;
        for (const diag of diagnostic.diagnostics) {
            //undefined module 'io'(BCE2000)
            if (diag.code !== "BCE2000") {
                continue;
            }
            const module = getContentInsideQuotes(diag.message);
            modifications.push({fileUri: fielUri, moduleName: module});
        }
    }

    for (const mod of modifications) {
        const fileUri = mod.fileUri;
        const moduleName = mod.moduleName;
        let importStatement = "";
        if (moduleName == 'io') {
            importStatement = `import ballerina/io;\n`;
        } else if (moduleName == 'http') {
            importStatement = `import ballerina/http;\n`;
        } else if (moduleName == 'log') {
            importStatement = `import ballerina/log;\n`;
        } else if (moduleName == 'runtime') {
            importStatement = `import ballerina/lang.runtime;\n`;
        } else {
            continue;
        }

        const document = await workspace.openTextDocument(Uri.parse(fileUri));
        const content = document.getText();
        const updatedContent = importStatement + content;

        await modifyFileContent({ filePath: Uri.parse(fileUri).fsPath, content: updatedContent });
        projectModified = true;
    }

    return projectModified;
}

function getContentInsideQuotes(input: string): string | null {
    const match = input.match(/'([^']+)'/);
    return match ? match[1] : null;
}

async function isModuleNotFoundDiagsExist(diagnosticsResult: Diagnostics[], langClient): Promise<boolean> {
    for (const diagnostic of diagnosticsResult) {
        // if (diagnostic.uri !== Uri.file(tempFilePath).toString()) {
        //     continue;
        // }
        for (const diag of diagnostic.diagnostics) {
            //Example: cannot resolve module 'ballerinax/aws.s3 as s3'(BCE2003)
            if (diag.code !== "BCE2003") {
                continue;
            }
            //resolve unresolved modules
            const dependenciesResponse = await langClient.resolveMissingDependencies({
                documentIdentifier: {
                    uri: diagnostic.uri
                }
            });


            const response = dependenciesResponse as SyntaxTree;
            if (response.parseSuccess) {
                // TODO: Need to see why this isnt working and why didOpen needed.
                // await langClient.didChange({
                //     contentChanges: [{ text: "" }],
                //     textDocument: {
                //         uri: uriString,
                //         version: 1
                //     }
                // });

                // Read and save content to a string
                const sourceFile = await workspace.openTextDocument(Uri.parse(diagnostic.uri));
                const content = sourceFile.getText();
                
                langClient.didOpen({
                    textDocument: {
                        uri: diagnostic.uri,
                        languageId: 'ballerina',
                        version: 1,
                        text: content
                    }
                });
                return true;
            } else {
                throw Error("Module resolving failedd");
            }
        }
    }
    return false;
}

async function checkProjectDiagnostics(project: ProjectSource, langClient, tempDir: string): Promise<Diagnostics[]> {
    const allDiags: Diagnostics[] = [];
    for (const sourceFile of project.sourceFiles) {
        if (sourceFile.filePath.endsWith('.bal')) {
            const tempFilePath = path.join(tempDir, sourceFile.filePath);
            let diagnosticsResult: Diagnostics[] | NOT_SUPPORTED_TYPE = await langClient.getDiagnostics({ documentIdentifier: { uri: Uri.file(tempFilePath).toString() } });
            if (!Array.isArray(diagnosticsResult)) {
                throw new Error("Something happend while checking diags");
            }

            allDiags.push(...diagnosticsResult);
        }
    }
    return allDiags;
}

function getErrorDiagnostics(diagnostics: Diagnostics[]): DiagnosticEntry[] {
    const errorDiagnostics: DiagnosticEntry[] = [];

    for (const diagParam of diagnostics) {
        for (const diag of diagParam.diagnostics) {
            if (diag.severity === 1) {
                const fileName = path.basename(diagParam.uri);
                const msgPrefix = `[${fileName}:${diag.range.start.line},${diag.range.start.character}:${diag.range.end.line},${diag.range.end.character}] `;
                errorDiagnostics.push({
                    message: msgPrefix + diag.message
                });
            }
        }
    }

    return errorDiagnostics;
}

interface BallerinaProject {
    modules?: BallerinaModule[];
    sources: { [key: string]: string };
}

interface BallerinaModule {
    moduleName: string;
    sources: { [key: string]: string };
}

async function getCurrentProjectSource(): Promise<BallerinaProject> {
    const projectRoot = await getBallerinaProjectRoot();

    if (!projectRoot) {
        return null;
    }

    const project: BallerinaProject = {
        modules: [],
        sources: {},
    };

    // Read root-level .bal files
    const rootFiles = fs.readdirSync(projectRoot);
    for (const file of rootFiles) {
        if (file.endsWith('.bal') || file.toLowerCase()=== "readme.md") {
            const filePath = path.join(projectRoot, file);
            project.sources[file] = await fs.promises.readFile(filePath, 'utf-8');
        }
    }

    // Read modules
    const modulesDir = path.join(projectRoot, 'modules');
    if (fs.existsSync(modulesDir)) {
        const modules = fs.readdirSync(modulesDir, { withFileTypes: true });
        for (const moduleDir of modules) {
            if (moduleDir.isDirectory()) {
                const module: BallerinaModule = {
                    moduleName: moduleDir.name,
                    sources: {},
                };

                const moduleFiles = fs.readdirSync(path.join(modulesDir, moduleDir.name));
                for (const file of moduleFiles) {
                    if (file.endsWith('.bal')) {
                        const filePath = path.join(modulesDir, moduleDir.name, file);
                        module.sources[file] = await fs.promises.readFile(filePath, 'utf-8');
                    }
                }

                project.modules.push(module);
            }
        }
    }

    return project;
}

async function getBallerinaProjectRoot(): Promise<string | null> {

    const workspaceFolders = workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error("No workspaces found.");
    }

    const workspaceFolderPath = workspaceFolders[0].uri.fsPath;
    // Check if workspaceFolderPath is a Ballerina project
    // Assuming a Ballerina project must contain a 'Ballerina.toml' file
    const ballerinaProjectFile = path.join(workspaceFolderPath, 'Ballerina.toml');
    if (fs.existsSync(ballerinaProjectFile)) {
        return workspaceFolderPath;
    }
    return null;
}
