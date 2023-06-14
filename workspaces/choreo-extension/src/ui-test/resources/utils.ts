import { STAGE_CHANGES_COMMAND, COMMIT_STAGED_COMMAND, GIT_PUSH_COMMAND, SIGN_IN_WITH_APIM_TOKEN, SIGN_OUT_COMMAND } from "./constants";
import { expect } from "chai";
import { By, EditorView, VSBrowser, Workbench, InputBox, TextEditor, } from 'vscode-extension-tester';
import { chromium } from "playwright";
import { ChoreoAuthClient, ChoreoProjectClient } from "@wso2-enterprise/choreo-client";
import { TokenManager } from "./tokenManager";
import * as fs from 'fs';
import { join } from "path";

export async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const signIntoChoreo = async (editor: EditorView, workbench: Workbench) => {
    const tokenManager = TokenManager.getInstance();

    if (!tokenManager.getApimTokenResponse() || !tokenManager.getVscodeTokenResponse()) {
        await workbench.executeCommand(SIGN_OUT_COMMAND);
        await wait(5000);

        const client = new ChoreoAuthClient({
            apimClientId: process.env.APIM_CLIENT_ID!,
            apimTokenUrl: process.env.APIM_TOKEN_URL!,
            clientId: process.env.CLIENT_ID!,
            loginUrl: process.env.LOGIN_URL!,
            redirectUrl: process.env.REDIRECT_URL!,
            tokenUrl: process.env.TOKEN_URL!,
            vscodeClientId: process.env.VSCODE_CLIENT_ID!,
            signUpUrl: process.env.SIGNUP_URL!,
            apimScopes: process.env.APIM_SCOPES!
        });

        const authUrl = client.getAuthURL("vscode://wso2.choreo/signin");

        if (authUrl) {
            const authUrlWithTestIdp = `${authUrl}&fidp=choreoe2etest`;

            const browser = await chromium.launch({ headless: process.env.CI ? true : false });
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

            if (code) {
                const apimToken = await client.exchangeAuthCode(code);
                tokenManager.setApimTokenResponse(apimToken);

                const vscodeToken = await client.exchangeVSCodeToken(apimToken.accessToken, process.env.TEST_USER_ORG_HANDLE!);
                tokenManager.setVscodeTokenResponse(vscodeToken);

                await workbench.executeCommand(SIGN_IN_WITH_APIM_TOKEN);
                await wait(1000);
                const inputBox = new InputBox();
                await inputBox.setText(JSON.stringify(apimToken));
                await inputBox.confirm();
            }
        }
    }
};

export const commitAndPushChanges = async (workbench: Workbench, editor: EditorView, commitMsg: string): Promise<void> => {
    await wait(5000);
    await workbench.executeCommand(STAGE_CHANGES_COMMAND);
    await wait(2000);
    await workbench.executeCommand(COMMIT_STAGED_COMMAND);
    await wait(2000);

    const editorText = new TextEditor();
    await editorText.typeTextAt(1, 1, commitMsg);
    await editorText.save();
    await wait(1000);

    await editor.closeEditor('COMMIT_EDITMSG');
    await wait(3000);

    await workbench.executeCommand(GIT_PUSH_COMMAND);
    await wait(5000);

    await handleGitHubLogin();
};

export const handleGitHubLogin = async (): Promise<void> => {
    const driver = VSBrowser.instance.driver;
    const githubLoginPrompt = await driver.findElements(By.xpath(`//*[contains(text(), "The extension 'Choreo' wants to sign in using GitHub.")]`));
    if (githubLoginPrompt.length) {
        const [, , cancelButton] = await driver.findElements(By.xpath('//*[contains(text(), "Cancel")]'));
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
        await wait(5000);
    }
};

/** To clean up the data in Choreo after running the project */
export const deleteProject = async (projectName: string): Promise<void> => {
    const tokenManager = TokenManager.getInstance();
    const accessToken = tokenManager.getVscodeTokenResponse();
    if (accessToken) {
        const projectClient = new ChoreoProjectClient({ getToken: async () => accessToken }, process.env.PROJECT_API!);
        const projects = await projectClient.getProjects({ orgId: Number(process.env.TEST_USER_ORG_ID!) });
        const projectObj = projects.find(item => item.name.includes(projectName));
        if (projectObj) {
            const components = await projectClient.getComponents({
                orgHandle: process.env.TEST_USER_ORG_HANDLE!,
                orgUuid: process.env.TEST_USER_ORG_ID!,
                projId: projectObj.id
            });
            for (const component of components) {
                await projectClient.deleteComponent({ component, orgHandler: process.env.TEST_USER_ORG_HANDLE!, projectId: projectObj.id });
            }
            await projectClient.deleteProject({ orgId: Number(process.env.TEST_USER_ORG_ID!), projectId: projectObj.id });
        }
    }
};

/** Delete all folders except the .git folder, within the repo.  */
export const deleteFoldersRecursively = (folderPath: string) => {
    const files = fs.readdirSync(folderPath);
    files.forEach((file) => {
        const filePath = join(folderPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory() && file !== '.git') {
            fs.rmSync(filePath, { recursive: true, force: true });
        }
    });
};

/** Check if there are folders that needs to be removed within the repo */
export const hasFoldersInRepository = (repoPath: string) => {
    const files = fs.readdirSync(repoPath);
    for (const file of files) {
        if (file === '.git') {
            continue; // Ignore .git folder
        }
        const filePath = join(repoPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            return true; // At least one folder found
        }
    }
    return false; // No folders found
};