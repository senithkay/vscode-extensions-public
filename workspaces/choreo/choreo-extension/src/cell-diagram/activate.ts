/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { openChoreoCellDiagram, refreshChoreoCellDiagram } from '../constants';
import { ext } from '../extensionVariables';
import { CellDiagramView } from "../views/webviews/CellDiagramView";
import { Project } from "@wso2-enterprise/ballerina-languageclient";

export function showCellDiagram(project: Project) {
    CellDiagramView.render(ext.context.extensionUri, project);
}

export function refreshCellDiagram(project: Project) {
    CellDiagramView.render(ext.context.extensionUri, project, true);
}

export function activateCellDiagram(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(openChoreoCellDiagram, showCellDiagram),
        vscode.commands.registerCommand(refreshChoreoCellDiagram, refreshCellDiagram)
    );
}
