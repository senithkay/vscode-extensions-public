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
import { createNewProjectCmdId, openProjectCmdId } from '../constants';
import { ext } from '../extensionVariables';
import { ProjectRegistry } from '../registry/project-registry';
import { cloneProject } from './clone';
import path = require('path');

export function activateOpenProjectCmd(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(openProjectCmdId, () => {
        openChoreoProject();
    }));
}

export async function openChoreoProject() {
    // show a message if user is not logged in
    if (ext.api.status !== 'LoggedIn') {
        vscode.window.showInformationMessage('You are not logged in. Please log in to continue.');
        return;
    }
    const projects = await ProjectRegistry.getInstance().getProjects(ext.api.selectedOrg?.id!);
    const currentProject = await ext.api.getChoreoProject();
    const quickPicks: vscode.QuickPickItem[] = projects.map(project => {
        const currentlyOpened = currentProject?.id === project.id;
        const location = ProjectRegistry.getInstance().getProjectLocation(project.id);
        let detail = '';
        if (currentlyOpened) {
            detail = 'Currently opened';
        } else if (location) {
            detail = 'Local copy at ' + path.dirname(location);
        } else {
            detail = 'Not cloned locally';
        }
        return {
            label: project.name,
            description: project.description,
            detail,
        };
    });
    quickPicks.push({
        kind: vscode.QuickPickItemKind.Separator,
        label: '+',
    });
    quickPicks.push({
        label: 'Create new',
        detail: 'Create and open a new Choreo project',
    });

    // show a popup to select a project
    const selection = await vscode.window.showQuickPick(quickPicks, {
        title: 'Select a project to continue',
        canPickMany: false,
        matchOnDescription: true,
        matchOnDetail: false,
    });

    // show project creation wizard if user selects the last item
    if (selection?.label === 'Create new') {
        vscode.commands.executeCommand(createNewProjectCmdId);
        return;
    }
    // if the selected project is already opened, show a message and return
    if (selection?.label === currentProject?.name) {
        vscode.window.showInformationMessage('The project is already opened in current window.');
        return;
    }

    const selectedProject = projects.find(project => project.name === selection?.label);
    if (selectedProject) {
        const projectLocation = ProjectRegistry.getInstance().getProjectLocation(selectedProject.id);
        if (projectLocation) {
            // ask user where to open the project, current window or a new window
            const openInCurrentWorkspace = await vscode.window.showInformationMessage(
                'Where do you want to open the project?',
                {
                    modal: true,
                },
                'Current Window',
                'New Window',
            );
            if (openInCurrentWorkspace === 'Current Window') {
                await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectLocation), {
                    forceNewWindow: false,
                });
            } else if (openInCurrentWorkspace === 'New Window') {
                await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectLocation), {
                    forceNewWindow: true,
                });
            }
        } else {
            // Project is not cloned yet, clone the project and open it
            // show a quick pick to ask user whether to clone the project or not
            const cloneSelection = await vscode.window.showQuickPick([
                {  label: 'Yes', description: 'Clone and open the project' },
                {  label: 'No', description: 'Do not clone the project' },
            ], { title: 'The project is not cloned yet. Do you want to clone and open it?' });
            if (cloneSelection?.label === 'Yes') {
                cloneProject(selectedProject);
            }
        }
    }
}
