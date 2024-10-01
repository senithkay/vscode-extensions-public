/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { commands, window } from 'vscode';
import { StateMachine, openView } from '../stateMachine';
import { COMMANDS } from '../constants';
import { EVENT_TYPE, MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { extension } from '../MIExtensionContext';
import { getViewCommand } from '../project-explorer/project-explorer-provider';
import { log } from '../util/logger';
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
        commands.registerCommand(COMMANDS.SHOW_GRAPHICAL_VIEW, async (file: vscode.Uri) => {
            extension.webviewReveal = true;

            const langClient = StateMachine.context().langClient;
            const projectUri = StateMachine.context().projectUri;

            if (!langClient || !projectUri) {
                const errorMsg = 'The extension is still initializing. Please wait a moment and try again.';
                vscode.window.showErrorMessage(errorMsg);
                log(errorMsg);
                return;
            }

            const { directoryMap } = await langClient.getProjectStructure(projectUri);
            const artifacts = directoryMap.src.main.wso2mi.artifacts;
            for (const artifactType in artifacts) {
                const selectedArtifact = artifacts[artifactType].find(
                    (artifact: any) => path.relative(artifact.path, file.fsPath).length === 0
                );
                if (selectedArtifact) {
                    switch (selectedArtifact.type) {
                        case 'API':
                            openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ServiceDesigner, documentUri: file.fsPath });
                            return;
                        case 'ENDPOINT':
                            await vscode.commands.executeCommand(getViewCommand(selectedArtifact.subType), file, 'endpoint', undefined, false);
                            return;
                        case 'SEQUENCE':
                            await vscode.commands.executeCommand(COMMANDS.SHOW_SEQUENCE_VIEW, file, undefined, false);
                            return;
                        case 'MESSAGE_PROCESSOR':
                            await vscode.commands.executeCommand(COMMANDS.SHOW_MESSAGE_PROCESSOR, file, undefined, false);
                            return;
                        case 'PROXY_SERVICE':
                            await vscode.commands.executeCommand(COMMANDS.SHOW_PROXY_VIEW, file, undefined, false);
                            return;
                        case 'TEMPLATE':
                            await vscode.commands.executeCommand(getViewCommand(selectedArtifact.subType), file, 'template', undefined, false);
                            return;
                        case 'TASK':
                            await vscode.commands.executeCommand(COMMANDS.SHOW_TASK, file, undefined, false);
                            return;
                        case 'INBOUND_ENDPOINT':
                            await vscode.commands.executeCommand(COMMANDS.SHOW_INBOUND_ENDPOINT, file, undefined, false);
                            return;
                        case 'MESSAGE_STORE':
                            await vscode.commands.executeCommand(COMMANDS.SHOW_MESSAGE_STORE, file, undefined, false);
                            return;
                        case 'LOCAL_ENTRY':
                            await vscode.commands.executeCommand(COMMANDS.SHOW_LOCAL_ENTRY, file, undefined, false);
                            return;
                        case 'DATA_SOURCE':
                            await vscode.commands.executeCommand(COMMANDS.SHOW_DATA_SOURCE, file, undefined, false);
                            return;
                        case 'DATA_SERVICE':
                            openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.DSSServiceDesigner, documentUri: file.fsPath });
                            return;
                    }
                }
            }
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
            commands.executeCommand('setContext', 'showGoToSource', documentUri?.endsWith('.xml') || documentUri?.endsWith('.ts'));
        }
    });
}
