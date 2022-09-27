/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { BallerinaExtension, BallerinaProjectComponents, ChoreoSession, ConstructIdentifier, DocumentIdentifier, ExtendedLangClient, NOT_SUPPORTED } from "../core";
import { callUpdateDiagramMethod, showDiagramEditor, updateDiagramElement } from '../diagram';
import { sendTelemetryEvent, CMP_PACKAGE_VIEW, TM_EVENT_OPEN_PACKAGE_OVERVIEW } from "../telemetry";
import { commands, Uri, window, workspace } from 'vscode';
import {
    TREE_ELEMENT_EXECUTE_COMMAND, EXPLORER_TREE_REFRESH_COMMAND, EXPLORER_TREE_NEW_FILE_COMMAND,
    EXPLORER_TREE_NEW_FOLDER_COMMAND, ExplorerTreeItem, EXPLORER_TREE_NEW_MODULE_COMMAND,
    EXPLRER_TREE_DELETE_FILE_COMMAND, EXPLORER_ITEM_KIND, DOCUMENTATION_VIEW, Module
} from "./model";
import { SessionDataProvider } from "./session-tree-data-provider";
import { ExplorerDataProvider } from "./explorer-tree-data-provider";
import { existsSync, mkdirSync, open, readFileSync, rm, rmdir } from 'fs';
import { join, sep } from 'path';
import { BALLERINA_COMMANDS, PALETTE_COMMANDS, runCommand } from "../project";
import { getChoreoKeytarSession } from "../choreo-auth/auth-session";
import { showChoreoPushMessage } from "../editor-support/git-status";
import { showDocumentationView } from "../documentation/docPanel";

export function activate(ballerinaExtInstance: BallerinaExtension) {

    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_PACKAGE_OVERVIEW, CMP_PACKAGE_VIEW);

    const explorerDataProvider = new ExplorerDataProvider();
    ballerinaExtInstance.context!.subscriptions.push(window.createTreeView('ballerinaExplorerTreeView', {
        treeDataProvider: explorerDataProvider, showCollapseAll: true
    }));

    let enableChoreoAuth: boolean = true;
    if (process.env.OVERRIDE_CHOREO_AUTHENTICATION === 'true') {
        enableChoreoAuth = false;
    }
    ballerinaExtInstance.setChoreoAuthEnabled(enableChoreoAuth);

    commands.registerCommand(EXPLORER_TREE_REFRESH_COMMAND, () =>
        explorerDataProvider.refresh()
    );

    commands.registerCommand(EXPLORER_TREE_NEW_FILE_COMMAND, async (item: ExplorerTreeItem) => {
        const name = await window.showInputBox({ placeHolder: 'Enter file name...' });
        if (name && name.trim().length > 0) {
            open(join(item.getUri().fsPath, name), 'w', () => { });
        }
    });

    commands.registerCommand(EXPLORER_TREE_NEW_FOLDER_COMMAND, async (item: ExplorerTreeItem) => {
        const name = await window.showInputBox({ placeHolder: 'Enter folder name...' });
        if (name && name.trim().length > 0) {
            const filePath = join(item.getUri().fsPath, name);
            if (!existsSync(filePath)) {
                mkdirSync(filePath);
            }
        }
    });

    commands.registerCommand(EXPLRER_TREE_DELETE_FILE_COMMAND, async (item: ExplorerTreeItem) => {
        const deleteAction = 'Delete';
        const cancelAction = 'Cancel';
        window.showWarningMessage(`Are you sure you want to delete ${item.getUri().fsPath}?`,
            cancelAction, deleteAction).then((selection) => {
                if (deleteAction === selection) {
                    const callback = (error) => {
                        error !== null ? ballerinaExtInstance.showMsgAndRestart(
                            "The workspace doesn't seem to be synced with the file system.") : null;
                    }
                    item.getKind() == 'folder' ? rmdir(item.getUri().fsPath, { recursive: true }, callback) :
                        rm(item.getUri().fsPath, callback);
                }
            });
    });

    commands.registerCommand(EXPLORER_TREE_NEW_MODULE_COMMAND, async () => {
        const workspaceFolderProjects = workspace.workspaceFolders?.filter(folder => {
            return existsSync(join(folder.uri.fsPath, 'Ballerina.toml'));
        });

        if (!workspaceFolderProjects || workspaceFolderProjects.length == 0) {
            window.showErrorMessage('No Ballerina Projects identified at the workspace root.');
            return;
        }
        let userSelection;
        if (workspaceFolderProjects.length > 1) {
            let projectOptions: { label: string, id: string, uri: Uri }[] = [];
            workspaceFolderProjects.forEach(project => {
                projectOptions.push({
                    label: project.name,
                    id: project.name,
                    uri: project.uri
                });
            });

            userSelection = await window.showQuickPick(projectOptions, { placeHolder: 'Select the project...' });
        } else {
            userSelection = { uri: workspaceFolderProjects[0].uri };
        }

        const moduleName = await window.showInputBox({ placeHolder: 'Enter module name' });
        if (userSelection && moduleName && moduleName.trim().length > 0) {
            runCommand(userSelection.uri.fsPath, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.ADD,
                moduleName);
        }
    });

    const sessionTreeDataProvider = new SessionDataProvider(ballerinaExtInstance);
    window.createTreeView('sessionExplorer', {
        treeDataProvider: sessionTreeDataProvider, showCollapseAll: true
    });
    workspace.onDidChangeTextDocument(_listener => {
        showChoreoPushMessage(ballerinaExtInstance);
    });

    const choreoSession: ChoreoSession = ballerinaExtInstance.getChoreoSession();
    ballerinaExtInstance.setChoreoSessionTreeProvider(sessionTreeDataProvider);
    if (!choreoSession.loginStatus) {
        getChoreoKeytarSession().then((result) => {
            ballerinaExtInstance.setChoreoSession(result);
            sessionTreeDataProvider.refresh();
        });
    }
    sessionTreeDataProvider.refresh();

    commands.registerCommand(TREE_ELEMENT_EXECUTE_COMMAND, (filePath: string, kind: string, startLine: number,
        startColumn: number, name: string) => {
        ballerinaExtInstance.getDocumentContext().diagramTreeElementClicked({
            filePath,
            kind,
            startLine,
            startColumn,
            name
        });
    });

    commands.registerCommand(DOCUMENTATION_VIEW, async (url: string) => {
        await showDocumentationView(url);
    });

    ballerinaExtInstance.getDocumentContext().onDiagramTreeElementClicked((construct: ConstructIdentifier) => {
        if (construct.kind == EXPLORER_ITEM_KIND.BAL_FILE) {
            showDiagramEditor(construct.startLine, construct.startColumn, construct.filePath);
            ballerinaExtInstance.getDocumentContext().setLatestDocument(Uri.file(construct.filePath));
        }
    });

    if (ballerinaExtInstance.isBallerinaLowCodeMode()) {
        commands.executeCommand(PALETTE_COMMANDS.FOCUS_EXPLORER);
        renderFirstFile(ballerinaExtInstance.langClient!, true);
    } else if (ballerinaExtInstance.isCodeServerEnv()) {
        renderFirstFile(ballerinaExtInstance.langClient!, false);
    }
}

