/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { expect } from 'chai';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { before, describe, it } from 'mocha';
import { join } from 'path';
import { By, EditorView, Key, VSBrowser, WebDriver } from 'vscode-extension-tester';
import { wait } from './util';
import os from 'os';

describe('Open ballerina samples in VSCode from URL', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data');
    let browser: VSBrowser;
    let driver: WebDriver;

    const samplesDownloadDirectory = `${PROJECT_ROOT}/sampleDownloadFolder`;

    before(async () => {
        // Delete files and folders in this folder
        rmSync(samplesDownloadDirectory, { recursive: true, force: true });
        await wait(2000);
        // Create folder if not present
        if (!existsSync(samplesDownloadDirectory)) {
            mkdirSync(samplesDownloadDirectory);
        }

        browser = VSBrowser.instance;
        driver = browser.driver;
        // Wait till vscode instance starts
        await wait(8000);
        // Close all open tabs
        await new EditorView().closeAllEditors();
    });

    it('Open URL to download first sample on first time and change directory', async () => {
        // Use Developer URL to excecute a URL
        const url = 'vscode://wso2.ballerina/open-file?gist=18e6c62b7ef307d7064ed4ef39e4d0d8&file=functions.bal';
        await executeURLdownload(driver, url);

        await clickDialogButton(driver, 'Open');
        await wait(5000);

        await clickDialogButton(driver, 'Change Directory');
        await wait(3000);

        await driver.actions()
            .keyDown(os.platform() === 'darwin' ? Key.COMMAND : Key.CONTROL)
            .sendKeys('a')
            .keyUp(os.platform() === 'darwin' ? Key.COMMAND : Key.CONTROL)
            .sendKeys(Key.DELETE)
            .sendKeys(samplesDownloadDirectory)
            .perform();

        await wait(1000);

        await driver.actions().sendKeys(Key.ENTER).perform();

        await wait(3000);

        await clickDialogButton(driver, 'OK');
        await wait(3000);

        // Check if the file has been downloaded to the new location
        await executeURLdownload(driver, url);

        await clickDialogButton(driver, 'Open');
        await wait(3000);

        expect(existsSync(`${samplesDownloadDirectory}/functions.bal`), "Second assert with functions.bal").to.be.true;

    });

    it('Open URL to download second sample file', async () => {
        // Use Developer URL to excecute a URL
        const url = 'vscode://wso2.ballerina/open-file?gist=8ada14df03d5d8841d03ce4b92819b2b&file=hello_world.bal';
        await executeURLdownload(driver, url);

        await clickDialogButton(driver, 'Open');
        await wait(3000);

        expect(existsSync(`${samplesDownloadDirectory}/hello_world.bal`)).to.be.true;
    });

    it('Open URL to download a not valid sample file', async () => {
        // Use Developer URL to excecute a URL
        const url = 'vscode://wso2.ballerina/open-file?gist=1b94f48ad579969bc7c6a79549684dca&file=PeopleManagementService.bal';
        await executeURLdownload(driver, url);
        expect(existsSync(`${samplesDownloadDirectory}/PeopleManagementService.bal`)).to.be.not.true;
    });

    it('Open URL to download github sample file', async () => {
        // Use Developer URL to excecute a URL
        const url = 'vscode://wso2.ballerina/open-file?repoFileUrl=https://github.com/wso2/choreo-sample-apps/blob/main/ballerina/greeter/service.bal';
        await executeURLdownload(driver, url);

        await clickDialogButton(driver, 'Open');
        await wait(3000);

        expect(existsSync(`${samplesDownloadDirectory}/service.bal`)).to.be.true;
    });

    it('Open URL to download not valid github sample file', async () => {
        // Use Developer URL to excecute a URL
        const url = 'vscode://wso2.ballerina/open-file?repoFileUrl=https://github.com/jclark/semtype/blob/master/main.bal';
        await executeURLdownload(driver, url);
        expect(existsSync(`${samplesDownloadDirectory}/main.bal`)).to.be.not.true;
    });

    it('Open URL to download git repo', async () => {
        // Use Developer URL to excecute a URL
        const url = 'vscode://wso2.ballerina/open-repo?repoUrl=https://github.com/wso2/choreo-sample-apps';
        await executeURLdownload(driver, url);
        await wait(3000);

        await clickDialogButton(driver, 'Clone Now');
        await wait(8000);

        // Find the information message boxes for the file download verification
        const vscodeVerify = await driver.findElement(By.className('monaco-dialog-box')).findElements(By.linkText('Cancel'));
        // Iterate over the information message boxes
        for (const infoNotification of vscodeVerify) {
            await infoNotification.click();
        }

        expect(existsSync(`${samplesDownloadDirectory}/choreo-sample-apps/README.md`)).to.be.true;
    });

});


const executeURLdownload = async (driver, url: string) => {
    // Send keyboard shortcut to open the command palette
    await driver.actions().sendKeys(Key.F1).perform();
    await wait(2000);
    // Simulate entering the search query in the command palette
    const searchQuery = 'Open URL';
    await driver.actions().sendKeys(searchQuery, Key.ENTER).sendKeys(url, Key.ENTER).perform();

    await wait(2000);
    // Find the information message boxes for the file download verification
    const vscodeVerify = await driver.findElement(By.className('monaco-dialog-box')).findElements(By.linkText('Open'));
    // Iterate over the information message boxes
    for (const infoNotification of vscodeVerify) {
        await infoNotification.click();
    }
    await wait(6000);
}

const clickDialogButton = async (driver, text: string) => {
    // Find the path input boxes
    const inputs = await driver.findElements(By.linkText(text));
    // Iterate over the path input boxes
    for (const input of inputs) {
        await input.click();
    }
}
