/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { SHARED_COMMANDS } from '@wso2-enterprise/ballerina-core';
import { StateMachineAI, openAIWebview } from './aiMachine';
import { AI_EVENT_TYPE, AI_MACHINE_VIEW, EVENT_TYPE } from '@wso2-enterprise/ballerina-core';
import { exchangeAuthCode } from './auth';
import { extension } from '../../BalExtensionContext';
import { BallerinaExtension } from '../../core';

export function activateAiPanel(ballerinaExtInstance: BallerinaExtension) {
    ballerinaExtInstance.context.subscriptions.push(
        vscode.commands.registerCommand(SHARED_COMMANDS.OPEN_AI_PANEL, (initialPrompt?: string) => {
            openAIWebview(initialPrompt);
        })
    );
    ballerinaExtInstance.context.subscriptions.push(
        vscode.commands.registerCommand(SHARED_COMMANDS.CLEAR_AI_PROMPT, () => {
            extension.initialPrompt = undefined;
        })
    );
    console.log("AI Panel activated");
}
