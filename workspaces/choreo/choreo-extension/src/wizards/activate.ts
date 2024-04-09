/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { QuickPickItem, QuickPickOptions, commands, window } from "vscode";
import {
    createNewProjectCmdId,
    cloneAllComponentsCmdId,
    cloneRepoToCurrentProjectWorkspaceCmdId,
    deleteProjectCmdId
} from "../constants";
import { ext } from "../extensionVariables";
import { WebviewWizard, WizardTypes } from "../views/webviews/WebviewWizard";
import { CREATE_PROJECT_EVENT } from "@wso2-enterprise/choreo-core";
import { cloneProject, cloneRepoToCurrentProjectWorkspace } from "../git/clone";
import { ProjectRegistry } from "../registry/project-registry";
import { sendTelemetryEvent } from "../telemetry/utils";
import { authStore } from "../stores/auth-store";

let projectWizard: WebviewWizard;
let componentWizard: WebviewWizard;

export function activateWizards() {
    // const createProjectCmd = commands.registerCommand(createNewProjectCmdId, async (orgId: string) => {
    //     const isLoggedIn = await ext.api.waitForLogin();
    //     sendTelemetryEvent(CREATE_PROJECT_EVENT);
    //     // show a message if user is not logged in
    //     if (!isLoggedIn) {
    //         window.showInformationMessage('You are not logged in. Please log in to continue.');
    //         return;
    //     }
    //     const organizationId = orgId ? orgId : (await ext.api.getSelectedOrg())?.id;
    //     if(organizationId){
    //         if (!projectWizard || !projectWizard.getWebview()) {
    //             projectWizard = new WebviewWizard(ext.context.extensionUri, WizardTypes.projectCreation, `${organizationId}`);
    //         }
    //         projectWizard.getWebview()?.reveal();
    //     }
    // });

    // const deleteProjectCmd = commands.registerCommand(deleteProjectCmdId, async () => {
    //     const isLoggedIn = await ext.api.waitForLogin();
    //     if (!isLoggedIn) {
    //         window.showInformationMessage("You are not logged in. Please log in to continue.");
    //         return;
    //     }

    //     const choreoProject = await ext.api.getChoreoProject();
    //     if (!choreoProject) {
    //         window.showInformationMessage("You are not within a Choreo project at the moment");
    //         return;
    //     }

    //     const answer = await window.showWarningMessage(
    //         `Please confirm the deletion of project '${choreoProject.name}'. This action is not reversible and will result in the removal of all associated components`,
    //         { modal: true },
    //         "Delete Project"
    //     );
    //     if (answer === "Delete Project") {
    //         await ProjectRegistry.getInstance().deleteProject(choreoProject.id, Number(choreoProject.orgId));
    //     }
    // });

    // const createComponentCmd = commands.registerCommand(createNewComponentCmdId, async () => {
    //     const userInfo = authStore.getState().state.userInfo;
    //     // show a message if user is not logged in
    //     if (!userInfo) {
    //         window.showInformationMessage('You are not logged in. Please log in to continue.');
    //         return;
    //     }

    //     if (componentWizard) {
    //         componentWizard.dispose();
    //     }
    //     componentWizard = new WebviewWizard(ext.context.extensionUri, WizardTypes.componentCreation);
    //     componentWizard.getWebview()?.reveal();
    // });

    // ext.context.subscriptions.push(createComponentCmd);

    commands.registerCommand(cloneAllComponentsCmdId, cloneProject);
    commands.registerCommand(cloneRepoToCurrentProjectWorkspaceCmdId, cloneRepoToCurrentProjectWorkspace);
}
