/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

 import {
    sendTelemetryEvent,
    sendTelemetryException,
    TM_EVENT_PASTE_AS_RECORD,
    CMP_JSON_TO_RECORD,
} from "../../telemetry";
import { commands, window, env } from "vscode";
import { ballerinaExtInstance } from "../../core";
import { PALETTE_COMMANDS, MESSAGES } from "./cmd-runner";

export function activatePasteJsonAsRecord() {
    sendTelemetryEvent(
        ballerinaExtInstance,
        TM_EVENT_PASTE_AS_RECORD,
        CMP_JSON_TO_RECORD
    );

    if (!ballerinaExtInstance.langClient) {
        return;
    }

    // This command is only available since Swan Lake Beta 2
    // Check the version before registering the command
    if(
        ballerinaExtInstance.isSwanLake 
        && !ballerinaExtInstance.ballerinaVersion.includes("Alpha")
        && !ballerinaExtInstance.ballerinaVersion.includes("Preview")
    ) {
        // check if SL Beta version >= 2
        const digits = ballerinaExtInstance.ballerinaVersion.replace(/[^0-9]/g, "");
        const versionNumber = +digits;
        if (versionNumber < 2) {
            return;
        }
    } else {
        return;
    }

    

    commands.registerCommand(PALETTE_COMMANDS.PASTE_JSON_AS_RECORD, () => {
        if (!window.activeTextEditor || !window.activeTextEditor?.document.fileName.endsWith('.bal')) {
            window.showErrorMessage("Target is not a Ballerina file!");
            return;
        }
        env.clipboard.readText()
        .then(clipboardText => {
            ballerinaExtInstance.langClient!.getRecordsForJson(clipboardText)
            .then(response => {
                if (!response || response.codeBlock === "") {
                    window.showErrorMessage(MESSAGES.INVALID_JSON);
                    return;
                }
                const editor = window.activeTextEditor;
                editor?.edit(editBuilder => {
                    if (editor.selection.isEmpty) {
                        const startPosition = editor.selection.active;
                        editBuilder.insert(startPosition, response.codeBlock);
                    } else {
                        editBuilder.replace(editor.selection, response.codeBlock);
                    }
                });
            },
            error => {
                window.showErrorMessage(error.message);
                sendTelemetryException(ballerinaExtInstance, error, CMP_JSON_TO_RECORD);
            });
        },
        error => {
            window.showErrorMessage(error.message);
            sendTelemetryException(ballerinaExtInstance, error, CMP_JSON_TO_RECORD);
        }); 
    });
}
