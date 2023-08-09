import { STAGE_CHANGES_COMMAND, COMMIT_STAGED_COMMAND, GIT_PUSH_COMMAND, SIGN_IN_WITH_AUTH_CODE } from "./constants";
import { expect } from "chai";
import {
    By,
    EditorView,
    VSBrowser,
    InputBox,
    TextEditor,
    Workbench,
    Locator,
    WebElement,
    WebElementPromise,
    until,
    ActivityBar,
    WebDriver,
} from "vscode-extension-tester";
import { chromium } from "playwright";
import { ChoreoProjectClient } from "@wso2-enterprise/choreo-client";
import { TokenManager } from "./tokenManager";
import * as fs from "fs";
import { join } from "path";

const switchToIFrame = async (frameName: string, driver: WebDriver): Promise<WebElement> => {
    const allIFrames = await driver.findElements(By.xpath("//iframe"));
    for (const iframeItem of allIFrames) {
        try {
            await driver.switchTo().frame(iframeItem);
            try {
                const frameElement = await driver.findElement(By.xpath(`//iframe[@title='${frameName}']`));
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
};

const switchBackFromIFrame = async (driver: WebDriver) => {
    // Go 2 levels above to parent view from webview
    await driver.switchTo().parentFrame();
    await driver.switchTo().parentFrame();

    // todo: check if await driver.switchTo().defaultContent(); can be used instead
};

/** Sign into choreo using test user credentials */
export const signIntoChoreo = async () => {
    const driver = VSBrowser.instance.driver;
    const control = await driver.wait(new ActivityBar().getViewControl("Choreo"), 10000);
    if (!control) {
        throw new Error("Choreo activity not found");
    }
    const sideBarView = await control.openView();
    const sideBarContent = sideBarView.getContent();
    await driver.wait(sideBarContent.getSection("Account"), 10000);
    await switchToIFrame("Account", driver);
    try {
        const signIndButton = await waitUntilById("sign-in-btn");
        await signIndButton.click();
        await switchBackFromIFrame(driver);
        await handleLoginPrompt();
        await switchToIFrame("Account", driver);
    } catch (err: any) {
        if (err.message.includes("sign-in-btn")) {
            console.log("Could not find the sign in button. User must be already logged in.", err);
        } else {
            throw err;
        }
    }
    await waitUntilById("user-details", 15000);
};

const handleLoginPrompt = async () => {
    await clickPromptButton("Copy");
    const authUrl = await getValueFromClipboard();
    const authUrlWithTestIdp = `${authUrl}&fidp=choreoe2etest`;
    const browser = await chromium.launch({ headless: process.env.CI ? true : false });
    const page = await browser.newPage();
    await page.goto(authUrlWithTestIdp);
    await page.waitForSelector('button[type="submit"]', { timeout: 60 * 1000 });
    await page.waitForLoadState("networkidle", { timeout: 60 * 1000 });

    await page.type("#usernameUserInput", process.env.TEST_IDP_USERNAME!);
    await page.type("#password", process.env.TEST_IDP_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.click('button[id="onetrust-accept-btn-handler"]', { timeout: 60 * 1000 });
    const pageUrlStr = page.url();
    await browser.close();

    const pageUrl = new URL(pageUrlStr);
    const params = new URLSearchParams(pageUrl.search);
    const code = params.get("code");
    expect(code).not.null;

    if (code) {
        await new Workbench().executeCommand(SIGN_IN_WITH_AUTH_CODE);
        await wait(1000);
        const inputBox = new InputBox();
        await inputBox.setText(code);
        await inputBox.confirm();

        try {
            await clickPromptButton("Use weaker encryption");
        } catch {
            // Prompt to allow weaker encryption was not shown
        }
    }
};

// todo: try to use scm class
export const commitAndPushChanges = async (
    workbench: Workbench,
    editor: EditorView,
    commitMsg: string
): Promise<void> => {
    await wait(5000);
    await workbench.executeCommand(STAGE_CHANGES_COMMAND);
    await wait(2000);
    await workbench.executeCommand(COMMIT_STAGED_COMMAND);
    await wait(2000);

    const editorText = new TextEditor();
    await editorText.typeTextAt(1, 1, commitMsg);
    await editorText.save();
    await wait(1000);

    await editor.closeEditor("COMMIT_EDITMSG");
    await wait(3000);

    await workbench.executeCommand(GIT_PUSH_COMMAND);
    await wait(5000);

    await handleGitHubLogin();
};

export const handleGitHubLogin = async (): Promise<void> => {
    const driver = VSBrowser.instance.driver;
    const githubLoginPrompt = await driver.findElements(
        By.xpath(`//*[contains(text(), "The extension 'Choreo' wants to sign in using GitHub.")]`)
    );
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
        const projectClient = new ChoreoProjectClient(
            {
                getToken: async () => accessToken,
            },
            process.env.PROJECT_API!
        );
        const projects = await projectClient.getProjects({
            orgId: Number(process.env.TEST_USER_ORG_ID!),
            orgHandle: process.env.TEST_USER_ORG_HANDLE!,
        });
        const projectObj = projects.find((item) => item.name.includes(projectName));
        if (projectObj) {
            const components = await projectClient.getComponents({
                orgId: Number(process.env.TEST_USER_ORG_ID!),
                orgHandle: process.env.TEST_USER_ORG_HANDLE!,
                orgUuid: process.env.TEST_USER_ORG_ID!,
                projId: projectObj.id,
            });
            for (const component of components) {
                await projectClient.deleteComponent({
                    component,
                    orgId: Number(process.env.TEST_USER_ORG_ID!),
                    orgHandle: process.env.TEST_USER_ORG_HANDLE!,
                    projectId: projectObj.id,
                });
            }
            await projectClient.deleteProject({
                orgId: Number(process.env.TEST_USER_ORG_ID!),
                orgHandle: process.env.TEST_USER_ORG_HANDLE!,
                projectId: projectObj.id,
            });
        }
    }
};

/** Delete all folders except the .git folder, within the repo.  */
export const deleteFoldersRecursively = (folderPath: string) => {
    const files = fs.readdirSync(folderPath);
    files.forEach((file) => {
        const filePath = join(folderPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory() && file !== ".git") {
            fs.rmSync(filePath, { recursive: true, force: true });
        }
    });
};

/** Check if there are folders that needs to be removed within the repo */
export const hasFoldersInRepository = (repoPath: string) => {
    const files = fs.readdirSync(repoPath);
    for (const file of files) {
        if (file === ".git") {
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

/** Click buttons in prompts or modals */
const clickPromptButton = async (btnText: string) => {
    const copyButton = await waitUntil(By.xpath(`//*[contains(text(), "${btnText}")]`));
    await copyButton.click();
};

/** Read text value that is copied in clipboard */
const getValueFromClipboard = async (): Promise<string> => {
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
    await driver.executeScript(
        `
        document.execCommand('copy');
    `,
        input,
        "test value"
    );

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
};


/** Wait for X number of milliseconds */
export const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Wait until an element is located in the UI*/
export const waitUntil = async (locator: Locator, timeout = 10000) =>
    VSBrowser.instance.driver.wait(until.elementLocated(locator), timeout);

/** Wait until an element with a particular ID is located in the UI */
export const waitUntilById = async (id: string, timeout = 10000) => waitUntil(By.id(id), timeout);

// todo: uncomment if these are needed
// export function waitUntilVisible(element: WebElement, timeout: number = 15000): WebElementPromise {
//     return VSBrowser.instance.driver.wait(until.elementIsVisible(element), timeout);
// }

// export function waitUntilTextContains(element: WebElement, text: string, timeout: number = 15000): WebElementPromise {
//     return VSBrowser.instance.driver.wait(until.elementTextContains(element, text), timeout, "Element text did not contain " + text);
// }

// export function waitForWebview(name: string) {
//     return waitUntil(By.xpath("//div[@title='" + name + "']"));
// }

// export function waitForWebviewByTestId(testId: string) {
//     return waitUntil(By.xpath("//div[@data-test-id='" + testId + "']"));
// }
