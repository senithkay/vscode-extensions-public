/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { expect } from 'chai';
import { existsSync, readFileSync, writeFile } from 'fs';
import { before, describe, it } from 'mocha';
import { join } from 'path';
import { By, EditorView, TextEditor, VSBrowser, WebDriver, WebView } from 'vscode-extension-tester';
import { DIAGRAM_LOADING_TIME } from './constants';
import { getDiagramExplorer, wait } from './util';
import { ExtendedEditorView } from './utils/ExtendedEditorView';

describe('VSCode Config Generation Edit UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data');
    let browser: VSBrowser;
    let driver: WebDriver;

    const configFilePath = `${PROJECT_ROOT}/configServicePackageEdit/Config.toml`;
    const expectedConfigFilePath = `${PROJECT_ROOT}/configServicePackageEdit/expected-config.toml`;


    const configContent = `# Configuration file for "configServiceProject"
    # How to use see:
    # https://ballerina.io/learn/configure-ballerina-programs/provide-values-to-configurable-variables/#provide-via-toml-syntax
    
    bar = 0.0	# Type of NUMBER
    
    url = ""	# Type of STRING
    
    [authConfig]	# Type of OBJECT
    # For more information refer https://lib.ballerina.io/ballerina/http/
    `;

    before(async () => {
        writeFile(configFilePath, configContent, (err) => {
            if (err) {
                console.error('Error updating config file:', err);
            } else {
                console.log('Config file updated successfully!');
            }
        });
        browser = VSBrowser.instance;
        driver = browser.driver;
        await browser.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/configServicePackageEdit/service.bal`);
        await wait(2000);
    });

    it('Click on run button to add configs to the file', async () => {
        const editorView = new ExtendedEditorView(new EditorView());
        expect(await editorView.getAction("Run")).is.not.undefined;
        (await editorView.getAction("Run"))!.click();
        await wait(10000);

        // Find the information message boxes
        const infoNotifications = await driver.findElements(By.className('notification-list-item'));

        // Iterate over the information message boxes
        for (const infoNotification of infoNotifications) {
            // Find the button within the information message box
            const button = await infoNotification.findElement(By.linkText('Add to config'));

            // Perform the desired action on the button (e.g., click)
            await button.click();
        }
        await wait(3000);

        // Read the updated config file and expected config file
        const generatedConfigContent = readFileSync(configFilePath, 'utf8').replace(/\s/g, '');
        const expectedConfigContent = readFileSync(expectedConfigFilePath, 'utf8').replace(/\s/g, '');
        await wait(3000);
        // Compare the updated config file with the expected config file
        expect(generatedConfigContent).to.equal(expectedConfigContent);

    });
});
