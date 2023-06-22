/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { ballerinaExtInstance } from "../../core";
import { commands, OutputChannel, Uri, window } from "vscode";
import { TM_EVENT_PROJECT_RUN_FAST, CMP_PROJECT_RUN, sendTelemetryEvent, sendTelemetryException } from "../../telemetry";
import { PROJECT_TYPE, PALETTE_COMMANDS } from "./cmd-runner";
import { getCurrentBallerinaProject, getCurrentBallerinaFile } from "../../utils/project-utils";
import { configGenerator } from '../../config-generator/configGenerator';

export default class OutputLinkProvider implements vscode.DocumentLinkProvider {
    provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
        if (document.lineCount <= 0) {
            return [];
        }
        return [new vscode.DocumentLink(new vscode.Range(0, 18, 0, 33), Uri.parse("command:ballerina.project.stop"))];
    }
}

function activateRunCommand() {
    vscode.languages.registerDocumentLinkProvider({ language: "x-ballerina-output-log" }, new OutputLinkProvider());
    const outputChannel = vscode.window.createOutputChannel("Ballerina Output", "x-ballerina-output-log");

    commands.registerCommand(PALETTE_COMMANDS.RUN, async (filePath: Uri) => {
        configGenerator(ballerinaExtInstance, filePath ? filePath.toString() : "");
        return;
    });

    commands.registerCommand(PALETTE_COMMANDS.RUN_FAST, async () => {
        try {
            runFast(outputChannel);
        } catch (error) {
            if (error instanceof Error) {
                sendTelemetryException(ballerinaExtInstance, error, CMP_PROJECT_RUN);
                window.showErrorMessage(error.message);
            } else {
                window.showErrorMessage("Unknown error occurred.");
            }
        }
    });

    commands.registerCommand(PALETTE_COMMANDS.STOP, async () => {
        ballerinaExtInstance.langClient.executeCommand({ command: "STOP", arguments: [{ key: "path", value: await getCurrentRoot() }] });
    });

    const langClient = ballerinaExtInstance.langClient;
    langClient.onNotification('$/logTrace', (params: any) => {
        if (params.verbose === "stopped") {
            outputChannel.appendLine("");
            outputChannel.append("Stopped.");
        } else {
            outputChannel.append(params.message);
        }
    });
}

async function runFast(outputChannel: OutputChannel) {
    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_PROJECT_RUN_FAST, CMP_PROJECT_RUN);
    if (window.activeTextEditor && window.activeTextEditor.document.isDirty) {
        await commands.executeCommand(PALETTE_COMMANDS.SAVE_ALL);
    }
    const langClient = ballerinaExtInstance.langClient;
    const textEditor = window.activeTextEditor;
    outputChannel.show();
    if (textEditor) {
        window.showTextDocument(textEditor.document);
    }
    const didRun = await langClient.executeCommand({ command: "RUN", arguments: [{ key: "path", value: await getCurrentRoot() }] });
    outputChannel.clear();
    if (didRun) {
        outputChannel.appendLine("Started. Execute 'Ballerina: Stop' command to stop the process.\n");
    } else {
        outputChannel.appendLine("Running failed.");
    }
}

async function getCurrentRoot() {
    const file = getCurrentBallerinaFile();
    const currentProject = await getCurrentBallerinaProject(file);
    return (currentProject.kind !== PROJECT_TYPE.SINGLE_FILE) ? currentProject.path! : file;
}

export { activateRunCommand };
