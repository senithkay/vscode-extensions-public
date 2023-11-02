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

import { ActivityBar, By, ScmView, VSBrowser, Workbench } from "vscode-extension-tester";
import { GIT_PUSH_COMMAND, GIT_REFRESH_COMMAND, STAGE_CHANGES_COMMAND } from "./constants";
import { GitProvider } from "@wso2-enterprise/choreo-core";
import { CommonUtils } from "./CommonUtils";

/** Provider source control view related helper functions */
export class GitUtils {
    /** Commit and push local repo changes to remote repository */
    static async commitAndPushChanges(repoName: string, commitMsg: string, gitProvider: GitProvider) {
        console.log("Committing and pushing local changes");
        const driver = VSBrowser.instance.driver;
        const scmActivityView = await new ActivityBar().getViewControl("Source Control");
        if (!scmActivityView) {
            throw new Error("Source control view is not available");
        }
        const scmView: ScmView = (await scmActivityView.openView()) as any;
        const provider = await scmView.getProvider(repoName);

        if (!provider) {
            throw new Error("Git provider not found");
        }

        const workbench = new Workbench();
        await workbench.executeCommand(GIT_REFRESH_COMMAND);

        let changesCount = 0;
        try {
            changesCount = (await CommonUtils.waitUntilElements(By.className("resource"))).length;
        } catch {
            console.log("No changes found to commit and push");
        }

        if (changesCount) {
            console.log(`${changesCount} changes found to commit and push`);
            await workbench.executeCommand(STAGE_CHANGES_COMMAND);
            console.log("Waiting until changes are staged");
            await driver.wait(async () => (await provider?.getChanges()).length === 0, 10000);
            console.log("Committing local git changes");
            await provider?.commitChanges(commitMsg);
            console.log("Pushing changes to remote Github repository");
            await workbench.executeCommand(GIT_PUSH_COMMAND);
            await this.handleGitLogin(gitProvider);
            await driver.wait(
                async () => (await driver.findElements(By.xpath(`//*[contains(text(), "Sync Changes")]`))).length === 0,
                10000
            );
        }
    }

    /** Handler git authentications based on git provider */
    static async handleGitLogin(gitProvider?: GitProvider) {
        if (gitProvider === GitProvider.GITHUB) {
            console.log("Handling Github authentication");
            await this.handleGitHubLogin();
            console.log("Handling Bitbucket authentication");
        } else if (gitProvider === GitProvider.BITBUCKET) {
            await this.handleBitBucketLogin();
        }
    }

    /** Insert git username and password/PAT when prompted by VSCode */
    private static async insertLoginCredentials(username: string, password: string) {
        await CommonUtils.setQuickInputFieldValue({ inputValue: username, placeholder: "Username" });
        await CommonUtils.setQuickInputFieldValue({ inputValue: password, placeholder: "Password" });
    }

    /** Handle github login using test username and PAT */
    private static async handleGitHubLogin() {
        console.log("Authenticating user with GitHub");
        try {
            await CommonUtils.waitUntil(By.xpath(`//*[contains(text(), "wants to sign in using GitHub.")]`), 30000);
            await CommonUtils.waitAndClick(By.xpath("//*[@title='Close Dialog']"));
            await this.insertLoginCredentials(process.env.TEST_GITHUB_USERNAME!, process.env.TEST_GITHUB_PAT!);
        } catch {
            // Git auth modal was not shown.
            console.log("Could not login with github");
        }
    }

    /** Handle bitbucket login using test username and PAT */
    private static async handleBitBucketLogin() {
        console.log("Authenticating user with Bitbucket");
        try {
            await CommonUtils.waitUntil(By.xpath('//*[contains(text(),"https://bitbucket.org")]'), 20000);
            await this.insertLoginCredentials(
                process.env.TEST_BITBUCKET_USERNAME!,
                process.env.TEST_BITBUCKET_PASSWORD!
            );
        } catch {
            console.log("Could not login with bitbucket");
        }
    }
}
