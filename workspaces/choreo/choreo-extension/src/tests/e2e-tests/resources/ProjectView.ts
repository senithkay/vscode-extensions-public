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

import { Workbench, InputBox, By } from "vscode-extension-tester";
import { CELL_VIEW_COMMAND, DELETE_PROJECT, OPEN_CHOREO_PROJECT } from "./constants";
import { join } from "path";
import { CommonUtils } from "./CommonUtils";
import { GitProvider } from "@wso2-enterprise/choreo-core";
import { GitUtils } from "./GitUtils";
import { AccountView } from "./AccountView";

/** Provides functions to interact with the Project view iframe and project related features in the Choreo extension */
export class ProjectView {
    /** Delete project if that project already exists within user's organization */
    static async deleteProjectIfAlreadyExists(projectName: string, projectsPath: string, gitProvider?: GitProvider) {
        console.log("Checking if project already exists before creating it");
        const updatedPath = join(projectsPath, "temp");
        CommonUtils.removeDir(join(updatedPath, projectName));
        let projectExist = true;
        await new Workbench().executeCommand(OPEN_CHOREO_PROJECT);
        await CommonUtils.wait(5000);

        try {
            await CommonUtils.setQuickInputFieldValue({
                inputValue: projectName,
                placeholder: "Select a project to continue",
                waitForItemSelect: true,
            });
        } catch {
            console.log("Project name does not exist");
            projectExist = false;
            await new InputBox().cancel();
        }
        if (projectExist) {
            console.log("Project already exists, & therefore attempting to delete it");
            await CommonUtils.clickPromptButton(
                "Select Directory",
                "The selected project hasn't been cloned yet. Please select a directory where you'd like it to be cloned."
            );
            CommonUtils.createDir(join(updatedPath));
            await CommonUtils.setQuickInputFieldValue({
                inputValue: updatedPath,
                title: "Select a folder to create the Workspace",
            });
            await GitUtils.handleGitLogin(gitProvider);
            await CommonUtils.initializeVSCode();
            await CommonUtils.waitUntil(By.xpath('//a[@aria-label="Choreo"]'));
            await CommonUtils.waitForIFrameCount(2);
            await this.deleteCurrentlyOpenedProject();
        }
    }

    /** Delete the currently opened project by running the delete command */
    static async deleteCurrentlyOpenedProject() {
        console.log("Deleting currently opened project");
        await CommonUtils.switchToDefaultFrame();
        await AccountView.verifyWithinProject();
        await new Workbench().executeCommand(DELETE_PROJECT);
        await CommonUtils.clickPromptButton("Delete Project", "Please confirm the deletion of project");
        await CommonUtils.switchToIFrame("Project");
        await CommonUtils.waitUntilById("create-project-btn", 30000);
        await CommonUtils.switchToDefaultFrame();
        await CommonUtils.closeAllEditors();
        console.log("Deleted the currently opened project");
    }

    /** Verify whether the component name is visible within the cell view */
    static async verifyComponentWithinCellView(componentName: string) {
        console.log("Verifying component is visible in the cell view");
        await CommonUtils.switchToIFrame("Project");
        await CommonUtils.waitAndClick(By.xpath('//*[@title="Open Cell View"]'));
        await CommonUtils.switchToDefaultFrame();
        await CommonUtils.waitUntil(By.xpath('//a[contains(@class, "label-name") and text() = "Cell Diagram"]'));
        await CommonUtils.waitForIFrameCount(3);
        await CommonUtils.switchToIFrame("Cell Diagram");
        await CommonUtils.waitUntil(
            By.xpath(`//div[@data-nodeid="componentNode|${componentName}"]`),
            30000
        );
        await CommonUtils.switchToDefaultFrame();
    }

    /** Delete the component from Choreo as well as from the remote repository */
    static async deleteComponent(params: { componentName: string; gitRepoName: string; gitProvider: GitProvider }) {
        const { componentName, gitRepoName, gitProvider } = params;
        console.log(`Deleting component ${componentName}`);
        await CommonUtils.switchToIFrame("Project");
        await CommonUtils.waitAndClickById(`component-list-menu-${componentName}`);
        await CommonUtils.waitAndClickById("component-list-menu-delete");
        await CommonUtils.switchToDefaultFrame();

        await CommonUtils.clickPromptButton("Delete Component", "Are you sure you want to delete");

        await GitUtils.commitAndPushChanges(gitRepoName, `Delete component ${componentName}`, gitProvider);
    }
}
