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
import { getStateMachine, navigate, openView, refreshUI } from '../stateMachine';
import { COMMANDS, REFRESH_ENABLED_DOCUMENTS, SWAGGER_LANG_ID, SWAGGER_REL_DIR } from '../constants';
import { EVENT_TYPE, MACHINE_VIEW, onDocumentSave } from '@wso2-enterprise/mi-core';
import { extension } from '../MIExtensionContext';
import { importCapp } from '../util/importCapp';
import { SELECTED_SERVER_PATH } from '../debugger/constants';
import { debounce } from 'lodash';
import path from 'path';
import { removeFromHistory } from '../history';
import { RPCLayer } from '../RPCLayer';
import { deleteSwagger, generateSwagger } from '../util/swagger';
import { VisualizerWebview, webviews } from './webview';
import * as fs from 'fs';
import { AiPanelWebview } from '../ai-panel/webview';

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
            let projectUri;
            if (typeof file !== 'string') {
                file = file.fsPath;
                projectUri = vscode.workspace.getWorkspaceFolder(file as any)?.uri.fsPath
            } else {
                projectUri = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(file))?.uri.fsPath;
            }
            if (!projectUri) {
                return;
            }
            navigate(projectUri, { location: { view: null, documentUri: file } });
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

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((event) => {
            // Check if the specific configuration key changed
            if (event.affectsConfiguration('MI.' + SELECTED_SERVER_PATH)) {
                // Show a prompt to restart the window
                vscode.window
                    .showInformationMessage(
                        'The workspace setting has changed. A window reload is required for changes to take effect.',
                        'Reload Window'
                    )
                    .then((selectedAction) => {
                        if (selectedAction === 'Reload Window') {
                            // Command to reload the window
                            vscode.commands.executeCommand('workbench.action.reloadWindow');
                        }
                    });
            }
        })
    );

    // Listen for pom changes and update dependencies
    context.subscriptions.push(
        // Handle the text change and diagram update with rpc notification
        vscode.workspace.onDidChangeTextDocument(async function (document) {
            const projectUri = vscode.workspace.getWorkspaceFolder(document.document.uri)?.uri.fsPath;
            if (!REFRESH_ENABLED_DOCUMENTS.includes(document.document.languageId) || !projectUri) {
                return;
            }
            const webview = webviews.get(projectUri);
            if (webview?.getWebview()?.active || AiPanelWebview.currentPanel?.getWebview()?.active) {
                await document.document.save();
                if (!getStateMachine(projectUri).context().view?.endsWith('Form')) {
                    refreshDiagram(projectUri);
                }
            }
        }, extension.context),

        vscode.workspace.onDidDeleteFiles(async function (event) {
            // refreshDiagram(false);

            event.files.forEach(file => {
                const filePath = file;
                const projectUri = vscode.workspace.getWorkspaceFolder(filePath)?.uri.fsPath;
                const apiDir = path.join(projectUri!, 'src', 'main', "wso2mi", "artifacts", "apis");
                if (filePath.fsPath?.includes(apiDir)) {
                    deleteSwagger(filePath.fsPath);
                }
                removeFromHistory(filePath.fsPath);
            });
        }, extension.context),

        vscode.workspace.onDidSaveTextDocument(async function (document) {
            const projectUri = vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;
            const currentView = getStateMachine(projectUri!)?.context()?.view;
            if (SWAGGER_LANG_ID === document.languageId && projectUri) {
                // Check if the saved document is a swagger file
                const relativePath = vscode.workspace.asRelativePath(document.uri);
                const webview = webviews.get(projectUri);
                if (path.dirname(relativePath) === SWAGGER_REL_DIR && webview) {
                    webview.getWebview()?.reveal(webview.isBeside() ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active);
                }
            } else if (!REFRESH_ENABLED_DOCUMENTS.includes(document.languageId)) {
                return;
            }

            const mockServicesDir = path.join(projectUri!, 'src', 'test', 'resources', 'mock-services');
            if (document.uri.toString().includes(mockServicesDir) && currentView == MACHINE_VIEW.TestSuite) {
                return;
            }

            RPCLayer._messenger.sendNotification(
                onDocumentSave,
                { type: 'webview', webviewType: VisualizerWebview.viewType },
                { uri: document.uri.toString() }
            );

            // Generate Swagger file for API files
            const apiDir = path.join(projectUri!, 'src', 'main', "wso2mi", "artifacts", "apis");
            if (document?.uri.fsPath.includes(apiDir)) {
                const dirPath = path.join(projectUri!, SWAGGER_REL_DIR);
                const swaggerOriginalPath = path.join(dirPath, path.basename(document.uri.fsPath, path.extname(document.uri.fsPath)) + '_original.yaml');
                const swaggerPath = path.join(dirPath, path.basename(document.uri.fsPath, path.extname(document.uri.fsPath)) + '.yaml');
                if (fs.readFileSync(document.uri.fsPath, 'utf-8').split('\n').length > 3) {
                    if (fs.existsSync(swaggerOriginalPath)) {
                        fs.copyFileSync(swaggerOriginalPath, swaggerPath);
                        fs.rmSync(swaggerOriginalPath);
                    } else {
                        generateSwagger(document.uri.fsPath);
                    }
                }
            }

            if (currentView !== 'Connector Store Form') {
                refreshDiagram(projectUri!);
            }
        }, extension.context),

        vscode.workspace.onDidChangeTextDocument(async (event) => {
            if (event.document.uri.fsPath.endsWith('pom.xml')) {
                const projectUri = vscode.workspace.getWorkspaceFolder(event.document.uri)?.uri.fsPath;
                const langClient = getStateMachine(projectUri!).context().langClient;
                const confirmUpdate = await vscode.window.showInformationMessage(
                    'The pom.xml file has been modified. Do you want to update the dependencies?',
                    'Yes',
                    'No'
                );

                if (confirmUpdate === 'Yes') {
                    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
                    statusBarItem.text = '$(sync) Updating dependencies...';
                    statusBarItem.show();
                    await langClient?.updateConnectorDependencies();
                    statusBarItem.hide();
                }
            }
        })
    );
}

export const refreshDiagram = debounce(async (projectUri: string, refreshDiagram: boolean = true) => {
    if (!getStateMachine(projectUri).context().isOldProject) {
        await vscode.commands.executeCommand(COMMANDS.REFRESH_COMMAND); // Refresh the project explore view
    }
    if (refreshDiagram) {
        refreshUI(projectUri);
    }
}, 500);
