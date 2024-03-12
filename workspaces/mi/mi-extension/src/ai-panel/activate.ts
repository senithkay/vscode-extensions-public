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
import { AiPanelWebview } from './webview';

export function activateAiPanel(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.OPEN_AI_PANEL, () => {
            if (!AiPanelWebview.currentPanel) {
                AiPanelWebview.currentPanel = new AiPanelWebview();
            } else {
                AiPanelWebview.currentPanel!.getWebview()?.reveal();
            }
        })
    );
}
