/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ExtendedPage, startVSCode } from "@wso2-enterprise/playwright-vscode-tester";
import { Form } from "./components/Form";
import { Welcome } from "./components/Welcome";
import path from "path";
import { ElectronApplication, Page } from "@playwright/test";
import { test } from '@playwright/test';
import fs, { existsSync } from 'fs';
import os from 'os';

export const dataFolder = path.join(__dirname, 'data');
const extensionsFolder = path.join(__dirname, '..', '..', '..', 'vsix');
const vscodeVersion = 'latest';
export const resourcesFolder = path.join(__dirname, '..', 'test-resources');
export const newProjectPath = path.join(dataFolder, 'new-projects');
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

async function createProject(page: ExtendedPage) {
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
                value: 'testProject'
            },
            'Select Location': {
                type: 'file',
                value: newProjectPath
            }
        }
    });
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

export async function clearNotificationsByCloseButton(page: ExtendedPage) {
    const notificationsCloseButton = page.page.locator('a.action-label.codicon.codicon-notifications-clear');
    while (await notificationsCloseButton.count() > 0) {
        await notificationsCloseButton.first().click({ force: true });
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

export function initTest(newProject: boolean = false, cleanupAfter?: boolean) {
    test.beforeAll(async ({ }, testInfo) => {
        console.log(`>>> Starting tests. Title: ${testInfo.title}, Attempt: ${testInfo.retry + 1}`);
        if (!existsSync(path.join(newProjectPath, 'testProject')) || newProject) {
            if (fs.existsSync(newProjectPath)) {
                fs.rmSync(newProjectPath, { recursive: true });
            }
            fs.mkdirSync(newProjectPath, { recursive: true });
            console.log('Starting VSCode');
            await initVSCode();
            await toggleNotifications(true);
            await createProject(page);
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
        console.log(`>>> Finished ${testInfo.title} with status: ${testInfo.status}`);
    });
}

export async function copyFile(source: string, destination: string) {
    console.log('Copying file from ' + source + ' to ' + destination);

    if (existsSync(destination)) {
        fs.rmSync(destination);
    }
    fs.copyFileSync(source, destination);
}
