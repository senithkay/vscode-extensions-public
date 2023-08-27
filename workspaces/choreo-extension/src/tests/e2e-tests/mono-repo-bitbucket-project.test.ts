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
import { CHOREO_PROJECTS_PATH, AccountView, CommonUtils, ProjectView } from "./resources";
import { ProjectWizardView } from "./resources/ProjectWizardView";
import { GitProvider } from "@wso2-enterprise/choreo-core";

const PROJECT_NAME = "test_vscode_bitbucket_mono_repo_project";
const WORKSPACE_NAME = process.env.TEST_BITBUCKET_WORKSPACE!;
const GIT_REPO_NAME = process.env.TEST_BITBUCKET_REPO!;
const CLONED_REPO_PATH = join(CHOREO_PROJECTS_PATH, PROJECT_NAME, "repos", WORKSPACE_NAME, GIT_REPO_NAME);

describe("Test Mono-repo project using Bitbucket", () => {
    before(async () => {
        CommonUtils.validateEnv();
        CommonUtils.removeDir(join(CHOREO_PROJECTS_PATH, PROJECT_NAME));
        await CommonUtils.initializeVSCode();
        await CommonUtils.openChoreoActivity();
    });

    it("Sign into Choreo", async () => {
        await AccountView.signIntoChoreo();
        await ProjectView.deleteProjectIfAlreadyExists(PROJECT_NAME, CHOREO_PROJECTS_PATH, GitProvider.BITBUCKET);
    });

    it("Create new project & open it", async () => {
        await ProjectWizardView.createNewProject({
            projectName: PROJECT_NAME,
            projectPath: CHOREO_PROJECTS_PATH,
            monoRepoDetails: {
                provider: GitProvider.BITBUCKET,
                credentialName: process.env.TEST_BITBUCKET_CHOREO_CREDENTIAL!,
                workspaceName: WORKSPACE_NAME,
                repoName: GIT_REPO_NAME,
            },
        });
        await AccountView.verifyWithinProject();
    });

    it("Delete project", async () => {
        await ProjectView.deleteCurrentlyOpenedProject();
    });

    after(async () => {
        await CommonUtils.removeAllFoldersFromRepo(CLONED_REPO_PATH, GIT_REPO_NAME, GitProvider.BITBUCKET);
    });
});
