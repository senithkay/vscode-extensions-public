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
import { StateMachine, navigate, openView } from '../stateMachine';
import { COMMANDS } from '../constants';
import { EVENT_TYPE, MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { extension } from '../MIExtensionContext';
import { importCapp } from '../util/importCapp';

export function activateVisualizer(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.OPEN_PROJECT, () => {
            window.showOpenDialog({ canSelectFolders: true, canSelectFiles: true, filters: { 'CAPP': ['car', 'zip'] }, openLabel: 'Open MI Project' })
                .then(uri => {
                    if (uri && uri[0]) {
                        if (uri[0].fsPath.endsWith('.car') || uri[0].fsPath.endsWith('.zip')) {
                            window.showInformationMessage('A car file (CAPP) is selected.\n Do you want to extract it?', { modal: true }, 'Extract')
                                .then(option => {
                                    if (option === 'Extract') {
                                        window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, title: 'Select the location to extract the CAPP', openLabel: 'Select Folder' })
                                            .then(extractUri => {
                                                if (extractUri && extractUri[0]) {
                                                    importCapp({ source: uri[0].fsPath, directory: extractUri[0].fsPath, open: false });
                                                }
                                            });
                                    }
                                });
                        } else {
                            commands.executeCommand('vscode.openFolder', uri[0]);
                        }
                    }
                });
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.IMPORT_CAPP, () => {
            openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ImportProjectForm });
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.OPEN_WELCOME, () => {
            openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.Welcome });
        })
    );
    // Activate editor/title items
    context.subscriptions.push(
        commands.registerCommand(COMMANDS.SHOW_GRAPHICAL_VIEW, async (file: vscode.Uri | string) => {
            if (typeof file !== 'string') {
                file = file.fsPath;
            }
            navigate({ location: { view: null, documentUri: file } });
        })
    );

    context.subscriptions.push(
        commands.registerCommand(COMMANDS.SHOW_OVERVIEW, async () => {
            const projectType: string | undefined = extension.context.workspaceState.get('projectType');
            switch (projectType) {
                case 'miProject':
                    openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.Overview });
                    break;
                case 'oldProject':
                    const displayState: boolean | undefined = extension.context.workspaceState.get('displayOverview');
                    const displayOverview = displayState === undefined ? true : displayState;
                    openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.UnsupportedProject, customProps: { displayOverview } });
                    break;
            }
        })
    );

    StateMachine.service().onTransition((state) => {
        if (state.event.viewLocation?.view) {
            const documentUri = state.event.viewLocation?.documentUri?.toLowerCase();
            commands.executeCommand('setContext', 'showGoToSource', documentUri?.endsWith('.xml') || documentUri?.endsWith('.ts') || documentUri?.endsWith('.dbs'));
        }
    });
}
