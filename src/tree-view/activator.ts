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
import { commands, window } from 'vscode';
import { CMP_KIND, TREE_COLLAPSE_COMMAND, TREE_ELEMENT_EXECUTE_COMMAND, TREE_REFRESH_COMMAND } from "./model";
import { PackageOverviewDataProvider } from "./tree-data-provider";
import { SessionDataProvider } from "./session-tree-data-provider";

export function activate(ballerinaExtInstance: BallerinaExtension): PackageOverviewDataProvider {

    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_PACKAGE_OVERVIEW, CMP_PACKAGE_VIEW);

    const packageTreeDataProvider = new PackageOverviewDataProvider(ballerinaExtInstance);
    window.createTreeView('ballerinaPackageTreeView', {
        treeDataProvider: packageTreeDataProvider
    });

    commands.registerCommand(TREE_REFRESH_COMMAND, () =>
        packageTreeDataProvider.refresh()
    );

    commands.registerCommand(TREE_COLLAPSE_COMMAND, () => {
        commands.executeCommand('workbench.actions.treeView.ballerinaPackageTreeView.collapseAll');
    });

    if (!ballerinaExtInstance.isSwanLake()) {
        return packageTreeDataProvider;
    }

    const sessionTreeDataProvider = new SessionDataProvider();
    window.createTreeView('sessionExplorer', {
        treeDataProvider: sessionTreeDataProvider
    });

    commands.registerCommand(TREE_ELEMENT_EXECUTE_COMMAND, (filePath: string, kind: string, startLine: number,
        startColumn: number, name: string) => {
        ballerinaExtInstance.diagramTreeElementClicked({
            filePath,
            kind,
            startLine,
            startColumn,
            name
        });
    });

    ballerinaExtInstance.onDiagramTreeElementClicked((construct: ConstructIdentifier) => {
        if (construct.kind === CMP_KIND.FUNCTION || construct.kind === CMP_KIND.RESOURCE ||
            construct.kind == CMP_KIND.RECORD || construct.kind == CMP_KIND.OBJECT || construct.kind == CMP_KIND.TYPE
            || construct.kind == CMP_KIND.CLASS || construct.kind == CMP_KIND.ENUM ||
            construct.kind == CMP_KIND.CONSTANT || construct.kind == CMP_KIND.METHOD ||
            construct.kind == CMP_KIND.LISTENER || construct.kind == CMP_KIND.MODULE_LEVEL_VAR ||
            construct.kind == CMP_KIND.SERVICE) {
            showDiagramEditor(construct.startLine, construct.startColumn, construct.kind, construct.name,
                construct.filePath);
        }
    });
    return packageTreeDataProvider;
}
