/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    sendTelemetryEvent, sendTelemetryException, TM_EVENT_PASTE_AS_RECORD, CMP_XML_TO_RECORD,
} from "../../telemetry";
import { commands, window, env } from "vscode";
import { ballerinaExtInstance, DIAGNOSTIC_SEVERITY, XMLToRecordResponse } from "../../core";
import { PALETTE_COMMANDS, MESSAGES } from "./cmd-runner";
import { isSupportedSLVersion } from "../../utils";

const MSG_NOT_SUPPORT = "Paste XML as a Ballerina record feature is not supported";

export function activatePasteXMLAsRecord() {

    if (!ballerinaExtInstance.langClient) {
        return;
    }

    commands.registerCommand(PALETTE_COMMANDS.PASTE_XML_AS_RECORD, () => {
        // This command is only available since Swan Lake Update 7 patch 2
        if (!isSupportedSLVersion(ballerinaExtInstance, 220172)) {
            window.showErrorMessage(`${MSG_NOT_SUPPORT} in ${ballerinaExtInstance.ballerinaVersion}`);
            return;
        }
        if (!window.activeTextEditor || !window.activeTextEditor?.document.fileName.endsWith('.bal')) {
            window.showErrorMessage("Target is not a Ballerina file!");
            return;
        }
        sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_PASTE_AS_RECORD, CMP_XML_TO_RECORD);
        env.clipboard.readText()
            .then(clipboardText => {
                if (!ballerinaExtInstance.langClient) {
                    window.showErrorMessage("Ballerina language client not found.");
                    return;
                }
                ballerinaExtInstance.langClient.convertXMLToRecord({
                    xmlValue: clipboardText,
                    isClosed: false,
                    isRecordTypeDesc: false,
                    forceFormatRecordFields: false

                })
                    .then(lSResponse => {
                        const response = lSResponse as XMLToRecordResponse;
                        if (!response) {
                            window.showErrorMessage(MESSAGES.INVALID_XML_RESPONSE);
                            return;
                        }
                        // Check undefined diagnostics for when older SDK is used which does not send diagnostics in response.
                        if (response.diagnostics === undefined && (response.codeBlock === undefined || response.codeBlock === "")) {
                            window.showErrorMessage(MESSAGES.INVALID_XML);
                            return;
                        }
                        if (response.diagnostics !== undefined) {
                            for (const diagnostic of response.diagnostics) {
                                if (diagnostic.severity === undefined || diagnostic.severity === DIAGNOSTIC_SEVERITY.ERROR) {
                                    window.showErrorMessage(diagnostic.message);
                                } else if (diagnostic.severity === DIAGNOSTIC_SEVERITY.WARNING) {
                                    window.showWarningMessage(diagnostic.message);
                                } else {
                                    window.showInformationMessage(diagnostic.message);
                                }
                            }
                        }
                        const codeBlock = response.codeBlock;
                        const editor = window.activeTextEditor;
                        editor?.edit(editBuilder => {
                            if (editor.selection.isEmpty) {
                                const startPosition = editor.selection.active;
                                editBuilder.insert(startPosition, codeBlock);
                            } else {
                                editBuilder.replace(editor.selection, codeBlock);
                            }
                        });
                        error => {
                            window.showErrorMessage(error.message);
                            sendTelemetryException(ballerinaExtInstance, error, CMP_XML_TO_RECORD);
                        };
                    });
            },
                error => {
                    window.showErrorMessage(error.message);
                    sendTelemetryException(ballerinaExtInstance, error, CMP_XML_TO_RECORD);
                });
    });
}
