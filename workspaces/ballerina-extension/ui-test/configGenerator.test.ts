/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { expect } from 'chai';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { before, describe, it } from 'mocha';
import { join } from 'path';
import { By, EditorView, TextEditor, VSBrowser, WebDriver, WebView } from 'vscode-extension-tester';
import { DIAGRAM_LOADING_TIME } from './constants';
import { getDiagramExplorer, wait } from './util';
import { ExtendedEditorView } from './utils/ExtendedEditorView';

describe('VSCode Webview UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data');
    let browser: VSBrowser;
    let driver: WebDriver;

    const configFilePath = `${PROJECT_ROOT}/configServicePackage/Config.toml`;
    const expectedConfigFilePath = `${PROJECT_ROOT}/configServicePackage/expected-config.toml`;

    before(async () => {
        // Check if the file exists
        if (existsSync(configFilePath)) {
            // If the file exists, delete it
            unlinkSync(configFilePath);
        }

        browser = VSBrowser.instance;
        driver = browser.driver;
        await browser.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/configServicePackage/service.bal`);
        await wait(2000);
    });

    it('Click on run anyway button to just ignore the config generation', async () => {
        const editorView = new ExtendedEditorView(new EditorView());
        expect(await editorView.getAction("Run")).is.not.undefined;
        (await editorView.getAction("Run"))!.click();
        await wait(10000);

        // Find the information message boxes
        const infoNotifications = await driver.findElements(By.className('notification-list-item'));

        // Iterate over the information message boxes
        for (const infoNotification of infoNotifications) {
            // Find the button within the information message box
            const button = await infoNotification.findElement(By.linkText('Run Anyway'));

            // Perform the desired action on the button (e.g., click)
            await button.click();
        }

        await wait(5000);
        // Check if the terminal is open
        const terminal = await browser.driver.findElement(By.className('xterm'));
        expect(await terminal.isDisplayed()).to.be.true;

    });

    it('Click on run button to generate the config file', async () => {
        const editorView = new ExtendedEditorView(new EditorView());
        expect(await editorView.getAction("Run")).is.not.undefined;
        (await editorView.getAction("Run"))!.click();
        await wait(10000);

        // Find the information message boxes
        const infoNotifications = await driver.findElements(By.className('notification-list-item'));

        // Iterate over the information message boxes
        for (const infoNotification of infoNotifications) {
            // Find the button within the information message box
            const button = await infoNotification.findElement(By.linkText('Create new config'));

            // Perform the desired action on the button (e.g., click)
            await button.click();
        }

        // Check if the config file has been generated
        expect(existsSync(configFilePath)).to.be.true;

        // Read the generated config file and expected config file
        const generatedConfigContent = readFileSync(configFilePath, 'utf8');
        const expectedConfigContent = readFileSync(expectedConfigFilePath, 'utf8');

        // Compare the generated config file with the expected config file
        expect(generatedConfigContent).to.equal(expectedConfigContent);

    });
});
