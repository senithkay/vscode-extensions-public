import { ExtendedPage } from "@wso2-enterprise/playwright-vscode-tester";
import { Form } from "./components/Form";
import { Welcome } from "./components/Welcome";

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
