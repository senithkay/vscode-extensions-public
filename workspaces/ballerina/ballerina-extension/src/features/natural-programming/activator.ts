/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import vscode from 'vscode';
import { ENABLE_BACKGROUND_DRIFT_CHECK } from "../../core/preferences";
import { debounce } from 'lodash';
import { StateMachine } from "../../stateMachine";
import { addDefaultModelConfigForNaturalFunctions, getBackendURL, 
    getLLMDiagnostics, getTokenForNaturalFunction, getVsCodeRootPath } from "./utils";
import { NLCodeActionProvider, showTextOptions } from './nl-code-action-provider';
import { BallerinaExtension } from 'src/core';
import { PROGRESS_BAR_MESSAGE_FOR_DRIFT, WARNING_MESSAGE, WARNING_MESSAGE_DEFAULT, MONITERED_EXTENSIONS,
    PROGRESS_BAR_MESSAGE_FOR_NP_TOKEN, WARNING_MESSAGE_FOR_NO_ACTIVE_PROJECT
 } from './constants';
 import { handleLogin } from "../../rpc-managers/ai-panel/utils";
import { BallerinaProject } from '@wso2-enterprise/ballerina-core';
import { getCurrentBallerinaProjectFromContext } from '../config-generator/configGenerator';
import path from 'path';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(ballerinaExtInstance: BallerinaExtension) {
    const backgroundDriftCheckConfig = vscode.workspace.getConfiguration().get<boolean>(ENABLE_BACKGROUND_DRIFT_CHECK);

    // Create diagnostic collection and register it
    diagnosticCollection = vscode.languages.createDiagnosticCollection('ballerina');
    ballerinaExtInstance.context.subscriptions.push(diagnosticCollection);

    const projectPath = StateMachine.context().projectUri;
    if (backgroundDriftCheckConfig) {
        if (!ballerinaExtInstance.context || projectPath == null || projectPath == "") {
            return;
        }

        const debouncedGetLLMDiagnostics = debounce(async () => {
            const result: number | null = await getLLMDiagnostics(projectPath, diagnosticCollection);
            if (result == null) {
                return;
            }
        
            if (result > 400 && result < 500) {
                vscode.window.showWarningMessage(WARNING_MESSAGE);
                return;
            }
            vscode.window.showWarningMessage(WARNING_MESSAGE_DEFAULT);
        }, 600000);
        
        vscode.workspace.onDidChangeTextDocument(async event => {
            const filePath = event.document.uri.fsPath; // Get the file path
            const fileExtension = filePath.substring(filePath.lastIndexOf('.')); // Extract the file extension
        
            // Check if the file extension is in the monitoredExtensions array
            if (MONITERED_EXTENSIONS.includes(fileExtension)) {
                debouncedGetLLMDiagnostics();
            }
        }, null, ballerinaExtInstance.context.subscriptions);
        
        vscode.workspace.onDidDeleteFiles(async event => {
            let isMoniteredFileGotDeleted = false;
            event.files.forEach(file => {
                const filePath = file.fsPath; // Get the file path
                const fileExtension = filePath.substring(filePath.lastIndexOf('.')); // Extract the file extension
        
                // Check if the file extension is in the monitoredExtensions array
                if (MONITERED_EXTENSIONS.includes(fileExtension)) {
                    isMoniteredFileGotDeleted = true;
                }
            });

            if (isMoniteredFileGotDeleted) {
                debouncedGetLLMDiagnostics();
            }
        }, null, ballerinaExtInstance.context.subscriptions);
    }

    // Register Code Action Provider after diagnostics setup
    ballerinaExtInstance.context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('ballerina', new NLCodeActionProvider(), {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
        })
    );

    ballerinaExtInstance.context.subscriptions.push(showTextOptions);

    vscode.commands.registerCommand("ballerina.verifyDocs", async (...args: any[]) => {    
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: PROGRESS_BAR_MESSAGE_FOR_DRIFT,
                cancellable: false,
            },
            async () => {
                const result: number|null = await getLLMDiagnostics(projectPath, diagnosticCollection);
                if (result == null) {
                    return;
                }

                if (result > 400 && result < 500) {
                    vscode.window.showWarningMessage(WARNING_MESSAGE);
                    return;
                }
                vscode.window.showWarningMessage(WARNING_MESSAGE_DEFAULT);
            }
        );
    });

    vscode.commands.registerCommand("ballerina.configureDefaultModelForNaturalFunctions", async (...args: any[]) => {
        const currentProject = ballerinaExtInstance.getDocumentContext().getCurrentProject();
        const activeTextEditor = vscode.window.activeTextEditor;
        let activeFilePath = "";
        let configPath = "";

        if (activeTextEditor) {
            activeFilePath = activeTextEditor.document.uri.fsPath;
        }

        if (currentProject == null &&  activeFilePath == "") {
            configPath = getVsCodeRootPath();
        } else {
            try {
                const currentBallerinaProject: BallerinaProject = await getCurrentBallerinaProjectFromContext(ballerinaExtInstance);

                if (!currentBallerinaProject) {
                    configPath = getVsCodeRootPath();
                } else {
                    if (currentBallerinaProject.kind == 'SINGLE_FILE_PROJECT') {
                        configPath = path.dirname(currentBallerinaProject.path);
                    } else {
                        configPath = currentBallerinaProject.path;
                    }
                    if (configPath == undefined && configPath == "") {
                        configPath = getVsCodeRootPath();
                    }
                }
            } catch (error) {
                configPath = getVsCodeRootPath();
            }
        }

        if (configPath == undefined || configPath == "") {
            vscode.window.showWarningMessage(WARNING_MESSAGE_FOR_NO_ACTIVE_PROJECT);
            return;
        }

        addConfigFile(configPath);
    });
}

async function addConfigFile(configPath: string) {
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: PROGRESS_BAR_MESSAGE_FOR_NP_TOKEN,
            cancellable: false,
        },
        async () => {
            try {
                const token: string = await getTokenForNaturalFunction();
                if (token == null) {
                    handleLogin();
                    return;
                }

                addDefaultModelConfigForNaturalFunctions(configPath, token, await getBackendURL());
            } catch (error) {
                handleLogin();
                return;
            }
        }
    );
}
