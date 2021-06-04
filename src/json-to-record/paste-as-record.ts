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

import { read } from "clipboardy";
import { BallerinaExtension } from "../core";
import { window } from "vscode";
import { CMP_JSON_TO_RECORD, sendTelemetryException } from "../telemetry";

export function pasteAsRecord(balExtension: BallerinaExtension) {
    read().then(clipboardText => {
        balExtension.langClient!.getRecordsForJson(clipboardText)
        .then(response => {
            if (!response || response.codeBlock === "") {
                window.showErrorMessage("Invalid JSON string");
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
            sendTelemetryException(balExtension, error, CMP_JSON_TO_RECORD);
        });
    }).catch(error => {
        window.showErrorMessage(error.message);
        sendTelemetryException(balExtension, error, CMP_JSON_TO_RECORD);
    });   
}
