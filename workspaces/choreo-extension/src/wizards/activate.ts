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
import { commands } from "vscode";
import { createNewComponentCmdId, createNewProjectCmdId, choreoProjectOverview, choreoCellView } from "../constants";
import { ext } from "../extensionVariables";
import { WebviewWizard, WizardTypes } from "../views/webviews/WebviewWizard";
import { ProjectOverview } from "../views/webviews/ProjectOverview";
import { Organization, Project } from "@wso2-enterprise/choreo-core";
import { CellDiagram } from "../views/webviews/CellDiagram";

let projectWizard: WebviewWizard;
let componentWizard: WebviewWizard;

export function activateWizards() {
    const createProjectCmd = commands.registerCommand(createNewProjectCmdId, () => {
        if (!projectWizard || !projectWizard.getWebview()) {
            projectWizard = new WebviewWizard(ext.context.extensionUri, WizardTypes.projectCreation);
        }
        projectWizard.getWebview()?.reveal();
    });

    const createComponentCmd = commands.registerCommand(createNewComponentCmdId, () => {
        if (!componentWizard || !componentWizard.getWebview()) {
            componentWizard = new WebviewWizard(ext.context.extensionUri, WizardTypes.componentCreation);
        }
        componentWizard.getWebview()?.reveal();
    });

    ext.context.subscriptions.push(createProjectCmd, createComponentCmd);

    // Register Project Overview Wizard
    const projectOverview = commands.registerCommand(choreoProjectOverview, async (project: Project) => {
        let selectedProjectId = project ? project?.id : undefined;
        if (!selectedProjectId && await ext.api.isChoreoProject()) {
            const choreoProject = await ext.api.getChoreoProject();
            if (choreoProject) {
                selectedProjectId = choreoProject.id;
                project = choreoProject;
            }
        }
        if (!selectedProjectId) {
            return;
        }
        ext.api.selectedProjectId = selectedProjectId;
        const org: Organization | undefined = ext.api.selectedOrg;
        if (org !== undefined) {
            ProjectOverview.render(ext.context.extensionUri, project, org);
        }
    });

    ext.context.subscriptions.push(projectOverview);

    // Register Cell Diagram Wizard
    const cellDiagram = commands.registerCommand(choreoCellView, async (project: Project) => {
        let selectedProjectId = project ? project?.id : undefined;
        if (!selectedProjectId && await ext.api.isChoreoProject()) {
            const choreoProject = await ext.api.getChoreoProject();
            if (choreoProject) {
                selectedProjectId = choreoProject.id;
                project = choreoProject;
            }
        }
        if (!selectedProjectId) {
            return;
        }
        ext.api.selectedProjectId = selectedProjectId;
        const org: Organization | undefined = ext.api.selectedOrg;
        if (org !== undefined) {
            ProjectOverview.render(ext.context.extensionUri, project, org);
        }
    });

    ext.context.subscriptions.push(cellDiagram);
}
