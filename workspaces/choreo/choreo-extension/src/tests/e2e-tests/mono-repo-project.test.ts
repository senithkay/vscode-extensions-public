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

import { describe, it } from "mocha";
import { join } from "path";
import { CHOREO_PROJECTS_PATH, AccountView, CommonUtils, ProjectView, SAMPLE_BAL_SERVICE_PATH } from "./resources";
import { ProjectWizardView } from "./resources/ProjectWizardView";
import { ComponentWizardView } from "./resources/ComponentWizardView";
import { GitProvider } from "@wso2-enterprise/choreo-core";

const PROJECT_NAME = "test_vscode_mono_repo_project";
const COMPONENT_NAME = `test_component_${new Date().getTime()}`;
const GIT_ORG_NAME = process.env.TEST_GITHUB_ORG!;
const GIT_REPO_NAME = process.env.TEST_GITHUB_MONO_REPO!;
const CLONED_REPO_PATH = join(CHOREO_PROJECTS_PATH, PROJECT_NAME, "repos", GIT_ORG_NAME, GIT_REPO_NAME);

describe("Test Mono-repo project using Github & manage ballerina service type component", () => {
    before(async () => {
        CommonUtils.validateEnv();
        CommonUtils.removeDir(join(CHOREO_PROJECTS_PATH, PROJECT_NAME));
        await CommonUtils.initializeVSCode();
        await CommonUtils.openChoreoActivity();
    });

    it("Sign into Choreo", async () => {
        await AccountView.signIntoChoreo();
        await ProjectView.deleteProjectIfAlreadyExists(PROJECT_NAME, CHOREO_PROJECTS_PATH, GitProvider.GITHUB);
    });

    it("Create new project & open it", async () => {
        await ProjectWizardView.createNewProject({
            projectName: PROJECT_NAME,
            projectPath: CHOREO_PROJECTS_PATH,
            monoRepoDetails: { provider: GitProvider.GITHUB, orgName: GIT_ORG_NAME, repoName: GIT_REPO_NAME },
        });
        await AccountView.verifyWithinProject();
    });

    it("Create new ballerina service component from scratch", async () => {
        CommonUtils.copyDirectory(SAMPLE_BAL_SERVICE_PATH, join(CLONED_REPO_PATH, COMPONENT_NAME));
        await CommonUtils.closeAllEditors();
        await ComponentWizardView.createNewComponent({
            componentName: COMPONENT_NAME,
            gitRepoName: GIT_REPO_NAME,
            gitProvider: GitProvider.GITHUB,
        });
    });

    it("Verify component in Architecture & Cell view", async () => {
        await CommonUtils.closeAllEditors();
        // Check whether the name from ballerina toml is available in Architecture diagram & cell diagram
        await ProjectView.verifyComponentWithinArchitectureView("sample_bal_service");
        await ProjectView.verifyComponentWithinCellView("sample_bal_service");
        await CommonUtils.closeAllEditors();
    });

    it("Delete component in from project & repo", async () => {
        await ProjectView.deleteComponent({
            componentName: COMPONENT_NAME,
            gitRepoName: GIT_REPO_NAME,
            gitProvider: GitProvider.GITHUB,
        });
        await CommonUtils.openChoreoActivity();
    });

    it("Delete project", async () => {
        await ProjectView.deleteCurrentlyOpenedProject();
    });

    after(async () => {
        await CommonUtils.removeAllFoldersFromRepo(CLONED_REPO_PATH, GIT_REPO_NAME, GitProvider.GITHUB);
    });
});
