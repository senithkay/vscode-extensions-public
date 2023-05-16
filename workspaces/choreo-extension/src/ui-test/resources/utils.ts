import { STAGE_CHANGES_COMMAND, COMMIT_STAGED_COMMAND, GIT_PUSH_COMMAND, SIGN_IN_WITH_CODE_COMMAND, SIGN_IN_COMMAND } from "./constants";
import { expect } from "chai";
import { By, EditorView, VSBrowser, Workbench, InputBox, TextEditor } from 'vscode-extension-tester';
import { chromium } from "playwright-core";

export async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const signIntoChoreo = async (editor: EditorView, workbench: Workbench) => {
    const choreoSignInNavButton = await editor.findElements(By.xpath('//*[contains(text(), "Sign in to Choreo")]'));
    const choreoSignInPrompt = await editor.findElements(By.xpath('//*[contains(text(), "sign in to Choreo")]'));
    if (choreoSignInPrompt.length > 0 || choreoSignInNavButton.length > 0) {
        await workbench.executeCommand(SIGN_IN_COMMAND);
        await wait(5000);

        const authUrl = await getExternalLinkFromPrompt();
        if(authUrl){
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
    
            if (code) {
                await workbench.executeCommand(SIGN_IN_WITH_CODE_COMMAND);
                await wait(1000);
                const inputBox = new InputBox();
                await inputBox.setText(code);
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
};

export const handleGitHubLogin = async (): Promise<void> => {
    const driver = VSBrowser.instance.driver;
    await driver.wait(async () => (await driver.getAllWindowHandles()).length === 2);
    const handles = await driver.getAllWindowHandles();
    const promptHandle = handles[0];
    await driver.switchTo().window(promptHandle);
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
};

export const getExternalLinkFromPrompt = async (): Promise<string | undefined> => {
    const driver = VSBrowser.instance.driver;
    await driver.wait(async () => (await driver.getAllWindowHandles()).length === 2);
    const handles = await driver.getAllWindowHandles();
    const promptHandle = handles[0];
    await driver.switchTo().window(promptHandle);
    const copyButtons = await driver.findElements(By.xpath('//*[contains(text(), "Copy")]'));
    if(copyButtons.length > 0){
        await copyButtons[0].click();
        const urlText = await getValueFromClipboard();
        return urlText;
    }
};

const getValueFromClipboard = async (): Promise<string> => {
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
};
