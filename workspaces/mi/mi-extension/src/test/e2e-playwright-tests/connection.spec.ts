/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { test, ElectronApplication, expect } from '@playwright/test';
import { ExtendedPage, startVSCode } from "@wso2-enterprise/playwright-vscode-tester";
import * as path from 'path';
import { Form } from './components/Form';
import { AddArtifact } from './components/AddArtifact';
import { ConnectorStore } from './components/ConnectorStore';
import { closeNotification, createProject, initializeVSCode, page, vscode } from './Utils';
import { Overview } from './components/Overview';
const fs = require('fs');

const resourcesFolder = path.join(__dirname, '..', 'test-resources');
const dataFolder = path.join(__dirname, 'data');
const extensionsFolder = path.join(__dirname, '..', '..', '..', 'vsix');
const vscodeVersion = '1.92.0';

// let vscode: ElectronApplication | undefined;
// let page: ExtendedPage;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
    await initializeVSCode();
    const newProjectPath = path.join(dataFolder, 'new-project', 'testProject');
    // delete and recreate folder
    if (fs.existsSync(newProjectPath)) {
        fs.rmSync(newProjectPath, { recursive: true });
    }
    fs.mkdirSync(newProjectPath, { recursive: true });
    //   vscode = await startVSCode(resourcesFolder, vscodeVersion, undefined, false, extensionsFolder, newProjectPath);
    // page = new ExtendedPage(await vscode!.firstWindow());
});

test('Create new project', async () => {
    await createProject(page);
});

test('Create new Connection', async () => {
    // Create connection
    const addArtifactPage = new AddArtifact(page.page);
    await addArtifactPage.init();
    await addArtifactPage.add('Connection');

    const connectorStore = new ConnectorStore(page.page, "Connector Store Form");
    await connectorStore.init();
    await connectorStore.search('File');
    await connectorStore.selectConnector('File');

    const connectionForm = new Form(page.page, 'Connector Store Form');
    await connectionForm.switchToFormView();
    await connectionForm.fill({
        values: {
            'Connection Name*': {
                type: 'input',
                value: 'file_connection',
            },
            'Host*': {
                type: 'input',
                value: 'example.com',
            },
            'Port*': {
                type: 'input',
                value: '80',
            },
            'User Directory Is Root': {
                type: 'combo',
                value: 'true',
            },
            'TrustStore Path': {
                type: 'expression',
                value: 'exampletruststore.com',
            },
            'TrustStore Password': {
                type: 'expression',
                value: 'examplePassword@123',
            }
        }
    });
    await closeNotification(page);
    await connectionForm.submit('Add');

    const overviewPage = new Overview(page.page);
    await overviewPage.init();
    expect(await overviewPage.checkForArtifact('Connections', 'file_connection')).toBeTruthy();
});

test('Edit Connection', async () => {
    // Edit connection
    const overviewPage = new Overview(page.page);
    await overviewPage.init();
    await overviewPage.selectArtifact('Connections', 'file_connection');

    const connectionForm = new Form(page.page, 'Connection Creation Form');
    await connectionForm.switchToFormView();
    const connectionName = await connectionForm.getInputValue('Connection Name*');
    expect(connectionName).toBe('file_connection');
    await connectionForm.fill({
        values: {
            'Host*': {
                type: 'input',
                value: 'example2.com',
            },
            'Port*': {
                type: 'input',
                value: '8080',
            }
        }
    });
    await connectionForm.submit('Update');
    expect(await overviewPage.checkForArtifact('Connections', 'file_connection')).toBeTruthy();
});



test.afterAll(async () => {
    //   await vscode?.close();

    // const videoTitle = new Date().toLocaleString().replace(/,|:|\/| /g, '_');
    // const video = page.page.video()
    // const videoDir = path.resolve(resourcesFolder, 'videos')
    // const videoPath = await video?.path()

    // if (video && videoPath) {
    //     await fs.renameSync(videoPath, `${videoDir}/${videoTitle}.webm`)
    // }
});
