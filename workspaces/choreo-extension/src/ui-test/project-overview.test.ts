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

import assert = require("assert");
import { expect } from "chai";
import { describe, it } from "mocha";
import { join } from "path";
import { By, EditorView, VSBrowser, WebView, Workbench, InputBox, TextEditor } from 'vscode-extension-tester';
import { ADD_CHOREO_PROJECT_COMMAND, COMMIT_STAGED_COMMAND, DELETE_PROJECT_COMMAND, GIT_PUSH_COMMAND, OPEN_PROJECT_COMMAND, SIGN_IN_COMMAND, SIGN_IN_WITH_CODE_COMMAND, STAGE_CHANGES_COMMAND, TEST_DATA_ROOT, wait } from "./resources";
import { chromium } from "playwright-core";
import * as dotenv from "dotenv";
import * as fsExtra from 'fs-extra';

dotenv.config();

const PROJECT_NAME = "test_vscode";
const GIT_REPO_NAME = "vscode-test-1";
const GIT_ORG_NAME = "choreo-test-apps";
const COMPONENT_NAME = "test-component-1";

describe("Project overview tests", () => {
    let editor: EditorView;
    let diagramWebview: WebView;
    let workbench: Workbench;

    before(async () => {
        expect(process.env.TEST_IDP_USERNAME).to.be.a("string");
        expect(process.env.TEST_IDP_PASSWORD).to.be.a("string");
        expect(process.env.TEST_GITHUB_USERNAME).to.be.a("string");
        expect(process.env.TEST_GITHUB_PAT).to.be.a("string");

        if(fsExtra.existsSync(join(TEST_DATA_ROOT, PROJECT_NAME))){
            fsExtra.removeSync(join(TEST_DATA_ROOT, PROJECT_NAME));
        }
        
        await VSBrowser.instance.waitForWorkbench();

        workbench = new Workbench();
        VSBrowser.instance.openResources();
        await wait(6000);

        editor = new EditorView();
        await editor.closeAllEditors();
        await wait(2000);
    });

    it("Login to Choreo", async () => {
        await workbench.executeCommand(SIGN_IN_COMMAND);
        await wait(5000);

        const authUrl = await getExternalLinkURL();
        const authUrlWithTestIdp = authUrl.replace('google', 'choreoe2etest');

        const browser = await chromium.launch({
            headless: process.env.CI ? true : false, 
            executablePath: '/usr/bin/chromium-browser', // TODO: Check if this works in CI and other OS
        });
        const page = await browser.newPage();
        await page.goto(authUrlWithTestIdp);
        await page.waitForSelector('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        await page.type('#usernameUserInput', process.env.TEST_IDP_USERNAME!);
        await page.type('#password', process.env.TEST_IDP_PASSWORD!);
        await page.click('button[type="submit"]');
        await wait(10000);
        await page.waitForLoadState('networkidle');
        const pageUrlStr = page.url();
        await browser.close();

        const pageUrl = new URL(pageUrlStr);
        const params = new URLSearchParams(pageUrl.search);
        const code = params.get("code"); 
        expect(code).not.null;

        if(code){
            await workbench.executeCommand(SIGN_IN_WITH_CODE_COMMAND);
            await wait(1000);
            const inputBox = new InputBox();
            await inputBox.setText(code);
            await inputBox.confirm();
        }
    });

    it("Create new project", async () => {
        await wait(10000);
        await workbench.executeCommand(ADD_CHOREO_PROJECT_COMMAND);
        await wait(30000);  // todo: need a better alternative than waiting 30 seconds

        diagramWebview = new WebView();
        await diagramWebview.switchToFrame();

        const projectNameInput = await diagramWebview.findWebElement(By.id("project-name-input"));
        await projectNameInput.sendKeys(PROJECT_NAME);

        const gitOrgSelect = await diagramWebview.findWebElement(By.id("org-drop-down"));
        await gitOrgSelect.click();
        const orgOption = await diagramWebview.findWebElement(By.id(`org-item-${GIT_ORG_NAME}`));
        await orgOption.click();
        
        await wait(1000);
        const repoSelect = await diagramWebview.findWebElement(By.id("repo-drop-down"));
        await repoSelect.click();

        const repoOption = await diagramWebview.findWebElement(By.id(`repo-item-${GIT_REPO_NAME}`));
        await repoOption.click();

        const projectCreateBtn = await diagramWebview.findWebElement(By.id("create-project-btn"));
        await projectCreateBtn.click();
        await wait(10000);

        await diagramWebview.switchToFrame();

        const cloneButton = await diagramWebview.findWebElement(By.id("clone-project"));
        await cloneButton.click();
        await diagramWebview.switchBack();

        const inputBox = new InputBox();
        await inputBox.setText(TEST_DATA_ROOT);
        await inputBox.sendKeys('\uE007');
        await wait(5000);

        await handleGitHubLogin();

        await wait(20000);
    });

    it("Create new component", async () => {
        await wait(10000);

        diagramWebview = new WebView();
        await diagramWebview.switchToFrame();
        const componentCreateBtn = await diagramWebview.findWebElement(By.id("add-component-btn"));
        await componentCreateBtn.click();
        await diagramWebview.switchBack();
        await wait(3000);

        editor = new EditorView();
        await editor.closeEditor('Project Overview', 0);
        await editor.closeEditor('Welcome', 0);
        await wait(5000);

        diagramWebview = new WebView(editor);
        await diagramWebview.switchToFrame();
        const nextButton = await diagramWebview.findWebElement(By.id("wizard-next-btn"));
        await nextButton.click();
        await wait(1000);

        const componentNameInput = await diagramWebview.findWebElement(By.id("component-name-input"));
        await componentNameInput.sendKeys(COMPONENT_NAME);

        const nextButton2 = await diagramWebview.findWebElement(By.id("wizard-next-btn"));
        await nextButton2.click();

        await wait(30000);  // todo: need a better alternative than waiting 30 seconds

        const createButton = await diagramWebview.findWebElement(By.id("wizard-save-btn"));
        await createButton.click();

        await diagramWebview.switchBack();

        await commitAndPushChanges(workbench, editor, "add component");

        await wait(5000);
        await workbench.executeCommand(OPEN_PROJECT_COMMAND);

        await wait(12000);
        await diagramWebview.switchToFrame();
        const pushToChoreoBtn = await diagramWebview.findWebElement(By.id("push-to-choreo-btn"));
        await pushToChoreoBtn.click();

        await wait(15000);
    });

    it("Delete component", async () => {
        const componentMenu = await diagramWebview.findWebElement(By.id("component-list-menu-btn-0"));
        await componentMenu.click();

        const componentDelete = await diagramWebview.findWebElement(By.id("component-list-menu-delete"));
        await componentDelete.click();
        await diagramWebview.switchBack();

        await wait(2000);
        const deleteCOnfirmBtn = await editor.findElement(By.xpath('//*[text()="Delete Component"]'));
        await deleteCOnfirmBtn.click();

        await commitAndPushChanges(workbench, editor, "delete component");
    });

    after(async ()=>{
        // Need to delete project and local files after the test run
        // If this fails, we need to manually login and delete the project overselves
        await wait(10000);

        editor = new EditorView();
        await editor.closeAllEditors();

        await workbench.executeCommand(DELETE_PROJECT_COMMAND);
        await wait(1000);
        const inputBox = new InputBox();
        await inputBox.setText(PROJECT_NAME);
        await inputBox.confirm();
        await wait(10000);

        fsExtra.removeSync(join(TEST_DATA_ROOT, PROJECT_NAME));
    });
});

async function commitAndPushChanges(workbench: Workbench, editor: EditorView, commitMsg: string): Promise<void> {
    await wait(5000);
    await workbench.executeCommand(STAGE_CHANGES_COMMAND);
    await wait(2000);
    await workbench.executeCommand(COMMIT_STAGED_COMMAND);
    await wait(2000);

    const editorText = new TextEditor();
    await editorText.typeTextAt(1,1,commitMsg);
    await editorText.save();
    await wait(1000);

    await editor.closeEditor('COMMIT_EDITMSG');
    await wait(3000);

    await workbench.executeCommand(GIT_PUSH_COMMAND);
    await wait(5000);
}

async function handleGitHubLogin(): Promise<void> {
    const driver = VSBrowser.instance.driver;
    await driver.wait(async () => (await driver.getAllWindowHandles()).length === 2);
    const handles = await driver.getAllWindowHandles();
    const promptHandle = handles[0];
    await driver.switchTo().window(promptHandle);
    const [,,cancelButton] = await driver.findElements(By.xpath('//*[contains(text(), "Cancel")]'));
    expect(cancelButton).is.not.undefined;
    await cancelButton.click();
    await wait(2000);
    const userNameBox = new InputBox();
    await userNameBox.setText(process.env.TEST_GITHUB_USERNAME!);
    await userNameBox.confirm();
    await wait(2000);
    const passwordBox = new InputBox();
    await passwordBox.setText(process.env.TEST_GITHUB_PAT!);
    await passwordBox.confirm();
}


async function getExternalLinkURL(): Promise<string> {
    const driver = VSBrowser.instance.driver;
    await driver.wait(async () => (await driver.getAllWindowHandles()).length === 2);
    const handles = await driver.getAllWindowHandles();
    const promptHandle = handles[0];
    await driver.switchTo().window(promptHandle);
    const copyButton = await driver.findElement(By.xpath('//*[contains(text(), "Copy")]'));
    await copyButton.click();
    const urlText = await getValueFromClipboard();
    return urlText;
}



async function getValueFromClipboard(): Promise<string> {
    // create a hidden input element
    const input = await VSBrowser.instance.driver.executeScript(`
        const input = document.createElement('input');
        input.style.opacity = 0;
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        document.body.appendChild(input);
        return input;
    `);

    // copy value to the input element
    await VSBrowser.instance.driver.executeScript(`
        document.execCommand('copy');
    `, input, 'test value');

    // retrieve value from input element
    const value = await VSBrowser.instance.driver.executeScript(`
        const input = arguments[0];
        input.select();
        document.execCommand('paste');
        return input.value;
    `, input);

    // remove input element from DOM
    await VSBrowser.instance.driver.executeScript(`
        const input = arguments[0];
        input.remove();
    `, input);

    // return value as a string
    return value as string;
}
