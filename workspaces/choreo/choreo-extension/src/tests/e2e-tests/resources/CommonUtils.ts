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

import { expect } from "chai";
import * as dotenv from "dotenv";
import {
    ActivityBar,
    By,
    EditorView,
    InputBox,
    Key,
    Locator,
    ScmView,
    VSBrowser,
    Workbench,
    until,
} from "vscode-extension-tester";
import { ENABLE_DND_MODE, GIT_PUSH_COMMAND, STAGE_CHANGES_COMMAND } from "./constants";
import * as fs from "fs";
import { join } from "path";
import { GitProvider } from "@wso2-enterprise/choreo-core";
import { GitUtils } from "./GitUtils";

dotenv.config();

/** Provides set of functions that will allow us to interact using the vscode-extension-tester more easily */
export class CommonUtils {
    /** Validate whether all the required env variables are available */
    static validateEnv() {
        const requiredEnvVars = [
            "TEST_IDP_USERNAME",
            "TEST_IDP_PASSWORD",
            "TEST_USER_ORG_HANDLE",
            "TEST_GITHUB_USERNAME",
            "TEST_GITHUB_PAT",
            "TEST_GITHUB_ORG",
            "TEST_GITHUB_MONO_REPO",
            "TEST_BITBUCKET_USERNAME",
            "TEST_BITBUCKET_PASSWORD",
            "TEST_BITBUCKET_CHOREO_CREDENTIAL",
            "TEST_BITBUCKET_WORKSPACE",
            "TEST_BITBUCKET_REPO",
        ];

        requiredEnvVars.forEach((envVar) => {
            it(`should have the ${envVar} environment variable`, () => {
                expect(process.env[envVar]).to.exist;
            });
        });

        expect(process.env.TEST_CHOREO_EXT_ENV).to.be.oneOf(["dev", "stage", "prod"], "Invalid TEST_CHOREO_EXT_ENV");
    }

    /** Wait for X number of milliseconds */
    static async wait(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /** Open Choreo activity if its not already opened */
    static async openChoreoActivity() {
        console.log("Attempting to open Choreo Activity");
        const choreoActivityIcon = await this.waitUntil(By.xpath('//a[@aria-label="Choreo"]'));
        try {
            await this.waitUntil(By.xpath('//h2[@title="Choreo" and text()="Choreo"]'));
            console.log("Choreo activity is already opened");
        } catch {
            await choreoActivityIcon.click();
            await this.waitUntil(By.xpath('//h2[@title="Choreo" and text()="Choreo"]'));
            console.log("Opened Choreo activity");
        }
    }

    /** Wait until an element is located in the UI */
    static async waitUntil(locator: Locator, timeout = 10000) {
        return VSBrowser.instance.driver.wait(until.elementLocated(locator), timeout);
    }

    /** Wait until elements are located in the UI*/
    static async waitUntilElements(locator: Locator, timeout = 10000) {
        return VSBrowser.instance.driver.wait(until.elementsLocated(locator), timeout);
    }

    /** Click and element after waiting until it is located in the UI */
    static async waitAndClick(locator: Locator, timeout = 10000) {
        const element = await this.waitUntil(locator, timeout);
        await element.click();
    }

    /** Wait until an element with a particular ID is located in the UI */
    static async waitUntilById(id: string, timeout = 10000) {
        return this.waitUntil(By.id(id), timeout);
    }

    /** Click and element after after waiting until an element with a particular ID is located in the UI */
    static async waitAndClickById(id: string, timeout = 10000) {
        const element = await this.waitUntilById(id, timeout);
        await VSBrowser.instance.driver.wait(async () => await element.isEnabled(), 20000);
        await element.click();
    }

    /** Type text after after waiting until an element with a particular ID is located in the UI */
    static async waitAndTypeById(id: string, text: string, timeout = 10000) {
        const element = await this.waitUntilById(id, timeout);
        await element.sendKeys(text);
    }

    /** Type text & press Enter key, after after waiting until an element with a particular ID is located in the UI */
    static async waitAndTypeInAutoComplete(locator: Locator, text: string, timeout = 10000) {
        const element = await this.waitUntil(locator, timeout);
        await element.clear();
        await element.sendKeys(text);
        await element.sendKeys(Key.ENTER);
    }

    /** Wait for new instance of VSCode to initialize */
    static async initializeVSCode() {
        console.log("Initializing new instance of VSCode");
        // wait for new instance of vscode to open and extensions to initialize
        await this.wait(5000);
        await VSBrowser.instance.waitForWorkbench();
        await this.closeAllEditors();
        try {
            // Enabling DND mode so that notifications do not interfere with the UI elements
            await this.waitUntil(By.xpath("//div[@id='status.notifications' and @aria-label='Notifications']"), 10000);
            await new Workbench().executeCommand(ENABLE_DND_MODE);
        } catch {
            // dnd mode already enabled
        }
    }

    /** Enter a value in the quick pick input field and confirm */
    static async setQuickInputFieldValue(
        params: { inputValue: string; waitForItemSelect?: boolean } & ({ placeholder: string } | { title: string })
    ) {
        if ("placeHolder" in params) {
            console.log(`Entering value into quick input field for ${params.placeHolder}`);
            await this.waitUntil(
                By.xpath(`//div[@class="quick-input-header"]//input[@placeholder="${params.placeHolder}"]`)
            );
        } else if ("title" in params) {
            console.log(`Entering value into quick input field for ${params.title}`);
            await this.waitUntil(
                By.xpath(`//div[contains(@class, 'quick-input-title') and contains(text(), '${params.title}')]`)
            );
        }

        // Wait 500ms for the input box to be interactive
        await CommonUtils.wait(500);

        const inputBox = new InputBox();
        await inputBox.setText(params.inputValue);
        if (params.waitForItemSelect) {
            await this.waitUntil(
                By.xpath(`//div[@class='quick-input-list-entry']//*[contains(text(), '${params.inputValue}')]`)
            );
        }
        await inputBox.confirm();
        console.log("Confirming quick input selection");
    }

    /** Wait for an element in the UI to disappear */
    static async waitForDisappear(locator: Locator, timeout: number = 10000) {
        await VSBrowser.instance.driver.wait(async () => {
            try {
                await this.waitUntil(locator, 1000);
                return false;
            } catch {
                return true;
            }
        }, timeout);
    }

    /** Wait for an element with a particular ID, in the UI to disappear */
    static async waitForIdToDisappear(elementId: string, timeout: number = 10000) {
        await this.waitForDisappear(By.id(elementId), timeout);
    }

    /** Click buttons in prompts or modals */
    static async clickPromptButton(btnText: string, promptMessageTextContains?: string, timeout: number = 15000) {
        await this.switchToDefaultFrame();
        if (promptMessageTextContains) {
            await CommonUtils.waitUntil(By.xpath(`//*[contains(text(), "${promptMessageTextContains}")]`), timeout);
        }
        await this.waitAndClick(By.xpath(`//*[text()="${btnText}"]`));
    }

    /** Wait until a certain number of iFrames appear in the screen. */
    static async waitForIFrameCount(iframeCount: number, timeout: number = 10000) {
        const driver = VSBrowser.instance.driver;
        await driver.wait(async () => (await driver.findElements(By.xpath("//iframe"))).length >= iframeCount, timeout);
    }

    /** Switch to an iFrame in the UI base on the title of the iFrame */
    static async switchToIFrame(
        frameName:
            | "Account"
            | "Project"
            | "Create New Project"
            | "Create New Component"
            | "Architecture View"
            | "Cell View"
    ) {
        console.log(`Switching to iframe: ${frameName}`);
        await this.switchToDefaultFrame();
        const driver = VSBrowser.instance.driver;
        const allIFrames = await this.waitUntilElements(By.xpath("//iframe"));
        for (const iframeItem of allIFrames) {
            try {
                await driver.switchTo().frame(iframeItem);
                try {
                    const frameElement = await this.waitUntil(By.xpath(`//iframe[@title='${frameName}']`), 500);
                    await driver.switchTo().frame(frameElement);
                    return frameElement;
                } catch {
                    // Go back to root level if unable to find the frame name
                    await driver.switchTo().parentFrame();
                }
            } catch {
                // no need to handle this catch block
            }
        }

        throw new Error(`IFrame of ${frameName} not found`);
    }

    /** Switch back to the detauls IFrame */
    static async switchToDefaultFrame() {
        await VSBrowser.instance.driver.switchTo().defaultContent();
    }

    /** Close all editors within the workspace */
    static async closeAllEditors() {
        await new EditorView().closeAllEditors();
    }

    /** Remove a directory if it exists, from a given path */
    static removeDir(folderPath: string) {
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
        }
    }

