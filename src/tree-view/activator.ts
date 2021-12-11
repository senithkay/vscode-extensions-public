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

import { BallerinaExtension, BallerinaProject, ChoreoSession, ConstructIdentifier } from "../core";
import { renderFirstDiagramElement, showDiagramEditor } from '../diagram';
import { sendTelemetryEvent, CMP_PACKAGE_VIEW, TM_EVENT_OPEN_PACKAGE_OVERVIEW } from "../telemetry";
import { commands, Uri, window, workspace } from 'vscode';
import {
    TREE_ELEMENT_EXECUTE_COMMAND, EXPLORER_TREE_REFRESH_COMMAND, EXPLORER_TREE_NEW_FILE_COMMAND,
    EXPLORER_TREE_NEW_FOLDER_COMMAND, ExplorerTreeItem, EXPLORER_TREE_NEW_MODULE_COMMAND,
    EXPLRER_TREE_DELETE_FILE_COMMAND, CONFIG_EDITOR_EXECUTE_COMMAND, EXPLORER_ITEM_KIND, DOCUMENTATION_VIEW
} from "./model";
import { SessionDataProvider } from "./session-tree-data-provider";
import { ExplorerDataProvider } from "./explorer-tree-data-provider";
import { existsSync, mkdirSync, open, openSync, rm, rmdir } from 'fs';
import path, { join } from 'path';
import os from 'os';
import { BALLERINA_COMMANDS, BAL_TOML, PALETTE_COMMANDS, runCommand } from "../project";
import { getChoreoKeytarSession } from "../choreo-auth/auth-session";
import { showChoreoPushMessage } from "../editor-support/git-status";
import { showConfigEditor } from "../config-editor/configEditorPanel";
import { getCurrentBallerinaProject } from "../utils/project-utils";
import { showDocumentationView } from "../documentation/docPanel";

const CONFIG_FILE = 'Config.toml';
export function activate(ballerinaExtInstance: BallerinaExtension) {

    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_PACKAGE_OVERVIEW, CMP_PACKAGE_VIEW);

    const explorerDataProvider = new ExplorerDataProvider();
    ballerinaExtInstance.context!.subscriptions.push(window.createTreeView('ballerinaExplorerTreeView', {
        treeDataProvider: explorerDataProvider, showCollapseAll: true
    }));

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
                    item.getKind() == 'folder' ? rmdir(item.getUri().fsPath, { recursive: true }, () => { }) :
                        rm(item.getUri().fsPath, () => { });
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
            })

            userSelection = await window.showQuickPick(projectOptions, { placeHolder: 'Select the project...' });
        } else {
            userSelection = { uri: workspaceFolderProjects[0].uri }
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

    commands.registerCommand(CONFIG_EDITOR_EXECUTE_COMMAND, async (filePath: string) => {
        if (!ballerinaExtInstance.langClient) {
            return;
        }

        let configFile: string = filePath;

        if (!filePath.toString().endsWith(CONFIG_FILE)) {
            let currentProject: BallerinaProject = {};
            if (window.activeTextEditor) {
                currentProject = await getCurrentBallerinaProject();

            } else {
                const document = ballerinaExtInstance.getDocumentContext().getLatestDocument();
                if (document) {
                    currentProject = await getCurrentBallerinaProject(document.toString());
                }
            }

            if (!currentProject || currentProject === {}) {
                return;
            }

            filePath = `${currentProject.path}/${BAL_TOML}`;

            const directory = path.join(os.tmpdir(), "ballerina-project", currentProject.packageName!);
            if (!existsSync(directory)) {
                mkdirSync(directory, { recursive: true });
            }
            console.debug("Project temp directory: " + directory);

            configFile = `${directory}/${CONFIG_FILE}`;
            if (!existsSync(configFile)) {
                openSync(configFile, 'w')
            }

            ballerinaExtInstance.setBallerinaConfigPath(configFile);
        }

        await ballerinaExtInstance.langClient.getBallerinaProjectConfigSchema({
            documentIdentifier: {
                uri: Uri.file(filePath).toString()
            }
        }).then(data => {
            if (data.configSchema == null) {
                window.showErrorMessage('Unable to render the configurable editor: Error while '
                    + 'retrieving the configurable schema.');
                return Promise.reject();
            }
            showConfigEditor(ballerinaExtInstance, data.configSchema, Uri.parse(configFile));
        });
    });

    commands.registerCommand(DOCUMENTATION_VIEW, async (url: string) => {
        await showDocumentationView(url);
    });

    ballerinaExtInstance.getDocumentContext().onDiagramTreeElementClicked((construct: ConstructIdentifier) => {
        if (construct.kind == EXPLORER_ITEM_KIND.BAL_FILE) {
            showDiagramEditor(construct.startLine, construct.startColumn, construct.filePath);
            ballerinaExtInstance.getDocumentContext().setLatestDocument(Uri.file(construct.filePath));
            explorerDataProvider.refresh();
        }
    });

    if (ballerinaExtInstance.isBallerinaLowCodeMode()) {
        commands.executeCommand(PALETTE_COMMANDS.FOCUS_EXPLORER);
        renderFirstDiagramElement(ballerinaExtInstance.langClient!);
    }
}
