import { ExtendedPage, startVSCode,  } from "@wso2-enterprise/playwright-vscode-tester";
import { ElectronApplication } from '@playwright/test';
import { Form } from "./components/Form";
import { Welcome } from "./components/Welcome";
import path from "path";
const fs = require('fs');

const resourcesFolder = path.join(__dirname, '..', 'test-resources');
const dataFolder = path.join(__dirname, 'data');
const extensionsFolder = path.join(__dirname, '..', '..', '..', 'vsix');
const vscodeVersion = '1.92.0';
const newProjectPath = path.join(dataFolder, 'new-project', 'testProject');

export let vscode: ElectronApplication | undefined;
export let page: ExtendedPage;

export async function initializeVSCode() {
    vscode = await startVSCode(resourcesFolder, vscodeVersion, undefined, false, extensionsFolder, newProjectPath);
    page = new ExtendedPage(await vscode!.firstWindow());
}

export async function createProject(page: ExtendedPage) {
    await page.selectSidebarItem('Micro Integrator');
    const welcomePage = new Welcome(page.page);
    await welcomePage.init();
    await welcomePage.createNewProject();

    const createNewProjectForm = new Form(page.page, 'Project Creation Form');
    await createNewProjectForm.switchToFormView();
    await createNewProjectForm.fill({
        values: {
            'Project Name*': {
                type: 'input',
                value: 'testProject'
            },
        }
    });
    await createNewProjectForm.submit();
}

export async function closeNotification(page: ExtendedPage) {
    const notificationsCloseButton = page.page.locator('a.action-label.codicon.codicon-notifications-clear');
    await notificationsCloseButton.click({ force: true });
}
