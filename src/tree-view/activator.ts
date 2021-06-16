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
import { CMP_KIND, TREE_ELEMENT_EXECUTE_COMMAND, TREE_REFRESH_COMMAND } from "./model";
import { PackageOverviewDataProvider } from "./tree-data-provider";

export function activate(ballerinaExtInstance: BallerinaExtension): PackageOverviewDataProvider {

    sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_PACKAGE_OVERVIEW, CMP_PACKAGE_VIEW);

    const packageTreeDataProvider = new PackageOverviewDataProvider(ballerinaExtInstance);
    const ballerinaPackageTree = window.createTreeView('ballerinaPackageTreeView', {
        treeDataProvider: packageTreeDataProvider
    });

    commands.registerCommand(TREE_REFRESH_COMMAND, () =>
        packageTreeDataProvider.refresh()
    );

    if (!ballerinaExtInstance.isSwanLake()) {
        return packageTreeDataProvider;
    }

    packageTreeDataProvider.getPackageStructure().then(treeViewChildren => {
        if (treeViewChildren.length > 0) {
            ballerinaPackageTree.reveal(treeViewChildren[0], { expand: true, focus: false, select: false });
        }
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
        if (construct.kind === CMP_KIND.FUNCTION || construct.kind === CMP_KIND.RESOURCE) {
            showDiagramEditor(ballerinaExtInstance, construct.startLine, construct.startColumn, construct.kind,
                construct.name, construct.filePath);
        }
    });
    return packageTreeDataProvider;
}
