/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { expect } from 'chai';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { before, describe, it } from 'mocha';
import { join } from 'path';
import {
    By,
    EditorView,
    TerminalView,
    until,
    VSBrowser,
    WebDriver
} from 'vscode-extension-tester';
import { areVariablesIncludedInString, wait } from './util';
import { ExtendedEditorView } from './utils/ExtendedEditorView';


const expectedConfigs = [
    'foo',
    'bar',
    'isAdmin',
    'age',
    'port',
    'height',
    'salary',
    'name',
    'book',
    'switches',
    'ports',
    'rates',
    'colors',
    'person',
    'people',
    'personx',
    'input',
    'peopex',
    'users',
    'userTeams',
    'country',
    'code',
    'data',
    'url',
    'authConfig'
];

describe.skip('VSCode Config Generation UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data');
    let browser: VSBrowser;
    let driver: WebDriver;

    const configFilePath = `${PROJECT_ROOT}/configServicePackage/Config.toml`;

    before(async () => {
        // Check if the file exists
        if (existsSync(configFilePath)) {
            // If the file exists, delete it
            unlinkSync(configFilePath);
        }

        browser = VSBrowser.instance;
        driver = browser.driver;
        // Close all open tabs
        await new EditorView().closeAllEditors();
        await browser.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/configServicePackage/service.bal`);
    });

    it('Click on run anyway button to just ignore the config generation', async () => {
        // Open the popup message
        const editorView = new ExtendedEditorView(new EditorView());
        expect(await editorView.getAction("Run")).is.not.undefined;
        (await editorView.getAction("Run"))!.click();
        await wait(5000);
        // Find the information message boxes
        const infoNotifications = await driver.findElements(By.linkText('Run Anyway'));
        // Iterate over the information message boxes
        for (const infoNotification of infoNotifications) {
            await infoNotification.click();
        }

        // Check if the terminal is open
        await driver.wait(until.elementIsVisible(new TerminalView()), 10000);
        const terminal = await browser.driver.findElement(By.className('xterm'));
        expect(await terminal.isDisplayed()).to.be.true;

    });

    it('Click on run button to generate the config file', async () => {
        const editorView = new ExtendedEditorView(new EditorView());
        expect(await editorView.getAction("Run")).is.not.undefined;
        (await editorView.getAction("Run"))!.click();
        await wait(3000);

        // Find the information message boxes
        const infoNotifications = await driver.findElements(By.linkText('Create Config.toml'));
        // Iterate over the information message boxes
        for (const infoNotification of infoNotifications) {
            await infoNotification.click();
        }
        await wait(5000);
        // Check if the config file has been generated
        expect(existsSync(configFilePath)).to.be.true;

        // Read the generated config file and expected config file
        const generatedConfigContent = readFileSync(configFilePath, 'utf8').replace(/\s/g, '');

        // Compare the generated config file with the expected config file
        expect(areVariablesIncludedInString(expectedConfigs, generatedConfigContent)).to.true;

    });
});
