/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */


import { Uri, Webview, commands, window } from "vscode";

export function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
    if (process.env.WEB_VIEW_DEV_MODE === "true") {
        return new URL(pathList[pathList.length - 1], process.env.WEB_VIEW_DEV_HOST as string).href;
    }
    return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

export function checkDocumentContext(documentText?: string, fileName?: string) {
    if (documentText && fileName) {
        if (fileName.endsWith('.txt') || fileName.endsWith('.hl7')) {
            const firstLine = documentText.split('\n')[0];
            const isHL7v2 = /^MSH\|([\^~\\&\s,.\w#-]*\|){10}2/.test(firstLine);
            commands.executeCommand('setContext', 'isHL7v2', isHL7v2);
            commands.executeCommand('setContext', 'isCDA', false);
            commands.executeCommand('setContext', 'webViewEditorFocus', false);
        } else if (fileName.endsWith('.xml')) {
            const fileContent = documentText;
            const isCDA = fileContent.includes('<ClinicalDocument');
            commands.executeCommand('setContext', 'isCDA', isCDA);
            commands.executeCommand('setContext', 'isHL7v2', false);
            commands.executeCommand('setContext', 'webViewEditorFocus', false);
        } else {
            commands.executeCommand('setContext', 'isCDA', false);
            commands.executeCommand('setContext', 'isHL7v2', false);
        }
    } else {
        commands.executeCommand('setContext', 'isCDA', false);
        commands.executeCommand('setContext', 'isHL7v2', false);
    }
}

export function setWebViewActiveContext(value: boolean) {
    if (value){
        commands.executeCommand('setContext', 'isCDA', false);
        commands.executeCommand('setContext', 'isHL7v2', false);
    }
    else{
        checkDocumentContext(
            window.activeTextEditor?.document.getText(),
            window.activeTextEditor?.document.fileName,
        );
    }
    commands.executeCommand('setContext', 'webViewEditorFocus', value);
}
