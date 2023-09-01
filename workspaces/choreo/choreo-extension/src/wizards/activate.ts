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
import { QuickPickItem, QuickPickOptions, commands, window } from "vscode";
import {
    createNewComponentCmdId,
    createNewProjectCmdId,
    choreoCellViewCmdId,
    cloneAllComponentsCmdId,
    cloneRepoToCurrentProjectWorkspaceCmdId,
    deleteProjectCmdId
} from "../constants";
import { ext } from "../extensionVariables";
import { WebviewWizard, WizardTypes } from "../views/webviews/WebviewWizard";
import { CREATE_PROJECT_EVENT, ComponentCreateMode } from "@wso2-enterprise/choreo-core";
import { cloneProject, cloneRepoToCurrentProjectWorkspace } from "../cmds/clone";
import { ProjectRegistry } from "../registry/project-registry";
import { sendTelemetryEvent } from "../telemetry/utils";
import { openCellView } from "../cmds/open-cell-view";

let projectWizard: WebviewWizard;
let componentWizard: WebviewWizard;

export function activateWizards() {
    const createProjectCmd = commands.registerCommand(createNewProjectCmdId, async (orgId: string) => {
        const isLoggedIn = await ext.api.waitForLogin();
        sendTelemetryEvent(CREATE_PROJECT_EVENT);
        // show a message if user is not logged in
        if (!isLoggedIn) {
            window.showInformationMessage('You are not logged in. Please log in to continue.');
            return;
        }
        const organizationId = orgId ? orgId : (await ext.api.getSelectedOrg())?.id;
        if(organizationId){
            if (!projectWizard || !projectWizard.getWebview()) {
                projectWizard = new WebviewWizard(ext.context.extensionUri, WizardTypes.projectCreation, undefined, `${organizationId}`);
            }
            projectWizard.getWebview()?.reveal();
        }
    });

    const deleteProjectCmd = commands.registerCommand(deleteProjectCmdId, async () => {
        const isLoggedIn = await ext.api.waitForLogin();
        if (!isLoggedIn) {
            window.showInformationMessage("You are not logged in. Please log in to continue.");
            return;
        }

        const choreoProject = await ext.api.getChoreoProject();
        if (!choreoProject) {
            window.showInformationMessage("You are not within a Choreo project at the moment");
            return;
        }

        const answer = await window.showWarningMessage(
            `Please confirm the deletion of project '${choreoProject.name}'. This action is not reversible and will result in the removal of all associated components`,
            { modal: true },
            "Delete Project"
        );
        if (answer === "Delete Project") {
            await ProjectRegistry.getInstance().deleteProject(choreoProject.id, Number(choreoProject.orgId));
        }
    });

    const createComponentCmd = commands.registerCommand(createNewComponentCmdId, async (mode?: ComponentCreateMode) => {
        const isLoggedIn = await ext.api.waitForLogin();
        // show a message if user is not logged in
        if (!isLoggedIn) {
            window.showInformationMessage('You are not logged in. Please log in to continue.');
            return;
        }
        if (mode) {
            if (componentWizard) {
                componentWizard.dispose();
            }
            componentWizard = new WebviewWizard(ext.context.extensionUri, WizardTypes.componentCreation, mode);
            componentWizard.getWebview()?.reveal();
            return;
        }

        // if no mode passed, show quick pick
        const options: QuickPickOptions = {
            canPickMany: false,
            title: "Create Component",
        };
        const items: QuickPickItem[] = [{
            label: "$(add) From scratch",
            picked: true,
            detail: "Create a new Choreo component",
        }, {
            label: "$(add) From existing",
            detail: "Bring in an existing component"
        }];
        const selected = await window.showQuickPick(items, options);

        if (selected) {
            if (componentWizard) {
                componentWizard.dispose();
            }
            componentWizard = new WebviewWizard(ext.context.extensionUri, WizardTypes.componentCreation, selected.label === "$(add) From scratch" ? 'fromScratch' : 'fromExisting');
            componentWizard.getWebview()?.reveal();
        }
    });

    // Register Cell Diagram Wizard
    const choreoArchitectureView = commands.registerCommand(choreoCellViewCmdId, openCellView);

    ext.context.subscriptions.push(createProjectCmd, createComponentCmd, deleteProjectCmd, choreoArchitectureView);

    commands.registerCommand(cloneAllComponentsCmdId, cloneProject);
    commands.registerCommand(cloneRepoToCurrentProjectWorkspaceCmdId, cloneRepoToCurrentProjectWorkspace);
}
