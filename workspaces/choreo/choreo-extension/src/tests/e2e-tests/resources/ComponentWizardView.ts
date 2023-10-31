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

import { Workbench, VSBrowser } from "vscode-extension-tester";
import { ADD_CHOREO_COMPONENT_COMMAND } from "./constants";
import { CommonUtils } from "./CommonUtils";
import { GitProvider } from "@wso2-enterprise/choreo-core";
import { GitUtils } from "./GitUtils";

/** Provides functions to interact with the component wizard view iframe in the Choreo extension */
export class ComponentWizardView {
    /** Create a new component within opened project */
    static async createNewComponent(params: { componentName: string; gitRepoName: string; gitProvider: GitProvider }) {
        const { componentName, gitRepoName, gitProvider } = params;

        console.log(`Creating new component: ${componentName}`);
        await CommonUtils.switchToDefaultFrame();
        await new Workbench().executeCommand(ADD_CHOREO_COMPONENT_COMMAND);
        await CommonUtils.setQuickInputFieldValue({ inputValue: "From scratch", title: "Create Component" });

        await CommonUtils.waitForIFrameCount(3);
        await CommonUtils.switchToIFrame("Create New Component");
        await CommonUtils.waitUntilById("card-select-service");
        await CommonUtils.waitAndClickById("wizard-next-btn");
        await CommonUtils.waitAndTypeById("component-name-input", componentName);
        await CommonUtils.waitAndClickById("wizard-next-btn");
        await CommonUtils.waitUntilById("directory-select-input");
        await CommonUtils.waitAndClickById("wizard-save-btn");
        await CommonUtils.switchToDefaultFrame();

        await CommonUtils.switchToIFrame("Project");
        await CommonUtils.waitUntilById(`component-card-header-${componentName}`, 20000);
        console.log("Newly created component card is visible");
        await CommonUtils.waitAndClickById("alert-btn-sync-all", 15000);
        console.log("Syncing local component changes with remote repo");
        await CommonUtils.switchToDefaultFrame();

        await GitUtils.commitAndPushChanges(gitRepoName, `Add component ${componentName}`, gitProvider);

        await CommonUtils.openChoreoActivity();
        await CommonUtils.switchToIFrame("Project");
        await CommonUtils.waitForIdToDisappear("project-view-progress");
        await CommonUtils.waitForIdToDisappear("alert-btn-sync-all");
        console.log("Component sync button no longer exists");
        await CommonUtils.waitUntilById(`${componentName}-tag-Local`);
        console.log("Pushing component to Choreo");
        await CommonUtils.waitAndClickById("alert-btn-push-all");
        await CommonUtils.waitForIdToDisappear(`${componentName}-tag-Local`, 30000);
        console.log("Component successfully pushed to Choreo");

        await CommonUtils.switchToDefaultFrame();
    }
}
