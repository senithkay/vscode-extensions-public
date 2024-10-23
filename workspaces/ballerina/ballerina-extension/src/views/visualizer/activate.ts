/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { PALETTE_COMMANDS } from '../../features/project/cmds/cmd-runner';
import { StateMachine, openView } from '../../stateMachine';
import { extension } from '../../BalExtensionContext';
import { BI_COMMANDS, EVENT_TYPE, MACHINE_VIEW, SHARED_COMMANDS } from '@wso2-enterprise/ballerina-core';
import { ViewColumn } from 'vscode';
import { ballerinaExtInstance } from '../../core';
import { isSupportedSLVersion } from '../../utils';

export function activateSubscriptions() {
    const context = extension.context;
    context.subscriptions.push(
        vscode.commands.registerCommand(PALETTE_COMMANDS.SHOW_SOURCE, () => {
            const path = StateMachine.context().documentUri;
            if (!path) {
                return;
            }
            vscode.window.showTextDocument(vscode.Uri.file(path), { viewColumn: ViewColumn.Beside });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(PALETTE_COMMANDS.SHOW_ENTITY_DIAGRAM, (path, selectedRecord = "") => {
            openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ERDiagram, documentUri: path?.fsPath || vscode.window.activeTextEditor.document.uri.fsPath, identifier: selectedRecord });
        })
    );


    // <------------- Shared Commands ------------>
    context.subscriptions.push(
        vscode.commands.registerCommand(SHARED_COMMANDS.SHOW_VISUALIZER, (path: vscode.Uri, position) => {
            openView(EVENT_TYPE.OPEN_VIEW, { documentUri: path?.fsPath || vscode.window.activeTextEditor?.document.uri.fsPath, position: position });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(SHARED_COMMANDS.OPEN_BI_WELCOME, () => {
            if (StateMachine.langClient() && ballerinaExtInstance && isSupportedSLVersion(ballerinaExtInstance, 2201100)) {
                openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.BIWelcome });
            } else {
                openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.SetupView });
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(BI_COMMANDS.OPEN_TYPE_DIAGRAM, () => {
            openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.TypeDiagram });
        })
    );


    StateMachine.service().onTransition((state) => {
        vscode.commands.executeCommand('setContext', 'showBalGoToSource', state.context?.documentUri !== undefined);
    });

}
