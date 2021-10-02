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

import { BallerinaExtension, ConstructIdentifier } from "../core";
import { showDiagramEditor } from '../diagram';
import { sendTelemetryEvent, CMP_PACKAGE_VIEW, TM_EVENT_OPEN_PACKAGE_OVERVIEW } from "../telemetry";
import { commands, Uri, window } from 'vscode';
import {
    CMP_KIND, TREE_ELEMENT_EXECUTE_COMMAND, OUTLINE_TREE_REFRESH_COMMAND, EXPLORER_TREE_REFRESH_COMMAND,
    EXPLORER_ITEM_KIND, EXPLORER_TREE_NEW_FILE_COMMAND, EXPLORER_TREE_NEW_FOLDER_COMMAND, ExplorerTreeItem
} from "./model";
import { PackageOverviewDataProvider } from "./outline-tree-data-provider";
import { SessionDataProvider } from "./session-tree-data-provider";
import { ExplorerDataProvider } from "./explorer-tree-data-provider";
import { existsSync, mkdirSync, open } from 'fs';
import { join } from 'path';

export function activate(ballerinaExtInstance: BallerinaExtension): PackageOverviewDataProvider {

    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_PACKAGE_OVERVIEW, CMP_PACKAGE_VIEW);

    const packageTreeDataProvider = new PackageOverviewDataProvider(ballerinaExtInstance);
    window.createTreeView('ballerinaPackageTreeView', {
        treeDataProvider: packageTreeDataProvider, showCollapseAll: true
    });

    commands.registerCommand(OUTLINE_TREE_REFRESH_COMMAND, () =>
        packageTreeDataProvider.refresh()
    );

    if (!ballerinaExtInstance.isSwanLake()) {
        return packageTreeDataProvider;
    }

    const explorerDataProvider = new ExplorerDataProvider(ballerinaExtInstance);
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
            explorerDataProvider.refresh();
        }
    });

    commands.registerCommand(EXPLORER_TREE_NEW_FOLDER_COMMAND, async (item: ExplorerTreeItem) => {
        const name = await window.showInputBox({ placeHolder: 'Enter folder name...' });
        if (name && name.trim().length > 0) {
            const filePath = join(item.getUri().fsPath, name);
            if (!existsSync(filePath)) {
                mkdirSync(filePath);
            }
            explorerDataProvider.refresh();
        }
    });

    const sessionTreeDataProvider = new SessionDataProvider(ballerinaExtInstance);
    window.createTreeView('sessionExplorer', {
        treeDataProvider: sessionTreeDataProvider, showCollapseAll: true
    });

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

    ballerinaExtInstance.getDocumentContext().onDiagramTreeElementClicked((construct: ConstructIdentifier) => {
        if (construct.kind === CMP_KIND.FUNCTION || construct.kind === CMP_KIND.RESOURCE ||
            construct.kind == CMP_KIND.RECORD || construct.kind == CMP_KIND.OBJECT || construct.kind == CMP_KIND.TYPE
            || construct.kind == CMP_KIND.CLASS || construct.kind == CMP_KIND.ENUM ||
            construct.kind == CMP_KIND.CONSTANT || construct.kind == CMP_KIND.METHOD ||
            construct.kind == CMP_KIND.LISTENER || construct.kind == CMP_KIND.MODULE_LEVEL_VAR ||
            construct.kind == CMP_KIND.SERVICE || construct.kind == EXPLORER_ITEM_KIND.BAL_FILE) {
            showDiagramEditor(construct.startLine, construct.startColumn, construct.kind, construct.name,
                construct.filePath);
            ballerinaExtInstance.getDocumentContext().setLatestDocument(Uri.file(construct.filePath));
            packageTreeDataProvider.refresh();
            explorerDataProvider.refresh();
        }
    });
    return packageTreeDataProvider;
}
