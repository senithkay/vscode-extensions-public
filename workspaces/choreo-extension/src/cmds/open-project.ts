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
import { STATUS_LOGGED_IN, createNewProjectCmdId, openProjectCmdId } from '../constants';
import { ext } from '../extensionVariables';
import { ProjectRegistry } from '../registry/project-registry';
import { cloneProject } from './clone';
import path = require('path');
import { OPEN_PROJECT_EVENT, Organization, Project } from '@wso2-enterprise/choreo-core';
import { sendTelemetryEvent } from '../telemetry/utils';

export function activateOpenProjectCmd(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(openProjectCmdId, async () => {
        const isLoggedIn = await ext.api.waitForLogin();
        sendTelemetryEvent(OPEN_PROJECT_EVENT);
        // show a message if user is not logged in
        if (!isLoggedIn) {
            vscode.window.showInformationMessage('You are not logged in. Please log in to continue.');
            return;
        }
        const currentOrg = await ext.api.getSelectedOrg();
        if (currentOrg) {
            showSwitchProjectQuickPick(currentOrg);
        }
    }));
}

export async function showSwitchProjectQuickPick(org: Organization) {
    const quickPickInstance = vscode.window.createQuickPick();
    quickPickInstance.busy = true;
    quickPickInstance.placeholder = `Loading projects in '${org.name}' organization...`;
    quickPickInstance.show();

    const isLoggedIn = await ext.api.waitForLogin();
    // show a message if user is not logged in
    if (!isLoggedIn) {
        vscode.window.showInformationMessage('You are not logged in. Please log in to continue.');
        quickPickInstance.hide();
        return;
    }

    const currentProject = await ext.api.getChoreoProject();
    const { quickPicks, projects } = await getProjectQuickPicks(org, currentProject);

    quickPickInstance.busy = false;
    quickPickInstance.placeholder = 'Select a project to continue';
    quickPickInstance.items = quickPicks;

    quickPickInstance.onDidAccept(async () => {
        onDidAcceptProjectList(quickPickInstance, currentProject, projects);
    });
}

const onDidAcceptProjectList = async (
    quickPickInstance: vscode.QuickPick<vscode.QuickPickItem>,
    currentProject: Project | undefined,
    projects: Project[]) => {
    quickPickInstance.hide();
    const selection = quickPickInstance.selectedItems[0];

    // show organization selection quick pick if user selects the first item
    if (selection?.label?.includes('Change Organization')) {
        await showOrgChangeQuickPick();
        return;
    }

    // show project creation wizard if user selects the last item
    if (selection?.label.includes('Create New')) {
        vscode.commands.executeCommand(createNewProjectCmdId);
        return;
    }

    const selectedProject = projects.find(project => project.name === selection?.label);
    // if the selected project is already opened, show a message and return
    if (selectedProject?.id === currentProject?.id) {
        vscode.window.showInformationMessage('The project is already opened in current window.');
        return;
    }

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
            // show a modal and ask user to select the folder to clone
            const selectDirectoryPrompt = await vscode.window.showInformationMessage(
                "The selected project hasn't been cloned yet. Please select a directory where you'd like it to be cloned.",
                { modal: true },
                'Select Directory',
            );

            if (selectDirectoryPrompt === 'Select Directory') {
                cloneProject(selectedProject);
            }
        }
    }
};

async function showOrgChangeQuickPick() {
    const quickPickInstance = vscode.window.createQuickPick();
    quickPickInstance.busy = true;
    quickPickInstance.placeholder = 'Loading organizations...';
    quickPickInstance.show();

    const orgs = ext.api.userInfo?.organizations;
    if (!orgs) {
        vscode.window.showErrorMessage('Failed to load organizations.');
        quickPickInstance.hide();
        return;
    }
    const quickPicks = orgs.map(org => {
        return { label: org.name, description: org.handle };
    });
    quickPickInstance.busy = false;
    quickPickInstance.placeholder = 'Select an organization';
    quickPickInstance.items = quickPicks;

    quickPickInstance.onDidAccept(async () => {
        quickPickInstance.hide();
        const selection = quickPickInstance.selectedItems[0];
        if (selection) {
            const selectedOrg = orgs.find(org => org.name === selection.label);
            if (selectedOrg) {
                showSwitchProjectQuickPick(selectedOrg);
            }
            // change the selected organization
        }
    });
    quickPickInstance.onDidHide(() => quickPickInstance.dispose());
}

async function getProjectQuickPicks(org: Organization, currentProject?: Project) {
    const projects = await ProjectRegistry.getInstance().getProjects(org.id, org.handle, true);
    const quickPicks: vscode.QuickPickItem[] = [];
    quickPicks.push({
        kind: vscode.QuickPickItemKind.Separator,
        label: 'Projects',
    });
    const projectItems: vscode.QuickPickItem[] = projects.map(project => {
        const currentlyOpened = currentProject?.id === project.id;
        const location = ProjectRegistry.getInstance().getProjectLocation(project.id);
        let detail = '';
        if (currentlyOpened) {
            detail = 'Currently opened';
        } else if (location) {
            detail = 'Local copy at ' + path.dirname(location);
        } else {
            detail = 'Local copy not found';
        }
        return {
            label: project.name,
            description: project.description,
            detail,
        };
    });
    quickPicks.push(...projectItems);
    quickPicks.push({
        kind: vscode.QuickPickItemKind.Separator,
        label: 'Organization',
    });
    quickPicks.push({
        label: '$(arrow-swap)  Change Organization',
        detail: 'Currently showing projects in \'' + org.name + '\' organization',
        alwaysShow: true,
    });
    quickPicks.push({
        kind: vscode.QuickPickItemKind.Separator,
        label: '',
    });
    quickPicks.push({
        label: '$(add)  Create New',
        detail: 'Create and open a new Choreo project',
        alwaysShow: true,
    });
    return { quickPicks, projects };
}


export const openProjectInVSCode = async (
    projectId: string,
    organization: Organization) => {

    const currentProject = await ext.api.getChoreoProject();

    // if the selected project is already opened, show a message and return
    if (projectId === currentProject?.id) {
        vscode.window.showInformationMessage('The project is already opened in current window.');
        return;
    }

    const projects = await ProjectRegistry.getInstance().getProjects(organization.id, organization.handle, true);
    const selectedProject = projects.find(project => project.id === projectId);
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
            // show a modal and ask user to select the folder to clone
            const selectDirectoryPrompt = await vscode.window.showInformationMessage(
                "The selected project hasn't been cloned yet. Please select a directory where you'd like it to be cloned.",
                { modal: true },
                'Select Directory',
            );
            if (selectDirectoryPrompt === 'Select Directory') {
                cloneProject(selectedProject);
            }
        }
    }
};
