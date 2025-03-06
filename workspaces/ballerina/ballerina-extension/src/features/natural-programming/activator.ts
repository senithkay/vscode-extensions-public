/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import vscode from 'vscode';
import { ENABLE_NATURAL_PROGRAMMING } from "../../core/preferences";
import { debounce } from 'lodash';
import { StateMachine } from "../../stateMachine";
import { getLLMDiagnostics } from "./utils";
import { NLCodeActionProvider, showTextOptions } from './nl-code-action-provider';
import { BallerinaExtension } from 'src/core';
import { PROGRESS_BAR_MESSAGE, WARNING_MESSAGE, WARNING_MESSAGE_DEFAULT } from './constants';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(ballerinaExtInstance: BallerinaExtension) {
    const naturalLanguageConfig = vscode.workspace.getConfiguration().get<boolean>(ENABLE_NATURAL_PROGRAMMING);

    // Create diagnostic collection and register it
    diagnosticCollection = vscode.languages.createDiagnosticCollection('ballerina');
    ballerinaExtInstance.context.subscriptions.push(diagnosticCollection);

    const projectPath = StateMachine.context().projectUri;
    if (naturalLanguageConfig) {
        if (!ballerinaExtInstance.context || projectPath == null || projectPath == "") {
            return;
        }

        vscode.workspace.onDidChangeTextDocument(async event => {
            debouncedGetLLMDiagnostics();
        }, null, ballerinaExtInstance.context.subscriptions);

        vscode.workspace.onDidDeleteFiles(async event => {
            debouncedGetLLMDiagnostics();
        }, null, ballerinaExtInstance.context.subscriptions);

        vscode.workspace.onDidOpenTextDocument(async event => {
            debouncedGetLLMDiagnostics();
        }, null, ballerinaExtInstance.context.subscriptions);
    }

    // Register Code Action Provider after diagnostics setup
    ballerinaExtInstance.context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('ballerina', new NLCodeActionProvider(), {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
        })
    );

    ballerinaExtInstance.context.subscriptions.push(showTextOptions);

    vscode.commands.registerCommand("kolab.verifyDocs", async (...args: any[]) => {    
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: PROGRESS_BAR_MESSAGE,
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

    // Set up debounced diagnostics and event listeners
    const debouncedGetLLMDiagnostics = debounce(async () => {
        const result: number|null = await getLLMDiagnostics(projectPath, diagnosticCollection);
        if (result == null) {
            return;
        }

        if (result > 400 && result < 500) {
            vscode.window.showWarningMessage(WARNING_MESSAGE);
            return;
        }
        vscode.window.showWarningMessage(WARNING_MESSAGE_DEFAULT);
    }, 5000);
}
