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
import { createNewComponentCmdId, createNewProjectCmdId, choreoArchitectureViewCmdId, cloneAllComponentsCmdId, cloneRepoToCurrentProjectWorkspaceCmdId } from "../constants";
import { ext } from "../extensionVariables";
import { WebviewWizard, WizardTypes } from "../views/webviews/WebviewWizard";
import { ComponentCreateMode } from "@wso2-enterprise/choreo-core";
import { ChoreoArchitectureView } from "../views/webviews/ChoreoArchitectureView";
import { cloneProject, cloneRepoToCurrentProjectWorkspace } from "../cmds/clone";

let projectWizard: WebviewWizard;
let componentWizard: WebviewWizard;

export function activateWizards() {
    const createProjectCmd = commands.registerCommand(createNewProjectCmdId, (orgId: string) => {
        // TODO: Handle multiple project creation scenarios for different orgs
        if (!projectWizard || !projectWizard.getWebview()) {
            projectWizard = new WebviewWizard(ext.context.extensionUri, WizardTypes.projectCreation, undefined, orgId);
        }
        projectWizard.getWebview()?.reveal();
    });

    const createComponentCmd = commands.registerCommand(createNewComponentCmdId, async (mode?: ComponentCreateMode) => {
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
			ignoreFocusOut: true,
			title: "Create a new Choreo Component",
		};
		const items:QuickPickItem[] = [{
            label: "$(add) From scratch",
            picked: true,
            detail:  "Create a new Choreo component from scratch",
        }, {
            label: "$(add) From existing",
            detail: "Create a new Choreo component from your existing code"
        }];
		const selected = await window.showQuickPick(items, options);

        if(selected){
            if (componentWizard) {
                componentWizard.dispose();
            }
            componentWizard = new WebviewWizard(ext.context.extensionUri, WizardTypes.componentCreation, selected.label === "$(add) From scratch" ? 'fromScratch' : 'fromExisting');
            componentWizard.getWebview()?.reveal();
        }      
    });

    ext.context.subscriptions.push(createProjectCmd, createComponentCmd);


    // Register Cell Diagram Wizard
    const choreoArchitectureView = commands.registerCommand(choreoArchitectureViewCmdId, (orgName: string, projectId: string) => {
        ChoreoArchitectureView.render(ext.context.extensionUri, orgName, projectId);
    });

    ext.context.subscriptions.push(choreoArchitectureView);

    commands.registerCommand(cloneAllComponentsCmdId, cloneProject);
    commands.registerCommand(cloneRepoToCurrentProjectWorkspaceCmdId, cloneRepoToCurrentProjectWorkspace);
}
