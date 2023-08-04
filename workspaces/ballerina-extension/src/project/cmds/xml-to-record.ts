/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    sendTelemetryEvent, sendTelemetryException, TM_EVENT_PASTE_AS_RECORD, CMP_JSON_TO_RECORD,
} from "../../telemetry";
import { commands, window, env } from "vscode";
import { ballerinaExtInstance, JsonToRecordResponse, DIAGNOSTIC_SEVERITY } from "../../core";
import { PALETTE_COMMANDS, MESSAGES } from "./cmd-runner";
import { xml2json } from 'xml-js';
import { forEach } from "lodash";

const MSG_NOT_SUPPORT = "Paste XML as a Ballerina record feature is not supported";

export function activatePasteXMLAsRecord() {

    if (!ballerinaExtInstance.langClient) {
        return;
    }

    commands.registerCommand(PALETTE_COMMANDS.PASTE_XML_AS_RECORD, () => {
        // This command is only available since Swan Lake Beta 2
        // Check the version before registering the command
        const balVersion = ballerinaExtInstance.ballerinaVersion.toLowerCase();
        if (!balVersion.includes("alpha") && !balVersion.includes("preview")) {
            if (balVersion.includes("beta")) {
                // check if SL Beta version >= 2
                const digits = ballerinaExtInstance.ballerinaVersion.replace(/[^0-9]/g, "");
                const versionNumber = +digits;
                if (versionNumber < 2) {
                    window.showErrorMessage(`${MSG_NOT_SUPPORT} in ${ballerinaExtInstance.ballerinaVersion}`);
                    return;
                }
            }
        } else {
            window.showErrorMessage(`${MSG_NOT_SUPPORT} in ${ballerinaExtInstance.ballerinaVersion}`);
            return;
        }
        if (!window.activeTextEditor || !window.activeTextEditor?.document.fileName.endsWith('.bal')) {
            window.showErrorMessage("Target is not a Ballerina file!");
            return;
        }
        sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_PASTE_AS_RECORD, CMP_JSON_TO_RECORD);
        env.clipboard.readText()
            .then(clipboardText => {
                if (!ballerinaExtInstance.langClient) {
                    window.showErrorMessage("Ballerina language client not found.");
                    return;
                }
                const xmlJson: XMLJson = simplifyJSON(xml2json(clipboardText, { compact: true, spaces: 4 }));
                ballerinaExtInstance.langClient!.convertJsonToRecord({
                    jsonString: xmlJson.xmlJson,
                    isClosed: false,
                    isRecordTypeDesc: false,
                    recordName: xmlJson.recordName,
                    forceFormatRecordFields: false,

                })
                    .then(lSResponse => {
                        const response = lSResponse as JsonToRecordResponse;
                        if (!response) {
                            window.showErrorMessage(MESSAGES.INVALID_JSON_RESPONSE);
                            return;
                        }
                        // Check undefined diagnostics for when older SDK is used which does not send diagnostics in response.
                        if (response.diagnostics === undefined && (response.codeBlock === undefined || response.codeBlock === "")) {
                            window.showErrorMessage(MESSAGES.INVALID_JSON);
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

interface XMLJson {
    recordName: string;
    xmlJson: any;
}



export function simplifyJSON(xmlJson: any): XMLJson {
    const xmlJsonObj = JSON.parse(xmlJson);
    const xmlJsonObjKeys = Object.keys(xmlJsonObj);
    const subJson = xmlJsonObj[xmlJsonObjKeys[0]];
    // recursively iterate through the subJson and convert objects with _text to string
    const iterate = (obj: any) => {
        forEach(obj, (value, key) => {
            // if value has an attribute _text, convert it to string
            // else if value is an object iterate through it
            if (value._text) {
                obj[key] = value._text;
            }
            else if (typeof value === 'object') {
                iterate(value);
            }
        });
    };
    iterate(subJson);
    return {
        recordName: xmlJsonObjKeys[0],
        xmlJson: JSON.stringify(subJson)
    };
}