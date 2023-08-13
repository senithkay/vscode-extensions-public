import {
    STAGE_CHANGES_COMMAND,
    COMMIT_STAGED_COMMAND,
    GIT_PUSH_COMMAND,
    SIGN_IN_WITH_AUTH_CODE,
    DELETE_PROJECT,
    OPEN_CHOREO_PROJECT,
} from "./constants";
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
    Key,
} from "vscode-extension-tester";
import { chromium } from "playwright";
import { ChoreoProjectClient } from "@wso2-enterprise/choreo-client";
import { TokenManager } from "./tokenManager";
import * as fs from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config();

// todo: update with all the env vars
const validateEnv = () => {
    const requiredEnvVars = ["TEST_IDP_USERNAME", "TEST_IDP_PASSWORD", "TEST_GITHUB_USERNAME", "TEST_GITHUB_PAT"];

    requiredEnvVars.forEach((envVar) => {
        it(`should have the ${envVar} environment variable`, () => {
            expect(process.env[envVar]).to.exist;
        });
    });
};

export const deleteProjectIfAlreadyExist = async (projectName: string, projectsPath: string) => {
    const driver = VSBrowser.instance.driver;
    const updatedPath = join(projectsPath, "Project_to_be_deleted");
    await new Workbench().executeCommand(OPEN_CHOREO_PROJECT);
    removeDir(join(updatedPath, projectName));
    let projectExist = true;

    try {
        await setQuickInputFieldValue({
            inputValue: projectName,
            placeholder: "Select a project to continue",
            waitForItemSelect: true,
        });
    } catch {
        projectExist = false;
        await new InputBox().cancel();
    }
    if (projectExist) {
        // await wait(500);
        await setQuickInputFieldValue({
            inputValue: "Select folder to clone the project",
            title: "The project is not cloned yet. Do you want to clone and open it?",
        });
        createDir(join(updatedPath));
        await setQuickInputFieldValue({ inputValue: updatedPath, title: "Select a folder to create the Workspace" });
        await handleGitHubLogin();
        await wait(5000);   // wait for new instance of vscode to open with the project
        await waitUntil(By.xpath('//a[@aria-label="Choreo"]'));
        await driver.wait(async () => (await driver.findElements(By.xpath("//iframe"))).length >= 3);
        await deleteCurrentlyOpenedProject();

        await wait(2000); // remove
    }
};

export const deleteCurrentlyOpenedProject = async () => {
    await new Workbench().executeCommand(DELETE_PROJECT);
    await clickPromptButton("Delete Project");
    // switch frame
    await switchToIFrame("Project");
    await waitUntilById("create-project-btn", 20000);
    await VSBrowser.instance.driver.switchTo().defaultContent();
};

export const openChoreoActivity = async () => {
    const choreoActivityIcon = await waitUntil(By.xpath('//a[@aria-label="Choreo"]'));
    try{
        await waitUntil(By.xpath('//h2[@title="Choreo" and text()="Choreo"]'));
    }catch{
        await choreoActivityIcon.click();
        await waitUntil(By.xpath('//h2[@title="Choreo" and text()="Choreo"]'));

    }
};

