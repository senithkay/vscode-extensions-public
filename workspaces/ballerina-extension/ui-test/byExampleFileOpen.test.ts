/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { expect } from 'chai';
import { existsSync, mkdirSync, readdir, statSync, unlink } from 'fs';
import { before, describe, it } from 'mocha';
import path, { join } from 'path';
import { By, EditorView, Key, VSBrowser, WebDriver } from 'vscode-extension-tester';
import { wait } from './util';
import * as os from 'os';

describe('Open ballerina samples in VSCode from URL', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data');
    let browser: VSBrowser;
    let driver: WebDriver;

    const samplesDownloadDirectory = `${PROJECT_ROOT}/byExampleFolder`;
    const pipeline = process.env.GITHUB_WORKSPACE;
    const defaultDownloadsPath = pipeline ? path.join(pipeline, 'downloads') : path.join(os.homedir(), 'Downloads');

    before(async () => {
        // Create folder if not present
        if (!existsSync(samplesDownloadDirectory)) {
            mkdirSync(samplesDownloadDirectory);
        }
        // Delete files in this folder
        deleteFilesInFolder(samplesDownloadDirectory);

        browser = VSBrowser.instance;
        driver = browser.driver;
        // Close all open tabs
        await new EditorView().closeAllEditors();
    });

    it.only('Open URL to download first example on first time and change directory', async () => {
        // Use Developer URL to excecute a URL
        const url = 'vscode://wso2.ballerina/open-file?gist=18e6c62b7ef307d7064ed4ef39e4d0d8&file=functions.bal';
        await executeURLdownload(driver, url);
        expect(existsSync(`${defaultDownloadsPath}/functions.bal`), "First assert with functions.bal").to.be.true;

        // Find the information message boxes for change direcotory
        const changePathBtns = await driver.findElements(By.linkText('Change Directory'));
        // Iterate over the information message boxes
        for (const button of changePathBtns) {
            await button.click();
        }
        await wait(3000);

        await driver.actions()
            .keyDown(Key.CONTROL)
            .sendKeys('a')
            .keyUp(Key.CONTROL)
            .sendKeys(Key.DELETE)
            .sendKeys(samplesDownloadDirectory)
            .perform();

        await driver.actions().sendKeys(Key.ENTER).perform();

        await wait(3000);

        // Find the path input boxes
        const inputs = await driver.findElements(By.linkText('OK'));
        // Iterate over the path input boxes
        for (const input of inputs) {
            await input.click();
        }
        await wait(3000);

        // Check if the file has been downloaded to the new location
        await executeURLdownload(driver, url);
        expect(existsSync(`${samplesDownloadDirectory}/functions.bal`), "Second assert with functions.bal").to.be.true;

    });

    it.only('Open URL to download second example file', async () => {
        // Use Developer URL to excecute a URL
        const url = 'vscode://wso2.ballerina/open-file?gist=8ada14df03d5d8841d03ce4b92819b2b&file=hello_world.bal';
        await executeURLdownload(driver, url);
        expect(existsSync(`${samplesDownloadDirectory}/hello_world.bal`)).to.be.true;
    });

});


const executeURLdownload = async (driver, url: string) => {
    // Send keyboard shortcut to open the command palette
    await driver.actions().sendKeys(Key.F1).perform();
    await wait(3000);
    // Simulate entering the search query in the command palette
    const searchQuery = 'Open URL';
    await driver.actions().sendKeys(searchQuery, Key.ENTER).sendKeys(url, Key.ENTER).perform();

    await wait(3000);
    // Find the information message boxes for the file download verification
    const vscodeVerify = await driver.findElement(By.className('monaco-dialog-box')).findElements(By.linkText('Open'));
    // Iterate over the information message boxes
    for (const infoNotification of vscodeVerify) {
        await infoNotification.click();
    }
    await wait(9000);
}


// Function to delete files inside a folder
const deleteFilesInFolder = (folderPath) => {
    readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading folder:', err);
            return;
        }

        // Loop through all the files in the folder
        files.forEach((file) => {
            const filePath = path.join(folderPath, file);

            // Check if the path is a file
            if (statSync(filePath).isFile()) {
                // Delete the file
                unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    } else {
                        console.log('File deleted:', filePath);
                    }
                });
            }
        });
    });
};
