import { read } from "clipboardy";
import { BallerinaExtension } from "../core";
import { window } from "vscode";
import { CMP_JSON_TO_RECORD, sendTelemetryException } from "../telemetry";

export function pasteAsRecord(balExtension: BallerinaExtension) {
    read().then(clipboardText => {
        balExtension.langClient!.getRecordsForJson(clipboardText)
        .then(response => {
            if(!response || response.codeBlock === "") {
                window.showErrorMessage("Invalid JSON string");
                return;
            }
            const editor = window.activeTextEditor;
            editor?.edit(editBuilder => {
                if(editor.selection.isEmpty) {
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