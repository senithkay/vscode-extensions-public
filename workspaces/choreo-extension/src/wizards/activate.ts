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
import { createNewComponentCmdId, createNewProjectCmdId, choreoProjectOverview, choreoArchitectureViewCmdId } from "../constants";
import { ext } from "../extensionVariables";
import { WebviewWizard, WizardTypes } from "../views/webviews/WebviewWizard";
import { ProjectOverview } from "../views/webviews/ProjectOverview";
import { OPEN_READ_ONLY_PROJECT_OVERVIEW_PAGE, Organization, Project } from "@wso2-enterprise/choreo-core";
import { ChoreoArchitectureView } from "../views/webviews/ChoreoArchitectureView";
import { sendTelemetryEvent } from "../telemetry/utils";

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
        const isChoreoProject = await ext.api.isChoreoProject();
        if (!selectedProjectId && isChoreoProject) {
            const choreoProject = await ext.api.getChoreoProject();
            if (choreoProject) {
                selectedProjectId = choreoProject.id;
                project = choreoProject;
            }
        }
        if (selectedProjectId && !isChoreoProject) {
            sendTelemetryEvent(OPEN_READ_ONLY_PROJECT_OVERVIEW_PAGE, { "project": project?.name });
        } else if (selectedProjectId && isChoreoProject) {
            const choreoProject = await ext.api.getChoreoProject();
            const isCurrentProject = choreoProject?.id === selectedProjectId;
            if (!isCurrentProject) {
                sendTelemetryEvent(OPEN_READ_ONLY_PROJECT_OVERVIEW_PAGE, { "project": project?.name });
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
    const choreoArchitectureView = commands.registerCommand(choreoArchitectureViewCmdId, (orgName: string, projectId: string) => {
        ChoreoArchitectureView.render(ext.context.extensionUri, orgName, projectId);
    });

    ext.context.subscriptions.push(choreoArchitectureView);
}
