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
    BIModuleNodesRequest,
    BISourceCodeResponse,
    DeleteFromProjectRequest,
    DiagnosticEntry,
    Diagnostics,
    ErrorCode,
    GenerateMappingFromRecordResponse,
    GenerateMappingsFromRecordRequest,
    GenerateMappingsRequest,
    GenerateMappingsResponse,
    GenerateTestRequest,
    GenerateTypesFromRecordRequest,
    GenerateTypesFromRecordResponse,
    GeneratedTestSource,
    GetFromFileRequest,
    InitialPrompt,
    NOT_SUPPORTED_TYPE,
    NotifyAIMappingsRequest,
    PostProcessRequest,
    PostProcessResponse,
    ProjectDiagnostics,
    ProjectModule,
    ProjectSource,
    STModification,
    SourceFile,
    SyntaxTree
} from "@wso2-enterprise/ballerina-core";
import { ModulePart, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import path from "path";
import { Uri, window, workspace } from 'vscode';

import { writeFileSync } from "fs";
import { getPluginConfig } from "../../../src/utils";
import { extension } from "../../BalExtensionContext";
import { NOT_SUPPORTED } from "../../core";
import { generateDataMapping, generateTypeCreation } from "../../features/ai/dataMapping";
import { generateTest, getDiagnostics } from "../../features/ai/testGenerator";
import { StateMachine, updateView } from "../../stateMachine";
import { loginGithubCopilot } from "../../utils/ai/auth";
import { modifyFileContent, writeBallerinaFileDidOpen } from "../../utils/modification";
import { StateMachineAI } from '../../views/ai-panel/aiMachine';
import { MODIFIYING_ERROR, PARSING_ERROR, UNAUTHORIZED, UNKNOWN_ERROR } from "../../views/ai-panel/errorCodes";
import { getFunction, handleLogin, handleStop, isErrorCode, isLoggedin, notifyNoGeneratedMappings, processMappings, refreshAccessToken, searchDocumentation } from "./utils";
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
        StateMachineAI.service().send(AI_EVENT_TYPE.LOGIN);
    }

    async logout(): Promise<void> {
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

        let balFilePath = path.join(workspaceFolderPath, req.filePath);

        const directory = path.dirname(balFilePath);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        writeBallerinaFileDidOpen(balFilePath, req.content);
        updateView();
    }

    async getFromFile(req: GetFromFileRequest): Promise<string> {
        return new Promise(async (resolve) => {
            const workspaceFolders = workspace.workspaceFolders;
            if (!workspaceFolders) {
                throw new Error("No workspaces found.");
            }

            const workspaceFolderPath = workspaceFolders[0].uri.fsPath;
            const ballerinaProjectFile = path.join(workspaceFolderPath, 'Ballerina.toml');
            if (!fs.existsSync(ballerinaProjectFile)) {
                throw new Error("Not a Ballerina project.");
            }

            const balFilePath = path.join(workspaceFolderPath, req.filePath);
            const content = fs.promises.readFile(balFilePath, 'utf-8');
            resolve(content);
        });
    }

    async deleteFromProject(req: DeleteFromProjectRequest): Promise<void> {
        const workspaceFolders = workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error("No workspaces found.");
        }
    
        const workspaceFolderPath = workspaceFolders[0].uri.fsPath;
        const ballerinaProjectFile = path.join(workspaceFolderPath, 'Ballerina.toml');
        if (!fs.existsSync(ballerinaProjectFile)) {
            throw new Error("Not a Ballerina project.");
        }
    
        const balFilePath = path.join(workspaceFolderPath, req.filePath);    
        if (fs.existsSync(balFilePath)) {
            try {
                fs.unlinkSync(balFilePath); 
            } catch (err) {
                throw new Error("Could not delete the file.");
            }
        } else {
            throw new Error("File does not exist.");
        }
    
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateView();
    }    

    async getFileExists(req: GetFromFileRequest): Promise<boolean> {
        const workspaceFolders = workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error("No workspaces found.");
        }
    
        const workspaceFolderPath = workspaceFolders[0].uri.fsPath;
        const ballerinaProjectFile = path.join(workspaceFolderPath, 'Ballerina.toml');
        if (!fs.existsSync(ballerinaProjectFile)) {
            throw new Error("Not a Ballerina project.");
        }
    
        const balFilePath = path.join(workspaceFolderPath, req.filePath);
        if (fs.existsSync(balFilePath)) {
            return true;
        } 
        return false;
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

        let { filePath, position, file } = params;

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

        const st = await processMappings(fnSt, fileUri, file);
        if (isErrorCode(st)) {
            if ((st as ErrorCode).code === 6) {
                return { userAborted: true };
            }
            return { error: st as ErrorCode };
        }

        const { parseSuccess, source, syntaxTree } = st as SyntaxTree;

        if (!parseSuccess) {
            return { error: MODIFIYING_ERROR };
        }

        const fn = await getFunction(syntaxTree as ModulePart, fnSt.functionName.value);

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
            sourceFiles: [],
            projectModules: []
        };

        // Iterate through root-level sources
        for (const [filePath, content] of Object.entries(project.sources)) {
            projectSource.sourceFiles.push({ filePath, content });
        }

        // Iterate through module sources
        if (project.modules) {
            for (const module of project.modules) {
                const projectModule: ProjectModule = {
                    moduleName: module.moduleName,
                    sourceFiles: []
                };
                for (const [fileName, content] of Object.entries(module.sources)) {
                    // const filePath = `modules/${module.moduleName}/${fileName}`;
                    // projectSource.sourceFiles.push({ filePath, content });
                    projectModule.sourceFiles.push({ filePath: fileName, content });
                }
                projectSource.projectModules.push(projectModule);
            }
        }

        return projectSource;
    }

    async getShadowDiagnostics(project: ProjectSource): Promise<ProjectDiagnostics> {
        const environment = await setupProjectEnvironment(project);
        if (!environment) {
            return { diagnostics: [] };
        }
    
        const { langClient, tempDir } = environment;
        // check project diagnostics
        let projectDiags: Diagnostics[] = await checkProjectDiagnostics(project, langClient, tempDir);
    
        let projectModified = await addMissingImports(projectDiags);
        if (projectModified) {
            projectDiags = await checkProjectDiagnostics(project, langClient, tempDir);
        }
    
        let isDiagsRefreshed = await isModuleNotFoundDiagsExist(projectDiags, langClient);
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

    async checkSyntaxError(project: ProjectSource): Promise<boolean> {
        const environment = await setupProjectEnvironment(project);
        if (!environment) {
            return false;
        }
    
        const { langClient, tempDir } = environment;
        // check project diagnostics
        const projectDiags: Diagnostics[] = await checkProjectDiagnostics(project, langClient, tempDir);
    
        for (const diagnostic of projectDiags) {
            for (const diag of diagnostic.diagnostics) {
                console.log(diag.code);
                if (typeof diag.code === "string" && diag.code.startsWith("BCE")) {
                    const match = diag.code.match(/^BCE(\d+)$/);
                    if (match) {
                        const codeNumber = Number(match[1]);
                        if (codeNumber < 2000) {
                            return true;
                        }
                    }
                }
            }
        }
    
        return false;
    }

    async getGeneratedTest(params: GenerateTestRequest): Promise<GeneratedTestSource> {
        const projectRoot = await getBallerinaProjectRoot();
        return await generateTest(projectRoot, params);
    }

    async getTestDiagnostics(params: GeneratedTestSource): Promise<ProjectDiagnostics> {
        const projectRoot = await getBallerinaProjectRoot();
        return await getDiagnostics(projectRoot, params);
    }

    async getMappingsFromRecord(params: GenerateMappingsFromRecordRequest): Promise<GenerateMappingFromRecordResponse> {
        const projectRoot = await getBallerinaProjectRoot();
        return await generateDataMapping(projectRoot, params);
    }

    async getTypesFromRecord(params: GenerateTypesFromRecordRequest): Promise<GenerateTypesFromRecordResponse> {
        const projectRoot = await getBallerinaProjectRoot();
        return await generateTypeCreation(projectRoot, params);
    }

    async postProcess(req: PostProcessRequest): Promise<PostProcessResponse> {
        let assist_resp = req.assistant_response;
        assist_resp = assist_resp.replace(/import ballerinax\/client\.config/g, "import ballerinax/'client.config");
        const project: ProjectSource = getProjectFromResponse(assist_resp);
        const environment = await setupProjectEnvironment(project);
        if (!environment) {
            return { assistant_response: assist_resp, diagnostics: { diagnostics: [] } };
        }

        const { langClient, tempDir } = environment;
        // check project diagnostics
        let projectDiags: Diagnostics[] = await checkProjectDiagnostics(project, langClient, tempDir);

        let projectModified = await addMissingImports(projectDiags);
        if (projectModified) {
            projectDiags = await checkProjectDiagnostics(project, langClient, tempDir);
        }

        projectModified = await removeUnusedImports(projectDiags);
        if (projectModified) {
            projectDiags = await checkProjectDiagnostics(project, langClient, tempDir);
        }

        let isDiagsRefreshed = await isModuleNotFoundDiagsExist(projectDiags, langClient);
        if (isDiagsRefreshed) {
            projectDiags = await checkProjectDiagnostics(project, langClient, tempDir);
        }
        const filteredDiags: DiagnosticEntry[] = getErrorDiagnostics(projectDiags);
        const newAssistantResponse = getModifiedAssistantResponse(assist_resp, tempDir, project);
        return {
            assistant_response: newAssistantResponse,
            diagnostics: {
                diagnostics: filteredDiags
            }
        };
    }

    async applyDoOnFailBlocks(): Promise<void> {
        const projectRoot = await getBallerinaProjectRoot();

        if (!projectRoot) {
            return null;
        }

        const balFiles: string[] = [];

        const findBalFiles = (dir: string) => {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    findBalFiles(filePath);
                } else if (file.endsWith('.bal')) {
                    balFiles.push(filePath);
                }
            }
        };

        findBalFiles(projectRoot);

        for (const balFile of balFiles) {
            const req: BIModuleNodesRequest = {
                filePath: balFile
            };

            const resp: BISourceCodeResponse = await StateMachine.langClient().addErrorHandler(req);
            await this.updateSource(resp, false);
        }
    }

    // TODO: Reuse the one in bi-diagram
    async updateSource(
        params: BISourceCodeResponse,
        isConnector?: boolean,
        isDataMapperFormUpdate?: boolean
    ): Promise<void> {
        const modificationRequests: Record<string, { filePath: string; modifications: STModification[] }> = {};

        for (const [key, value] of Object.entries(params.textEdits)) {
            const fileUri = Uri.parse(key);
            const fileUriString = fileUri.toString();
            const edits = value;

            if (edits && edits.length > 0) {
                const modificationList: STModification[] = [];

                for (const edit of edits) {
                    const stModification: STModification = {
                        startLine: edit.range.start.line,
                        startColumn: edit.range.start.character,
                        endLine: edit.range.end.line,
                        endColumn: edit.range.end.character,
                        type: "INSERT",
                        isImport: false,
                        config: {
                            STATEMENT: edit.newText,
                        },
                    };
                    modificationList.push(stModification);
                }

                if (modificationRequests[fileUriString]) {
                    modificationRequests[fileUriString].modifications.push(...modificationList);
                } else {
                    modificationRequests[fileUriString] = { filePath: fileUri.fsPath, modifications: modificationList };
                }
            }
        }

        // Iterate through modificationRequests and apply modifications
        for (const [fileUriString, request] of Object.entries(modificationRequests)) {
            const { parseSuccess, source, syntaxTree } = (await StateMachine.langClient().stModify({
                documentIdentifier: { uri: fileUriString },
                astModifications: request.modifications,
            })) as SyntaxTree;

            if (parseSuccess) {
                writeFileSync(request.filePath, source);
                await StateMachine.langClient().didChange({
                    textDocument: { uri: fileUriString, version: 1 },
                    contentChanges: [
                        {
                            text: source,
                        },
                    ],
                });

                if (isConnector) {
                    await StateMachine.langClient().resolveMissingDependencies({
                        documentIdentifier: { uri: fileUriString },
                    });
                    // Temp fix: ResolveMissingDependencies does not work uless we call didOpen, This needs to be fixed in the LS
                    await StateMachine.langClient().didOpen({
                        textDocument: { uri: fileUriString, languageId: "ballerina", version: 1, text: source },
                    });
                }
            }
        }
        if (!isConnector && !isDataMapperFormUpdate) {
            updateView();
        }
    }

    async getActiveFile(): Promise<string> {    
        const activeTabGroup = window.tabGroups.all.find(group => {
            return group.activeTab.isActive && group.activeTab?.input;
        });

        if (activeTabGroup && activeTabGroup.activeTab && activeTabGroup.activeTab.input) {
            const activeTabInput = activeTabGroup.activeTab.input as { uri: { fsPath: string } };
    
            if (activeTabInput.uri) {
                const fileUri = activeTabInput.uri;
                const fileName = fileUri.fsPath.split('/').pop(); 
                return fileName || '';  
            }
        }
    }

    async getFromDocumentation(content: string): Promise<string> {
        const response = await searchDocumentation(content);
        return response.toString();
    }

    async openSettings(): Promise<void> {
        StateMachineAI.service().send(AI_EVENT_TYPE.SETUP);
    }

    async openChat(): Promise<void> {
        StateMachineAI.service().send(AI_EVENT_TYPE.CHAT);
    }

    async promptGithubAuthorize(): Promise<boolean> {
        return await loginGithubCopilot();
        //Change state to notify?
        // return true;
    }

    async promptWSO2AILogout(): Promise<boolean> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async isCopilotSignedIn(): Promise<boolean> {
       const token = await extension.context.secrets.get('GITHUB_COPILOT_TOKEN');
        if (token && token !== '') {
            return true;
        }
        return false;
    }

    async isWSO2AISignedIn(): Promise<boolean> {
        const token = await extension.context.secrets.get('BallerinaAIUser');
        if (token && token !== '') {
            return true;
        }
        return false;
    }

    async showSignInAlert(): Promise<boolean> {
        const resp =  await extension.context.secrets.get('LOGIN_ALERT_SHOWN');
        if (resp === 'true') {
            return false;
        }
        const isWso2Signed = await this.isWSO2AISignedIn();

        if (isWso2Signed) {
            return false;
        }
        return true;
    }

    async markAlertShown(): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        // throw new Error('Not implemented');
        await extension.context.secrets.store('LOGIN_ALERT_SHOWN', 'true');
    }
}

