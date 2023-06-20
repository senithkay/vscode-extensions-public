/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
// 
import * as vscode from 'vscode';
import { openProjectCmdId } from '../constants';
import { ext } from '../extensionVariables';
import { ProjectRegistry } from '../registry/project-registry';

export function activateOpenProjectCmd(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(openProjectCmdId, () => {
        openChoreoProject();
    }));
}

export async function openChoreoProject() {
    // show a message if user is not logged in
    if(ext.api.status !== 'LoggedIn') {
        vscode.window.showInformationMessage('You are not logged in. Please log in to continue.');
        return;
    }
    const projects = await ProjectRegistry.getInstance().getProjects(ext.api.selectedOrg?.id!);
    const currentProject = await ext.api.getChoreoProject();
    const quickPicks: vscode.QuickPickItem[] = projects.map(project => {
        return {
            label: project.name,
            description: project.version,
            picked: project.id === currentProject?.id,
        };
    });
    quickPicks.push({
        kind: vscode.QuickPickItemKind.Separator,
        label: '+',
    });
    quickPicks.push({
        label: 'Create new',
        description: 'Create and open a new project',
    });

    // show a popup to select a project
    const selection = await vscode.window.showQuickPick(quickPicks, {
        title: 'Select a project to continue',
        canPickMany: false,
        placeHolder: "Current project: " + (currentProject?.name ?? 'None'),
        matchOnDescription: true,
        matchOnDetail: true,
    });
    // show a quick pick with a title and list of projects to select from, each item should have a description
    // and a detail, also show a button to create a new project
}
