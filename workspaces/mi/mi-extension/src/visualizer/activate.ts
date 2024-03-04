/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { commands, window } from 'vscode';
import { StateMachine } from '../stateMachine';
import { COMMANDS } from '../constants';

export function activateVisualizer(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.OPEN_PROJECT, () => {
            window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, openLabel: 'Open MI Project' })
                .then(uri => {
                    if (uri && uri[0]) {
                        commands.executeCommand('vscode.openFolder', uri[0]);
                    }
                });
        })
    );
    StateMachine.service().onTransition((state) => {
        if (state.event.viewLocation?.view) {
            commands.executeCommand('setContext', 'showGoToSource', state.event.viewLocation?.documentUri !== undefined);
        }
    });
}
