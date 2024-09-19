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
    ErrorCode,
    GenerateMappingsRequest,
    GenerateMappingsResponse,
    NotifyAIMappingsRequest,
    STModification,
    SyntaxTree
} from "@wso2-enterprise/ballerina-core";
import { ModulePart, RequiredParam, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import * as crypto from 'crypto';
import * as fs from 'fs';
import path from "path";
import { Uri, window, workspace } from 'vscode';

import { extension } from "../../BalExtensionContext";
import { StateMachine, updateView } from "../../stateMachine";
import { StateMachineAI } from '../../views/ai-panel/aiMachine';
import { constructRecord, getDatamapperCode, getFunction, getParamDefinitions, handleLogin, handleStop, isErrorCode, isLoggedin, notifyNoGeneratedMappings, refreshAccessToken } from "./utils";
import { MODIFIYING_ERROR, PARSING_ERROR, UNAUTHORIZED, UNKNOWN_ERROR } from "../../views/ai-panel/errorCodes";
import { NOT_SUPPORTED } from "../../core";
import { modifyFileContent } from "../../utils/modification";

export let hasStopped: boolean = false;

export class AiPanelRpcManager implements AIPanelAPI {
    async getBackendURL(): Promise<string> {
        return new Promise(async (resolve) => {
            const config = workspace.getConfiguration('ballerina');
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
        // ADD YOUR IMPLEMENTATION HERE
        console.log("Implementing addToProject");

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

        const mainBalPath = path.join(workspaceFolderPath, 'main.bal');
        if (fs.existsSync(mainBalPath)) {
            // main.bal exists, check its content
            const mainBalContent = fs.readFileSync(mainBalPath, 'utf8');
            const balNewContent = `import ballerina/io;

public function main() {
    io:println("Hello, World!");
}`;
            if (mainBalContent.includes(balNewContent)) {
                // Replace the content with the new content from the req
                fs.writeFileSync(mainBalPath, req.content.trim());
            } else {
                // Create a new file called generated.bal and add the content there
                const generatedBalPath = path.join(workspaceFolderPath, 'generated.bal');
                fs.writeFileSync(generatedBalPath, req.content.trim());
            }
        } else {
            // Create a new file called generated.bal and add the content there
            const generatedBalPath = path.join(workspaceFolderPath, 'generated.bal');
            fs.writeFileSync(generatedBalPath, req.content.trim());
        }
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
}