function getModifiedAssistantResponse(originalAssistantResponse: string, tempDir: string, project: ProjectSource) : string {
    const newSourceFiles = [];
    for (const sourceFile of project.sourceFiles) {
        const newContent = path.join(tempDir, sourceFile.filePath);
        newSourceFiles.push({ filePath: sourceFile.filePath, content: fs.readFileSync(newContent, 'utf-8') });
    }

    // Build a map from filenames to their new content
    const fileContentMap = new Map<string, string>();
    for (const sourceFile of newSourceFiles) {
        fileContentMap.set(sourceFile.filePath, sourceFile.content);
    }

    // Replace code blocks in originalAssistantResponse with new content
    const modifiedResponse = originalAssistantResponse.replace(
        /<code filename="([^"]+)">\s*```ballerina([\s\S]*?)```[\s\S]*?<\/code>/g,
        (match, filename) => {
            if (fileContentMap.has(filename)) {
                const newContent = fileContentMap.get(filename);
                return `<code filename="${filename}">\n\`\`\`ballerina\n${newContent}\n\`\`\`\n</code>`;
            } else {
                // If no new content, keep the original
                return match;
            }
        }
    );

    return modifiedResponse;
}

interface BalModification {
    fileUri: string;
    moduleName: string;
}

async function setupProjectEnvironment(project: ProjectSource): Promise<{ langClient: any, tempDir: string } | null> {
    //TODO: Move this to LS
    const projectRoot = await getBallerinaProjectRoot();
    if (!projectRoot) {
        return null;
    }
    
    const randomNum = Math.floor(Math.random() * 90000) + 10000;
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `bal-proj-${randomNum}-`));
    fs.cpSync(projectRoot, tempDir, { recursive: true });
    //Copy project
    const langClient = StateMachine.langClient();
    //Apply edits
    for (const sourceFile of project.sourceFiles) {
        // Update lastUpdatedBalFile if it's a .bal file
        if (sourceFile.filePath.endsWith('.bal')) {
            const tempFilePath = path.join(tempDir, sourceFile.filePath);
            writeBallerinaFileDidOpen(tempFilePath, sourceFile.content);
        }
    }
    
    return { langClient, tempDir };
}

