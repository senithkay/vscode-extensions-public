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
import { By, EditorView, VSBrowser, WebDriver } from 'vscode-extension-tester';
import { areVariablesIncludedInString, wait } from './util';
import { ExtendedEditorView } from './utils/ExtendedEditorView';


const expectedConfigs = [
    'bar',
    'isAdmin',
    'url',
    'authConfig'
];


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
        // Close all open tabs
        await new EditorView().closeAllEditors();

        await browser.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/configServicePackageEdit/service.bal`);
    });

    it('Click on run button to add configs to the file', async () => {
        const editorView = new ExtendedEditorView(new EditorView());
        expect(await editorView.getAction("Run")).is.not.undefined;
        (await editorView.getAction("Run"))!.click();
        await wait(5000);

        // Find the information message boxes
        const infoNotifications = await driver.findElements(By.linkText('Add to config'));
        // Iterate over the information message boxes
        for (const infoNotification of infoNotifications) {
            await infoNotification.click();
        }
        await wait(5000);

        // Read the updated config file and expected config file
        const generatedConfigContent = readFileSync(configFilePath, 'utf8').replace(/\s/g, '');

        // Compare the generated config file with the expected config file
        expect(areVariablesIncludedInString(expectedConfigs, generatedConfigContent)).to.true;

    });
});
