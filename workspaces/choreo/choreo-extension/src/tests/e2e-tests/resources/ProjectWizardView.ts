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

import { Workbench, VSBrowser, By } from "vscode-extension-tester";
import { ADD_CHOREO_PROJECT_COMMAND } from "./constants";
import { CommonUtils } from "./CommonUtils";
import { join } from "path";
import { GitProvider } from "@wso2-enterprise/choreo-core";
import { GitUtils } from "./GitUtils";

/** Provides functions to interact with the project wizard view iframe in the Choreo extension */
export class ProjectWizardView {
    /** Configure github related details relevant for the mono-repo */
    private static async selectGithubRepo(gitOrgName: string, gitRepoName: string) {
        await CommonUtils.waitAndClickById("GitHub-card");
        await CommonUtils.waitForIdToDisappear("project-repo-progress", 30000);
        await CommonUtils.waitAndTypeInAutoComplete(By.id("git-org-selector"), gitOrgName, 60000);
        await CommonUtils.waitAndTypeInAutoComplete(By.id("git-repo-selector"), gitRepoName);
        await CommonUtils.waitForIdToDisappear("project-repo-progress");
        await CommonUtils.waitAndTypeInAutoComplete(By.id("git-branch-selector"), "main");
    }

    /** Configure bitbucket related details relevant for the mono-repo */
    private static async selectBitbucketRepo(credentialName: string, workspaceName: string, repoName: string) {
        await CommonUtils.waitAndClickById("BitBucket-card");
        await CommonUtils.waitForIdToDisappear("bitbucket-credential-progress");
        await CommonUtils.waitAndClickById("cred-drop-down");
        await CommonUtils.waitAndClickById(`cred-item-${credentialName}`);
        await CommonUtils.waitAndClickById("cred-drop-down");
        await CommonUtils.waitAndTypeInAutoComplete(By.id("bitbucket-workspace-select"), workspaceName, 60000);
        await CommonUtils.waitAndTypeInAutoComplete(By.id("bitbucket-repo-select"), repoName);
        await CommonUtils.waitForIdToDisappear("project-repo-progress");
        await CommonUtils.waitAndTypeInAutoComplete(By.id("git-branch-selector"), "main");
    }

    /** Create a new project within user's org & open it within the current window */
    static async createNewProject(params: {
        projectName: string;
        projectPath: string;
        monoRepoDetails?:
            | { provider: GitProvider.GITHUB; orgName: string; repoName: string }
            | { provider: GitProvider.BITBUCKET; credentialName: string; workspaceName: string; repoName: string };
    }) {
        const { projectName, projectPath, monoRepoDetails } = params;

        console.log(`Creating new project: ${projectName}`);
        await CommonUtils.switchToDefaultFrame();
        await new Workbench().executeCommand(ADD_CHOREO_PROJECT_COMMAND);
        await CommonUtils.setQuickInputFieldValue({
            inputValue: process.env.TEST_USER_ORG_HANDLE!,
            title: "Select Organization",
        });

        await CommonUtils.switchToIFrame("Create New Project");
        await CommonUtils.waitUntil(By.xpath('//h3[contains(text(), "Project Details")]'));
        await CommonUtils.waitAndTypeById("project-name-input", projectName);

        if (!monoRepoDetails) {
            console.log("Selecting multi-repo in project config");
            await CommonUtils.waitAndClickById("Repository-card");
        } else if (monoRepoDetails.provider === GitProvider.GITHUB) {
            console.log("Configuring Github mono repo");
            await this.selectGithubRepo(monoRepoDetails.orgName, monoRepoDetails.repoName);
        } else if (monoRepoDetails.provider === GitProvider.BITBUCKET) {
            console.log("Configuring BitBucket mono repo");
            await this.selectBitbucketRepo(
                monoRepoDetails.credentialName,
                monoRepoDetails.workspaceName,
                monoRepoDetails.repoName
            );
        }

        await CommonUtils.waitAndClickById("select-project-dir-btn");
        await CommonUtils.switchToDefaultFrame();
        CommonUtils.createDir(join(projectPath));
        await CommonUtils.setQuickInputFieldValue({
            inputValue: projectPath,
            title: "Select a folder to create the Workspace",
        });
        await CommonUtils.switchToIFrame("Create New Project");
        await CommonUtils.waitAndClickById("create-project-btn");
        await CommonUtils.switchToDefaultFrame();

        await GitUtils.handleGitLogin(monoRepoDetails?.provider);

        console.log("Opening newly created project in the current window");
        await CommonUtils.clickPromptButton("Current Window", "Where do you want to open the project?", 30000);

        await CommonUtils.initializeVSCode();
        await CommonUtils.openChoreoActivity();
    }
}
