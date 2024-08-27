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
    BallerinaDiagnosticsRequest,
    BallerinaDiagnosticsResponse,
    CommandResponse,
    CommandsRequest,
    CommandsResponse,
    CommonRPCAPI,
    Completion,
    CompletionParams,
    DiagnosticData,
    GoToSourceRequest,
    ProjectDirResponse,
    RunExternalCommandRequest,
    RunExternalCommandResponse,
    SyntaxTree,
    TypeResponse,
    WorkspaceFileRequest,
    WorkspacesFileResponse
} from "@wso2-enterprise/ballerina-core";
import child_process from 'child_process';
import * as os from 'os';
import { Uri, commands, window, workspace } from "vscode";
import { URI } from "vscode-uri";
import { StateMachine } from "../../stateMachine";
import { goToSource } from "../../utils";
import { getUpdatedSource } from "./utils";

export class CommonRpcManager implements CommonRPCAPI {
    async getTypes(): Promise<TypeResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            const completionParams: CompletionParams = {
                textDocument: {
                    uri: Uri.file(context.documentUri!).toString()
                },
                context: {
                    triggerKind: 25,
                },
                position: {
                    character: 0,
                    line: 0
                }
            };

            const completions: Completion[] = await StateMachine.langClient().getCompletion(completionParams);
            const filteredCompletions: Completion[] = completions.filter(value => value.kind === 25 || value.kind === 23 || value.kind === 22);
            resolve({ data: filteredCompletions });
        });
    }

    async goToSource(params: GoToSourceRequest): Promise<void> {
        const context = StateMachine.context();
        goToSource(params.position, context.documentUri!);
    }

    async getWorkspaceFiles(params: WorkspaceFileRequest): Promise<WorkspacesFileResponse> {
        // Get the workspace files form vscode workspace
        const files = [];
        // Get workspace path
        const workspaceRoot = workspace.workspaceFolders![0].uri.fsPath;
        const workspaceFiles = params.glob ? await workspace.findFiles(params.glob) : await workspace.findFiles('**/*.bal', '**/*test.bal');
        workspaceFiles.forEach(file => {
            // Push the file path relative to the workspace root without the leading slash
            files.push({ relativePath: file.fsPath.replace(workspaceRoot, '').substring(1), path: file.fsPath });
        });
        return { files, workspaceRoot };
    }

    async getBallerinaDiagnostics(params: BallerinaDiagnosticsRequest): Promise<BallerinaDiagnosticsResponse> {
        return new Promise(async (resolve) => {
            // Get the current working document Uri
            const documentUri = URI.file(StateMachine.context().documentUri).toString();

            const fullST = await StateMachine.langClient().getSyntaxTree({
                documentIdentifier: { uri: documentUri }
            }) as SyntaxTree;

            const currentSource = fullST.syntaxTree.source;

            // Get the updated source when applied to the current source
            const updatedSource = getUpdatedSource(params.ballerinaSource, currentSource, params.targetPosition, params.skipSemiColon);
            if (updatedSource) {
                // Send the didChange event with new changes
                StateMachine.langClient().didChange({
                    contentChanges: [
                        {
                            text: updatedSource
                        }
                    ],
                    textDocument: {
                        uri: documentUri,
                        version: 1
                    }
                });

                // Get any diagnostics
                const diagResp = await StateMachine.langClient().getDiagnostics({
                    documentIdentifier: {
                        uri: documentUri,
                    }
                }) as DiagnosticData[];

                // Revert the changes back to the original
                StateMachine.langClient().didChange({
                    contentChanges: [
                        {
                            text: currentSource
                        }
                    ],
                    textDocument: {
                        uri: documentUri,
                        version: 1
                    }
                });

                const response = {
                    diagnostics: params.checkSeverity ?
                        diagResp[0]?.diagnostics.filter(diag => diag.severity === params.checkSeverity) || [] :
                        diagResp[0]?.diagnostics || []
                } as BallerinaDiagnosticsResponse;
                resolve(response);

            }
        });
    }

    async executeCommand(params: CommandsRequest): Promise<CommandsResponse> {
        return new Promise(async (resolve) => {
            if (params.commands.length >= 1) {
                const cmdArgs = params.commands.length > 1 ? params.commands.slice(1) : [];
                await commands.executeCommand(params.commands[0], ...cmdArgs);
                resolve({ data: "SUCCESS" });
            }
        });
    }

    async askProjectDirPath(): Promise<ProjectDirResponse> {
        return new Promise(async (resolve) => {
            const selectedDir = await askProjectPath();
            if (!selectedDir || selectedDir.length === 0) {
                window.showErrorMessage('A folder must be selected to create project');
                resolve({ path: "" });
            } else {
                const parentDir = selectedDir[0].fsPath;
                resolve({ path: parentDir });
            }
        });
    }

    async runBackgroundTerminalCommand(params: RunExternalCommandRequest): Promise<RunExternalCommandResponse> {
        return new Promise<CommandResponse>(function (resolve) {
            child_process.exec(`${params.command}`, async (err, stdout, stderr) => {
                if (err) {
                    resolve({
                        error: true,
                        message: stderr
                    });
                } else {
                    resolve({
                        error: false,
                        message: stdout
                    });
                }
            });
        });
    }
}

async function askProjectPath() {
    return await window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        defaultUri: Uri.file(os.homedir()),
        title: "Select a folder to create the Project"
    });
}
