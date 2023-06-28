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
import { By, EditorView, Key, TextEditor, VSBrowser, WebDriver, WebView } from 'vscode-extension-tester';
import { DIAGRAM_LOADING_TIME } from './constants';
import { areVariablesIncludedInString, getDiagramExplorer, wait } from './util';
import { ExtendedEditorView } from './utils/ExtendedEditorView';


const expectedConfigs = [
    'bar',
    'isAdmin',
    'url',
    'authConfig'
];


describe('VSCode Config Suggestions UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data');
    let browser: VSBrowser;
    let driver: WebDriver;

    const configFilePath = `${PROJECT_ROOT}/configServicePackageEdit/Config.toml`;

    const configContent = `# Configuration file for "configServiceProject"
    # How to use see:
    # https://ballerina.io/learn/configure-ballerina-programs/provide-values-to-configurable-variables/#provide-via-toml-syntax
    
    bar = 0.0	# Type of NUMBER
    
    url = ""	# Type of STRING
    
    # For more information refer https://lib.ballerina.io/ballerina/http/
    [authConfig]	# Type of OBJECT
    `;

    before(async () => {
        writeFile(configFilePath, configContent, (err) => {
            if (err) {
                console.error('Error updating config file:', err);
            } else {
                console.log('Config file updated successfully!');
            }
        });

        await wait(2000);
        browser = VSBrowser.instance;

        driver = browser.driver;
        // Close all open tabs
        await new EditorView().closeAllEditors();

        await browser.openResources(configFilePath);
    });

    it('Click on suggestion to add configs to the file', async () => {

        const editor = new TextEditor();
        const line = await editor.getNumberOfLines();
        // Click on the end of the file
        await editor.moveCursor(line, 1);
        await wait(2000);

        await editor.typeText(Key.ENTER);
        await wait(2000);

        await editor.toggleContentAssist(true);
        await wait(2000);

        // Find the completion values
        const infoNotifications = await driver.findElements(By.linkText('isAdmin'));
        // Iterate over the completion values
        for (const infoNotification of infoNotifications) {
            await infoNotification.click();
        }

        await editor.save();

        // Wait for the suggestion to be applied
        await wait(2000);

        // Read the updated config file and expected config file
        const generatedConfigContent = readFileSync(configFilePath, 'utf8').replace(/\s/g, '');

        // Compare the generated config file with the expected config file
        expect(areVariablesIncludedInString(expectedConfigs, generatedConfigContent)).to.true;

    });
});
