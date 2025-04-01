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

const dataFolder = path.join(__dirname, 'data');
const extensionsFolder = path.join(__dirname, '..', '..', '..', 'vsix');
const vscodeVersion = 'latest';
export const resourcesFolder = path.join(__dirname, '..', 'test-resources');
export const newProjectPath = path.join(dataFolder, 'new-project', 'testProject');
export let vscode: ElectronApplication | undefined;
export let page: ExtendedPage;

export async function initVSCode() {
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

export async function resumeVSCode() {
    if (vscode && page) {
        await page.executePaletteCommand('Reload Window');
    } else {
        console.log('Starting VSCode');
        vscode = await startVSCode(resourcesFolder, vscodeVersion, undefined, false, extensionsFolder, path.join(newProjectPath, 'testProject'));
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    page = new ExtendedPage(await vscode!.firstWindow({ timeout: 60000 }));
}

export async function clearNotificationAlerts(page: Page) {
    console.log(`Clearing notifications`);
    if (page) {
        const notifications = page.locator('a.action-label.codicon.codicon-notifications-clear');
        while (await notifications.count() > 0) {
            await notifications.first().click();
        }
    }
}

export function initTest(newProject: boolean = false, cleanupAfter?: boolean) {
    test.beforeAll(async ({ }, testInfo) => {
        console.log(`>>> Starting tests. Title: ${testInfo.title}, Attempt: ${testInfo.retry}`);
        if (!existsSync(path.join(newProjectPath, 'testProject')) || newProject) {
            if (fs.existsSync(newProjectPath)) {
                fs.rmSync(newProjectPath, { recursive: true });
            }
            fs.mkdirSync(newProjectPath, { recursive: true });
            await initVSCode();
            await createProject(page);
        } else {
            await resumeVSCode();
        }
    });

    test.afterAll(async ({ }, testInfo) => {
        if (cleanupAfter && fs.existsSync(newProjectPath)) {
            fs.rmSync(newProjectPath, { recursive: true });
        }
        console.log(`>>> Finished ${testInfo.title} with status: ${testInfo.status}`);
    });
}