    /** Create a new directory if does not already exist */
    static createDir(folderPath: string) {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
    }

    /** Delete all folders except the .git folder, within the repo.  */
    static deleteFoldersInRepo(folderPath: string) {
        const files = fs.readdirSync(folderPath);
        files.forEach((file) => {
            const filePath = join(folderPath, file);
            const stats = fs.statSync(filePath);
            if (![".git", "README.md"].includes(file) && stats.isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true });
            }
        });
    }

    /** Check if there are folders that needs to be removed within the repo */
    static hasFoldersInRepo(repoPath: string) {
        if (fs.existsSync(repoPath)) {
            const files = fs.readdirSync(repoPath);
            for (const file of files) {
                if ([".git", "README.md"].includes(file)) {
                    continue; // Ignore .git folder
                }
                const filePath = join(repoPath, file);
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    return true; // At least one folder found
                }
            }
        }
        return false;
    }

    /** Copy entire directory from one location to another */
    static copyDirectory(source: string, destination: string) {
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination);
        }
    
        const files = fs.readdirSync(source);
    
        files.forEach(file => {
            const srcPath = join(source, file);
            const destPath = join(destination, file);
            const isDirectory = fs.lstatSync(srcPath).isDirectory();
    
            if (isDirectory) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }
    

    /**
     * Delete all folders in the local and remote repo.
     * This is needed to clear unused files in the repo
     */
    static async removeAllFoldersFromRepo(clonedRepoPath: string, repoName: string, gitProvider: GitProvider) {
        if (CommonUtils.hasFoldersInRepo(clonedRepoPath)) {
            console.log("Repo has folders that needs to be deleted");
            CommonUtils.deleteFoldersInRepo(clonedRepoPath);
            await GitUtils.commitAndPushChanges(repoName, `Delete obsolete directories`, gitProvider);
        }
    }

    /** Read text value that is copied in clipboard */
    static async getValueFromClipboard() {
        const driver = VSBrowser.instance.driver;
        // create a hidden input element
        const input = await driver.executeScript(`
        const input = document.createElement('input');
        input.style.opacity = 0;
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        document.body.appendChild(input);
        return input;
    `);

        // copy value to the input element
        await driver.executeScript(` document.execCommand('copy');`, input, "test value");

        // retrieve value from input element
        const value = await driver.executeScript(
            `
        const input = arguments[0];
        input.select();
        document.execCommand('paste');
        return input.value;
    `,
            input
        );

        // remove input element from DOM
        await driver.executeScript(
            `
        const input = arguments[0];
        input.remove();
    `,
            input
        );

        // return value as a string
        return value as string;
    }
}
