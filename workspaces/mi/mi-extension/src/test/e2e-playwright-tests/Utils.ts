/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ExtendedPage, startVSCode, switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";
import { Form } from "./components/Form";
import { Welcome } from "./components/Welcome";
import path from "path";
import { ElectronApplication, expect } from "@playwright/test";
import { test } from '@playwright/test';
import fs, { existsSync } from 'fs';
import { promises as fsp } from 'fs';
import { readFile } from 'fs/promises';
import { Page } from "@playwright/test";

const dataFolder = path.join(__dirname, 'data');
const extensionsFolder = path.join(__dirname, '..', '..', '..', 'vsix');
const vscodeVersion = 'latest';
export const resourcesFolder = path.join(__dirname, '..', 'test-resources');
export const newProjectPath = path.join(dataFolder, 'new-project', 'testProject');
export let vscode: ElectronApplication | undefined;
export let page: ExtendedPage;

async function initVSCode() {
    if (vscode && page) {
        await page.executePaletteCommand('Reload Window');
    } else {
        vscode = await startVSCode(resourcesFolder, vscodeVersion, undefined, false, extensionsFolder, newProjectPath);
    }
    page = new ExtendedPage(await vscode!.firstWindow({ timeout: 60000 }));
}

export async function createProject(page: ExtendedPage, projectName?: string, runtimeVersino?: string, addAdvancedConfig: boolean = false) {
    console.log('Creating new project');
    await page.selectSidebarItem('Micro Integrator');
    const welcomePage = new Welcome(page);
    await welcomePage.init();
    await welcomePage.createNewProject();

    const createNewProjectForm = new Form(page.page, 'Project Creation Form');
    await createNewProjectForm.switchToFormView();
    await createNewProjectForm.fill({
        values: {
            'Project Name*': {
                type: 'input',
                value: projectName || 'testProject',
            },
            'Micro Integrator runtime version*': {
                type: 'dropdown',
                value: runtimeVersino || '4.4.0'
            },
            'Select Location': {
                type: 'file',
                value: newProjectPath
            }
        }
    });
    if (addAdvancedConfig) {
        const webView = await switchToIFrame('Project Creation Form', page.page);
        if (!webView) {
            throw new Error("Failed to switch to Project Creation Form iframe");
        }
        await webView.locator('vscode-button[title="Expand"]').click();
        await webView.getByRole('textbox', { name: 'Artifact Id*' }).fill('test');
    }
    await createNewProjectForm.submit();
    await welcomePage.waitUntilDeattached();
    console.log('Project created');

    const setupEnvPage = new Welcome(page);
    await setupEnvPage.setupEnvironment();
    console.log('Environment setup done');
}

async function resumeVSCode() {
    if (vscode && page) {
        await page.executePaletteCommand('Reload Window');
    } else {
        console.log('Starting VSCode');
        vscode = await startVSCode(resourcesFolder, vscodeVersion, undefined, false, extensionsFolder, path.join(newProjectPath, 'testProject'));
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    page = new ExtendedPage(await vscode!.firstWindow({ timeout: 60000 }));
}

export async function clearNotificationAlerts() {
    console.log(`Clearing notifications`);
    if (page) {
        await page.executePaletteCommand("Notifications: Clear All Notifications");
    }
}

export async function toggleNotifications(disable: boolean) {
    const notificationStatus = page.page.locator('#status\\.notifications');
    await notificationStatus.waitFor();
    const ariaLabel = await notificationStatus.getAttribute('aria-label');
    if ((ariaLabel !== "Do Not Disturb" && disable) || (ariaLabel === "Do Not Disturb" && !disable)) {
        await page.executePaletteCommand("Notifications: Toggle Do Not Disturb Mode");
    }

}

export async function showNotifications() {
    await page.executePaletteCommand("Notifications: Show Notifications");
}

export async function closeEditorGroup() {
    await page.executePaletteCommand('Close Editor Group');
}

export function initTest(newProject: boolean = false, skipProjectCreation: boolean = false, cleanupAfter?: boolean, projectName?: string, runtimeVersion?: string) {
    test.beforeAll(async ({ }, testInfo) => {
        console.log(`>>> Starting tests. Title: ${testInfo.title}, Attempt: ${testInfo.retry + 1}`);
        if (!existsSync(path.join(newProjectPath, projectName ?? 'testProject')) || newProject) {
            if (fs.existsSync(newProjectPath)) {
                fs.rmSync(newProjectPath, { recursive: true });
            }
            fs.mkdirSync(newProjectPath, { recursive: true });
            console.log('Starting VSCode');
            await initVSCode();
            await toggleNotifications(true);
            if (!skipProjectCreation) {
                await createProject(page, projectName, runtimeVersion);
            }
        } else {
            console.log('Resuming VSCode');
            await resumeVSCode();
            await page.page.waitForLoadState();
            await toggleNotifications(true);
        }
        console.log('Test runner started');
    });

    test.afterAll(async ({ }, testInfo) => {
        if (cleanupAfter && fs.existsSync(newProjectPath)) {
            fs.rmSync(newProjectPath, { recursive: true });
        }
        console.log(`>>> Finished ${testInfo.title} with status: ${testInfo.status}, Attempt: ${testInfo.retry + 1}`);
    });
}

export async function copyFile(source: string, destination: string) {
    console.log('Copying file from ' + source + ' to ' + destination);

    if (existsSync(destination)) {
        fs.rmSync(destination);
    }
    fs.copyFileSync(source, destination);
}

export async function waitUntilPomContains(page: Page, filePath: string, expectedText: string, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const content = await readFile(filePath, 'utf8');
        if (content.includes(expectedText)) {
            return true;
        }
        await page.waitForTimeout(500);
    }
    throw new Error(`Timed out waiting for '${expectedText}' in pom.xml`);
}

export async function waitUntilPomNotContains(page: Page, filePath: string, expectedText: string, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const content = await readFile(filePath, 'utf8');
        if (!content.includes(expectedText)) {
            return true;
        }
        await page.waitForTimeout(500);
    }
    throw new Error(`Timed out waiting for '${expectedText}' in pom.xml`);
}
