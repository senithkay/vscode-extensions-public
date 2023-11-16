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

export async function showCellDiagram() {
    const project = await ext.api.getChoreoProject();
    if (project === undefined) {
        vscode.window.showErrorMessage("Need to be within a Choreo project in order to view the Cell diagram");
        return;
    }
    const org = await ext.api.getSelectedOrg();
    const projectModel = await ext.clients.cellViewClient.getProjectModelFromFs(org, project.id);

    CellDiagramView.render(ext.context.extensionUri, projectModel);
}

export async function refreshCellDiagram() {
    const project = await ext.api.getChoreoProject();
    if (project === undefined) {
        vscode.window.showErrorMessage("Need to be within a Choreo project in order to view/refresh the Cell diagram");
        return;
    }
    const org = await ext.api.getSelectedOrg();
    const projectModel = await ext.clients.cellViewClient.getProjectModelFromFs(org, project.id);

    CellDiagramView.render(ext.context.extensionUri, projectModel, true);
}

export function activateCellDiagram(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(openChoreoCellDiagram, showCellDiagram),
        vscode.commands.registerCommand(refreshChoreoCellDiagram, refreshCellDiagram)
    );
}
