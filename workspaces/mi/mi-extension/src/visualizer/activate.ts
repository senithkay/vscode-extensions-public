/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { DiagramWebview } from './webview';

export function activateVisualizer(context: vscode.ExtensionContext) {
    if (!DiagramWebview.currentPanel) {
        DiagramWebview.currentPanel = new DiagramWebview();
    }

    context.subscriptions.push(
        vscode.commands.registerCommand('integrationStudio.showDiagram', () => {
            if (!DiagramWebview.currentPanel) {
                DiagramWebview.currentPanel = new DiagramWebview();
            }
            DiagramWebview.currentPanel!.getWebview()?.reveal();
        })
    );
}
