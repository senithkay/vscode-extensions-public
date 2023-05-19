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
import { By, EditorView, VSBrowser, WebView, Workbench, InputBox, ActivityBar } from 'vscode-extension-tester';
import { ADD_CHOREO_PROJECT_COMMAND, OPEN_PROJECT_COMMAND, TEST_DATA_ROOT, commitAndPushChanges, deleteFoldersRecursively, deleteProject, handleGitHubLogin, hasFoldersInRepository, signIntoChoreo, wait } from "./resources";
import * as dotenv from "dotenv";
import * as fs from 'fs';

dotenv.config();

const PROJECT_NAME = "test_vscode";
const GIT_REPO_NAME = "vscode-test-1";
const GIT_ORG_NAME = "choreo-test-apps";
const COMPONENT_NAME = `test_component_${new Date().getTime()}`;

describe("Project overview tests", () => {
    let editor: EditorView;
    let diagramWebview: WebView;
    let workbench: Workbench;

    before(async () => {
        expect(process.env.TEST_IDP_USERNAME).to.be.a("string");
        expect(process.env.TEST_IDP_PASSWORD).to.be.a("string");
        expect(process.env.TEST_GITHUB_USERNAME).to.be.a("string");
        expect(process.env.TEST_GITHUB_PAT).to.be.a("string");

        if (fs.existsSync(join(TEST_DATA_ROOT, PROJECT_NAME))) {
            fs.rmSync(join(TEST_DATA_ROOT, PROJECT_NAME), { recursive: true, force: true });
        }

        await VSBrowser.instance.waitForWorkbench();

        workbench = new Workbench();
        VSBrowser.instance.openResources();
        await wait(6000);

        editor = new EditorView();
        await editor.closeAllEditors();
        await wait(2000);

        const activityBar = new ActivityBar();
        const choreoActivityIcon = await activityBar.getViewControl("WSO2 Choreo");
        await choreoActivityIcon?.click();
        await wait(2000);

        await signIntoChoreo(editor, workbench);
        await deleteProject(PROJECT_NAME);
    });

    it("Create new project", async () => {
        await wait(10000);
        await workbench.executeCommand(ADD_CHOREO_PROJECT_COMMAND);
        await wait(30000);

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
        expect(await projectCreateBtn.isEnabled()).to.be.true;
        await projectCreateBtn.click();
        await wait(15000);
    });

    it("Clone the project", async () => {
        await diagramWebview.switchToFrame();

        const componentMenus = await diagramWebview.findWebElements(By.id("component-list-menu-btn-0"));
        expect(componentMenus).to.have.lengthOf(0);

        const cloneButton = await diagramWebview.findWebElement(By.id("clone-project"));
        expect(await cloneButton.isEnabled()).to.be.true;
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
        diagramWebview = new WebView();
        await diagramWebview.switchToFrame();
        const componentCreateBtn = await diagramWebview.findWebElement(By.id("add-component-btn"));
        expect(await componentCreateBtn.isEnabled()).to.be.true;
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
        expect(await nextButton.isEnabled()).to.be.true;
        await nextButton.click();
        await wait(1000);

        const componentNameInput = await diagramWebview.findWebElement(By.id("component-name-input"));
        await componentNameInput.sendKeys(COMPONENT_NAME);

        const wizardNextButton = await diagramWebview.findWebElement(By.id("wizard-next-btn"));
        expect(await wizardNextButton.isEnabled()).to.be.true;
        await wizardNextButton.click();

        await wait(30000);
        const createButton = await diagramWebview.findWebElement(By.id("wizard-save-btn"));
        expect(await createButton.isEnabled()).to.be.true;
        await createButton.click();

        await diagramWebview.switchBack();

        await commitAndPushChanges(workbench, editor, "add component");

        await wait(5000);
        await workbench.executeCommand(OPEN_PROJECT_COMMAND);

        await wait(12000);
        await diagramWebview.switchToFrame();
        const pushToChoreoBtn = await diagramWebview.findWebElement(By.id("push-to-choreo-btn"));
        expect(await pushToChoreoBtn.isEnabled()).to.be.true;
        await pushToChoreoBtn.click();

        await wait(15000);
    });

    it("Delete component", async () => {
        const componentMenu = await diagramWebview.findWebElement(By.id("component-list-menu-btn-0"));
        await componentMenu.click();

        const componentDelete = await diagramWebview.findWebElement(By.id("component-list-menu-delete"));
        expect(await componentDelete.isEnabled()).to.be.true;
        await componentDelete.click();
        await diagramWebview.switchBack();

        await wait(2000);
        const deleteConfirmBtn = await editor.findElement(By.xpath('//*[text()="Delete Component"]'));
        await deleteConfirmBtn.click();

        await commitAndPushChanges(workbench, editor, "delete component");
    });

    after(async () => {
        // Need to delete project and local files after the test run
        await wait(10000);

        editor = new EditorView();
        await editor.closeAllEditors();

        await deleteProject(PROJECT_NAME);
        
        if (hasFoldersInRepository(join(TEST_DATA_ROOT, PROJECT_NAME, 'repos', GIT_ORG_NAME, GIT_REPO_NAME))) {
            deleteFoldersRecursively(join(TEST_DATA_ROOT, PROJECT_NAME, 'repos', GIT_ORG_NAME, GIT_REPO_NAME));
            await commitAndPushChanges(workbench, editor, "delete everything");
        }
    });
});
