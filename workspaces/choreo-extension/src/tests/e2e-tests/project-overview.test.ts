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
import { By, EditorView, VSBrowser, WebView, Workbench, InputBox, ActivityBar, until, WebDriver, SideBarView, CustomEditor, CustomTreeSection, WelcomeContentSection, WebElement, Key, } from 'vscode-extension-tester';
import { ADD_CHOREO_PROJECT_COMMAND, OPEN_PROJECT_COMMAND, CHOREO_PROJECTS_PATH, commitAndPushChanges, deleteFoldersRecursively, handleGitHubLogin, hasFoldersInRepository, signIntoChoreo, switchToIFrame, wait, waitUntil, waitAndClickById, waitAndTypeById, setQuickInputFieldValue, waitAndTypeInAutoComplete, clickPromptButton, removeDir, createDir, dismissAllNotifications, waitUntilById, openChoreoActivity, deleteCurrentlyOpenedProject, deleteProjectIfAlreadyExist } from "./resources";
import * as fs from 'fs';

const PROJECT_NAME = "test_vscode_project";
const GIT_REPO_NAME = "vscode-ext-tests-dev";   // todo: take this to env
const GIT_ORG_NAME = "choreo-test-apps";    // todo: take this to env
const COMPONENT_NAME = `test_component_${new Date().getTime()}`;

// todo: change title & file name as Choreo project test
describe("Project overview tests", () => {
    // todo: Delete following if not used
    let editor: EditorView;
    let diagramWebview: WebView;
    let workbench: Workbench;

    before(async () => {
        removeDir(join(CHOREO_PROJECTS_PATH, PROJECT_NAME));
        await wait(5000);   // wait for new instance of vscode to open and extensions to initialize
        await VSBrowser.instance.waitForWorkbench();
        await openChoreoActivity()
;       await signIntoChoreo();
        await deleteProjectIfAlreadyExist(PROJECT_NAME, CHOREO_PROJECTS_PATH);
        // await deleteProject(PROJECT_NAME);

        // delete if project already available
    });
    

    it.only("Create new project", async () => {
        await new Workbench().executeCommand(ADD_CHOREO_PROJECT_COMMAND);
        await setQuickInputFieldValue({inputValue:process.env.TEST_USER_ORG_HANDLE!, title: "Select Organization" });
        await switchToIFrame("Create New Project");
        await waitUntil(By.xpath('//h3[contains(text(), "Project Details")]'));
        await waitAndTypeById("project-name-input", PROJECT_NAME);
        await waitAndClickById("GitHub-card");
        await waitAndTypeInAutoComplete(By.xpath("//*[@id='git-org-selector' and @data-loading='false']"), GIT_ORG_NAME, 60000);
        await waitAndTypeInAutoComplete(By.xpath("//*[@id='git-repo-selector' and @data-loading='false']"), GIT_REPO_NAME);
        await waitAndTypeInAutoComplete(By.xpath("//*[@id='git-branch-selector' and @data-loading='false']"), "main");
        await waitAndClickById("select-project-dir-btn");
        await VSBrowser.instance.driver.switchTo().defaultContent();
        createDir(join(CHOREO_PROJECTS_PATH));
        await setQuickInputFieldValue({inputValue:CHOREO_PROJECTS_PATH, title: "Select a folder to create the Workspace" });
        await dismissAllNotifications();
        await switchToIFrame("Create New Project");
        await waitAndClickById("create-project-btn");
        await handleGitHubLogin();
        await VSBrowser.instance.driver.switchTo().defaultContent();
        await clickPromptButton("Current Window");

        // After opening the newly created project in a new window
        await wait(5000);   // wait for new instance of vscode to open and extensions to initialize
        await VSBrowser.instance.waitForWorkbench();
        await openChoreoActivity();
        await switchToIFrame("Account");
        await waitUntilById("current-project-section", 20000);
        await VSBrowser.instance.driver.switchTo().defaultContent();
        const editorView = new EditorView();
        await editorView.getTabByTitle("Architecture View");
        await editorView.closeAllEditors();


        // delete
        // deleteCurrentlyOpenedProject();



        await wait(20000);

        /*
        const dialog = await DialogHandler.getOpenDialog();
        await dialog.selectPath('/my/awesome/folder');
        // confirm
        await dialog.confirm();
        // or cancel
        await dialog.cancel();
        /*

        // await wait(10000);
        // await workbench.executeCommand("Create New Project");
        // await wait(30000);

        /*
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
        */
       
        // Cloning
        /*
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
        */
    });

    // when new project is opened, we can verify whether architecture diagram is shown automatically

    it("Clone the project", async () => {
        await diagramWebview.switchToFrame();

        const componentMenus = await diagramWebview.findWebElements(By.id("component-list-menu-btn-0"));
        expect(componentMenus).to.have.lengthOf(0);

        const cloneButton = await diagramWebview.findWebElement(By.id("clone-project"));
        expect(await cloneButton.isEnabled()).to.be.true;
        await cloneButton.click();
        await diagramWebview.switchBack();

        const inputBox = new InputBox();
        await inputBox.setText(CHOREO_PROJECTS_PATH);
        await inputBox.sendKeys('\uE007');
        await wait(5000);

        await handleGitHubLogin();

        await wait(15000);
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
        await VSBrowser.instance.driver.wait(until.elementIsEnabled(pushToChoreoBtn));
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

        workbench = new Workbench();
        await commitAndPushChanges(workbench, editor, "delete component");
    });

    after(async () => {
        // Need to delete project and local files after the test run
        await wait(10000);

        editor = new EditorView();
        await editor.closeAllEditors();

        // await deleteProject(PROJECT_NAME);
        
        if (hasFoldersInRepository(join(CHOREO_PROJECTS_PATH, PROJECT_NAME, 'repos', GIT_ORG_NAME, GIT_REPO_NAME))) {
            deleteFoldersRecursively(join(CHOREO_PROJECTS_PATH, PROJECT_NAME, 'repos', GIT_ORG_NAME, GIT_REPO_NAME));
            await commitAndPushChanges(workbench, editor, "delete everything");
        }
    });
});
