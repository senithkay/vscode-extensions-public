/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { PALETTE_COMMANDS } from '../project/cmds/cmd-runner';
import { openView } from '../stateMachine';
import { extension } from '../BalExtensionContext';

export function activateSubscriptions() {
    const context = extension.context;
    context.subscriptions.push(
        vscode.commands.registerCommand(PALETTE_COMMANDS.SHOW_DIAGRAM, (path, position) => {
            openView("OPEN_VIEW", { view: "Overview", documentUri: path, position: position });
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(PALETTE_COMMANDS.OPEN_IN_DIAGRAM, (path, position) => {
            openView("OPEN_VIEW", { view: "Overview", documentUri: path, position: position });
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(PALETTE_COMMANDS.SHOW_ARCHITECTURE_VIEW, () => {
            openView("OPEN_VIEW", { view: 'ArchitectureDiagram' });
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(PALETTE_COMMANDS.SHOW_SERVICE_DESIGNER_VIEW, (path, position) => {
            openView("OPEN_VIEW", { view: 'ServiceDesigner', documentUri: path || vscode.window.activeTextEditor.document.uri.fsPath, position: position });
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(PALETTE_COMMANDS.SHOW_ENTITY_DIAGRAM, () => {
            openView("OPEN_VIEW", { view: 'ERDiagram' });
        })
    );
}