export async function renderFirstFile(client: ExtendedLangClient, isDiagram: boolean) {
    const folder = workspace.workspaceFolders![0];
    const tomlPath = folder.uri.fsPath + sep + 'Ballerina.toml';
    const currentFileUri = Uri.file(tomlPath).toString();
    if (!existsSync(tomlPath)) {
        return;
    }

    client.onReady().then(async () => {
        client.sendNotification('textDocument/didOpen', {
            textDocument: {
                uri: currentFileUri,
                languageId: 'ballerina',
                version: 1,
                text: readFileSync(tomlPath, { encoding: 'utf-8' })
            }
        });

        const documentIdentifiers: DocumentIdentifier[] = [{ uri: currentFileUri }];
        let projectResponse;
        let i = 0;
        do {
            projectResponse = await client.getBallerinaProjectComponents({ documentIdentifiers });
            if (projectResponse === NOT_SUPPORTED) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } while (i++ < 5 && projectResponse === NOT_SUPPORTED);

        const response = projectResponse as BallerinaProjectComponents;
        if (!response.packages || response.packages.length == 0 || !response.packages[0].modules) {
            return;
        }
        const defaultModules: Module[] = response.packages[0].modules.filter(module => {
            return !module.name;
        });
        if (defaultModules.length == 0) {
            return;
        }
        if ((defaultModules[0].functions && defaultModules[0].functions.length > 0) ||
            (defaultModules[0].services && defaultModules[0].services.length > 0)) {
            const mainFunctionNodes = defaultModules[0].functions.filter(fn => {
                return fn.name === 'main';
            });
            if (mainFunctionNodes.length > 0) {
                const path = join(folder.uri.path, mainFunctionNodes[0].filePath);
                if (!isDiagram) {
                    workspace.openTextDocument(Uri.file(path)).then(doc => {
                        window.showTextDocument(doc);
                    });
                    return;
                }
                await showDiagramEditor(0, 0, path);
                const diagramElement = {
                    isDiagram: true,
                    fileUri: Uri.file(path),
                    startLine: mainFunctionNodes[0].endLine,
                    startColumn: mainFunctionNodes[0].endColumn - 1
                };
                updateDiagramElement(diagramElement);
                callUpdateDiagramMethod();
            } else if (defaultModules[0].services && defaultModules[0].services.length > 0) {
                const path = join(folder.uri.path, defaultModules[0].services[0].filePath);
                if (!isDiagram) {
                    workspace.openTextDocument(Uri.file(path)).then(doc => {
                        window.showTextDocument(doc);
                    });
                    return;
                }
                for (let i = 0; i < defaultModules[0].services.length; i++) {
                    await showDiagramEditor(0, 0, path);
                    let startLine: number;
                    let startColumn: number;
                    if (defaultModules[0].services[i].resources && defaultModules[0].services[i].resources.length > 0) {
                        startLine = defaultModules[0].services[i].resources[0].startLine;
                        startColumn = defaultModules[0].services[i].resources[0].startColumn;
                    } else {
                        startLine = defaultModules[0].services[i].startLine;
                        startColumn = defaultModules[0].services[i].startColumn;
                    }
                    const diagramElement = {
                        isDiagram: true,
                        fileUri: Uri.file(path),
                        startLine,
                        startColumn
                    };
                    updateDiagramElement(diagramElement);
                    callUpdateDiagramMethod();
                    break;
                }
            } else if (defaultModules[0].functions.length > 0) {
                const path = join(folder.uri.path, defaultModules[0].functions[0].filePath);
                if (!isDiagram) {
                    workspace.openTextDocument(Uri.file(path)).then(doc => {
                        window.showTextDocument(doc);
                    });
                    return;
                }
                await showDiagramEditor(0, 0, path);
                const diagramElement = {
                    isDiagram: true,
                    fileUri: Uri.file(path),
                    startLine: defaultModules[0].functions[0].endLine,
                    startColumn: defaultModules[0].functions[0].endColumn - 1
                };
                updateDiagramElement(diagramElement);
                callUpdateDiagramMethod();
            }
        }
    });
}
