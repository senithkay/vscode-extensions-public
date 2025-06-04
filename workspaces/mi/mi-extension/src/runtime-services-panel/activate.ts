/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { RuntimeServicesWebview } from './webview';
import { COMMANDS } from '../constants';
import { askForProject } from '../util/workspace';

export function activateRuntimeService(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.OPEN_RUNTIME_VIEW, async (projectUri: string) => {
            if (!projectUri) {
                projectUri = await askForProject();
            }
            openRuntimeServicesWebview(projectUri);
        })
    );
}

export function openRuntimeServicesWebview(projectUri: string) {
    if (!RuntimeServicesWebview.webviews.has(projectUri)) {
        const webview = new RuntimeServicesWebview(projectUri);
        RuntimeServicesWebview.webviews.set(projectUri, webview);
    } else {
        const webview = RuntimeServicesWebview.webviews.get(projectUri);
        if (webview) {
            webview.getWebview()?.reveal();
        }
    }
}
