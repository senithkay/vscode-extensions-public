/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import * as vscode from 'vscode';
import { ballerinaExtInstance } from "../../core";
import { commands, OutputChannel, Uri, window } from "vscode";
import { TM_EVENT_PROJECT_RUN_FAST, CMP_PROJECT_RUN, sendTelemetryEvent, sendTelemetryException } from "../../telemetry";
import { PROJECT_TYPE, PALETTE_COMMANDS } from "./cmd-runner";
import { getCurrentBallerinaProject, getCurrentBallerinaFile } from "../../utils/project-utils";
import { openConfigEditor } from "../../config-editor/configEditorPanel";

export default class OutputLinkProvider implements vscode.DocumentLinkProvider {
    provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
        if (document.lineCount <= 0) {
            return [];
        }
        return [new vscode.DocumentLink(new vscode.Range(0, 18, 0, 33), Uri.parse("command:ballerina.project.stop"))];
    }
};

function activateRunCommand() {
    vscode.languages.registerDocumentLinkProvider({ language: "x-ballerina-output-log" }, new OutputLinkProvider());
    const outputChannel = vscode.window.createOutputChannel("Ballerina Output", "x-ballerina-output-log");

    commands.registerCommand(PALETTE_COMMANDS.RUN, async (filePath: Uri) => {
        if (ballerinaExtInstance.isConfigurableEditorEnabled() || ballerinaExtInstance.getDocumentContext().isActiveDiagram()) {
            openConfigEditor(ballerinaExtInstance, filePath ? filePath.toString() : "", false);
            return;
        }
        if (ballerinaExtInstance.enabledRunFast()) {
            commands.executeCommand(PALETTE_COMMANDS.RUN_FAST);
        } else {
            commands.executeCommand(PALETTE_COMMANDS.RUN_CMD);
        }
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
        ballerinaExtInstance.langClient.executeCommand({ command: "STOP", arguments: [{ key: "path", value : await getCurrentRoot() }]});
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
    const didRun = await langClient.executeCommand({ command: "RUN", arguments: [{ key: "path", value : await getCurrentRoot() }]});
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