/** Switch to an iFrame in the UI base on the title of the iFrame */
export const switchToIFrame = async (frameName: "Account" | "Project" | "Create New Project"): Promise<WebElement> => {
    const driver = VSBrowser.instance.driver;
    const allIFrames = await waitUntilElements(By.xpath("//iframe"));
    for (const iframeItem of allIFrames) {
        try {
            await driver.switchTo().frame(iframeItem);
            try {
                const frameElement = await waitUntil(By.xpath(`//iframe[@title='${frameName}']`), 3000);
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

/** Sign into choreo using test user credentials (if user is not already logged in) */
export const signIntoChoreo = async () => {
    validateEnv();
    const driver = VSBrowser.instance.driver;
    try {
        await switchToIFrame("Account");
        await waitAndClickById("sign-in-btn");
        await driver.switchTo().defaultContent();
        await handleLoginPrompt();
        await switchToIFrame("Account");
        await waitUntilById("user-details", 20000);
        await driver.switchTo().defaultContent();
    } catch (err: any) {
        if (err.message.includes("sign-in-btn")) {
            console.log("Could not find the sign in button. User must be already logged in.", err);
        } else {
            throw err;
        }
    }
};

/**
 * Handle login prompt by performing the following
 * - Copy auth URL from login prompt, open test idp login page using.
 * - Open test idp login page using playwright.
 * - Login to test idp using test user credentials.
 * - Copy the auth code from browser when user is redirected back to Choreo.
 * - Use sign-in with Auth code to login the user.
 */
const handleLoginPrompt = async () => {
    await clickPromptButton("Copy");
    const authUrl = await getValueFromClipboard();
    const authUrlWithTestIdp = `${authUrl}&fidp=choreoe2etest`;
    const browser = await chromium.launch({ headless: process.env.CI ? true : false });
    const page = await browser.newPage();
    await page.goto(authUrlWithTestIdp, { timeout: 120 * 1000 });
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
    expect(code, "Auth code most not be null").not.null;

    if (code) {
        await new Workbench().executeCommand(SIGN_IN_WITH_AUTH_CODE);
        await setQuickInputFieldValue({ inputValue: code, placeholder: "Code" });
        try {
            await clickPromptButton("Use weaker encryption");
        } catch {
            // Ignore as Prompt to allow weaker encryption was not shown
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

/** Handle github login using test username and PAT */
export const handleGitHubLogin = async (): Promise<void> => {
    try {
        await waitUntil(
            By.xpath(`//*[contains(text(), "The extension 'Choreo' wants to sign in using GitHub.")]`),
            30000
        );
        await waitAndClick(By.xpath("//*[@title='Close Dialog']"));
        await setQuickInputFieldValue({ inputValue: process.env.TEST_GITHUB_USERNAME!, placeholder: "Username" });
        await wait(500); // Wait is needed in order to correctly identify the password field
        await setQuickInputFieldValue({ inputValue: process.env.TEST_GITHUB_PAT!, placeholder: "Password" });
    } catch {
        // Git auth modal was not shown.
        console.log("Could not login with github");
    }
};

/** Remove a directory if it exists, from a given path */
export const removeDir = (folderPath: string) => {
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
    }
};

/** Create a new directory if does not already exist */
export const createDir = (folderPath: string) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
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
};

/** Click buttons in prompts or modals */
export const clickPromptButton = async (btnText: string) => {
    await waitAndClick(By.xpath(`//*[contains(text(), "${btnText}")]`));
};

/** Wait for X number of milliseconds */
export const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Wait until elements are located in the UI*/
export const waitUntilElements = async (locator: Locator, timeout = 10000) =>
    VSBrowser.instance.driver.wait(until.elementsLocated(locator), timeout);

/** Wait until an element is located in the UI*/
export const waitUntil = async (locator: Locator, timeout = 10000) =>
    VSBrowser.instance.driver.wait(until.elementLocated(locator), timeout);

/** Click and element after waiting until it is located in the UI */
export const waitAndClick = async (locator: Locator, timeout = 10000) => {
    const element = await waitUntil(locator, timeout);
    await element.click();
};

/** Wait until an element with a particular ID is located in the UI */
export const waitUntilById = async (id: string, timeout = 10000) => waitUntil(By.id(id), timeout);

/** Click and element after after waiting until an element with a particular ID is located in the UI */
export const waitAndClickById = async (id: string, timeout = 10000) => {
    const element = await waitUntilById(id, timeout);
    await VSBrowser.instance.driver.wait(async () => await element.isEnabled());
    await element.click();
};

/** Type text after after waiting until an element with a particular ID is located in the UI */
export const waitAndTypeById = async (id: string, text: string, timeout = 10000) => {
    const element = await waitUntilById(id, timeout);
    await element.sendKeys(text);
};

/** Type text & press Enter key, after after waiting until an element with a particular ID is located in the UI */
export const waitAndTypeInAutoComplete = async (locator: Locator, text: string, timeout = 10000) => {
    const element = await waitUntil(locator, timeout);
    await element.clear();
    await element.sendKeys(text);
    await element.sendKeys(Key.ENTER);
};

/** Dismisses all notifications that could potentially block the test runner from clicking en element in the bottom right corner */
export const dismissAllNotifications = async () => {
    const notifications = await new Workbench().getNotifications();
    await Promise.all(notifications.map((item) => item.dismiss()));
};

/** Enter a value in the quick pick input field and confirm */
export const setQuickInputFieldValue = async (
    params: { inputValue: string; waitForItemSelect?: boolean } & ({ placeholder: string } | { title: string })
) => {
    if ("placeHolder" in params) {
        await waitUntil(By.xpath(`//div[@class='quick-input-titlebar']//input[@placeholder="${params.placeHolder}"]`));
    } else if ("title" in params) {
        await waitUntil(
            By.xpath(`//div[contains(@class, 'quick-input-title') and contains(text(), '${params.title}')]`)
        );
    }
    const inputBox = new InputBox();
    await inputBox.setText(params.inputValue);
    if (params.waitForItemSelect) {
        await waitUntil(
            By.xpath(`//div[@class='quick-input-list-entry']//*[contains(text(), '${params.inputValue}')]`)
        );
    }
    await inputBox.confirm();
};

// todo: add a util to wait and click
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