export function getProjectFromResponse(req: string): ProjectSource {
    const sourceFiles: SourceFile[] = [];
    const regex = /<code filename="([^"]+)">\s*```ballerina([\s\S]*?)```\s*<\/code>/g;
    let match;

    while ((match = regex.exec(req)) !== null) {
        const filePath = match[1];
        const fileContent = match[2].trim();
        sourceFiles.push({ filePath, content: fileContent });
    }

    return { sourceFiles };
}

async function removeUnusedImports(diagnosticsResult: Diagnostics[]): Promise<boolean> {
    let modifications: BalModification[] = [];
    let projectModified = false;

    for (const diagnostic of diagnosticsResult) {
        const fielUri = diagnostic.uri;

        for (const diag of diagnostic.diagnostics) {
            //unused module prefix 'redis'
            if (diag.code !== "BCE2002") {
                continue;
            }
            const module = getContentInsideQuotes(diag.message);
            modifications.push({ fileUri: fielUri, moduleName: module });
        }
    }

    for (const mod of modifications) {
        const fileUri = mod.fileUri;
        const moduleName = mod.moduleName;

        const document = await workspace.openTextDocument(Uri.parse(fileUri));
        const content = document.getText();
        const lines = content.split('\n');

        // Create a regex to match the import statement of the unused module
        const importRegex = new RegExp(`^import\\s+.*\\b${moduleName}\\b.*;`);

        // Filter out the import statement
        const updatedLines = lines.filter(line => !importRegex.test(line));

        const updatedContent = updatedLines.join('\n');
        await modifyFileContent({ filePath: Uri.parse(fileUri).fsPath, content: updatedContent });
        projectModified = true;
    }
    return projectModified;
}

async function addMissingImports(diagnosticsResult: Diagnostics[]): Promise<boolean> {
    let modifications: BalModification[] = [];
    let projectModified = false;
    for (const diagnostic of diagnosticsResult) {
        const fielUri = diagnostic.uri;
        for (const diag of diagnostic.diagnostics) {
            // undefined module 'io'(BCE2000)
            if (diag.code !== "BCE2000") {
                continue;
            }
            const module = getContentInsideQuotes(diag.message);
            if (module === null) {
                continue;
            }
            // Prevent duplicate entries
            if (!modifications.some(mod => mod.fileUri === fielUri && mod.moduleName === module)) {
                modifications.push({ fileUri: fielUri, moduleName: module });
            }
        }
    }
    //TODO: Replace with code acction
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
        } else if (moduleName == 'sql') {
            importStatement = `import ballerina/sql;\n`;
        } else if (moduleName == 'time') {
            importStatement = `import ballerina/time;\n`;
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
        if (file.endsWith('.bal') || file.toLowerCase() === "readme.md") {
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
