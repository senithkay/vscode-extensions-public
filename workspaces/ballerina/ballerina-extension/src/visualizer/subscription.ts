/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { openView } from './activator';
import { PALETTE_COMMANDS } from '../project/cmds/cmd-runner';

export function activateSubscriptions(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(PALETTE_COMMANDS.SHOW_DIAGRAM, () => {
            openView({view: 'Overview'});
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(PALETTE_COMMANDS.SHOW_ARCHITECTURE_VIEW, () => {
            openView({view: 'Architecture'});
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(PALETTE_COMMANDS.SHOW_SERVICE_DESIGNER_VIEW, () => {
            openView({view: 'ServiceDesigner'});
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(PALETTE_COMMANDS.SHOW_ENTITY_DIAGRAM, () => {
            openView({ view: 'ER'});
        })
    );
}