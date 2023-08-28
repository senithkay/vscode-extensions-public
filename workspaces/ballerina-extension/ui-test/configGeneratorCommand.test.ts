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
import { By, EditorView, Key, VSBrowser, WebDriver, Window } from 'vscode-extension-tester';
import { areVariablesIncludedInString, wait } from './util';


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

describe.skip('VSCode Config Creation Using Command UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data');
    let browser: VSBrowser;
    let driver: WebDriver;
    let window: Window;


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

    it('Open command palette to select config create command', async () => {
        // Send keyboard shortcut to open the command palette
        await driver.actions().sendKeys(Key.F1).perform();

        await wait(3000);

        // Simulate entering the search query in the command palette
        const searchQuery = 'Create Config.toml';
        await driver.actions().sendKeys(searchQuery, Key.ENTER).perform();

        await wait(5000);

        // Check if the config file has been generated
        expect(existsSync(configFilePath)).to.be.true;

        // Read the generated config file and expected config file
        const generatedConfigContent = readFileSync(configFilePath, 'utf8').replace(/\s/g, '');

        // Compare the generated config file with the expected config file
        expect(areVariablesIncludedInString(expectedConfigs, generatedConfigContent)).to.true;

    });

});
