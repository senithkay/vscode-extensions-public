import { ExtendedPage } from "@wso2-enterprise/playwright-vscode-tester";
import { Form } from "./components/Form";
import { Welcome } from "./components/Welcome";
const fs = require('fs');

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
