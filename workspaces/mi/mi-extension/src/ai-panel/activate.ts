/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { COMMANDS } from '../constants';
import { StateMachineAI, openAIWebview } from './aiMachine';
import { AI_EVENT_TYPE, AI_MACHINE_VIEW, EVENT_TYPE } from '@wso2-enterprise/mi-core';
import { exchangeAuthCode } from './auth';
import { extension } from '../MIExtensionContext';

interface FileObject {
    fileName: string;
    fileContent: string;
}

interface ImageObject {
    imageName: string;
    imageBase64: string;
}

interface PromptObject {
    aiPrompt: string;
    files: FileObject[];
    images: ImageObject[];
}

export function activateAiPanel(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.OPEN_AI_PANEL, (initialPrompt?: PromptObject) => {
            openAIWebview(initialPrompt);
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.CLEAR_AI_PROMPT, () => {
            extension.initialPrompt = undefined;
        })
    );

    vscode.window.registerUriHandler({
        handleUri(uri: vscode.Uri) {
            if (uri.path === '/signin') {
                console.log("Signin callback hit");
                const query = new URLSearchParams(uri.query);
                const code = query.get('code');
                console.log("Code: " + code);
                if (code) {
                    exchangeAuthCode(code);
                } else {
                    // Handle error here
                }
            }
        }
    });
}
