/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { By, EditorView, VSBrowser, WebDriver, WebView, Workbench, until } from 'vscode-extension-tester';
import { join } from 'path';
import { before, describe } from 'mocha';
import { clickOnActivity, waitForWebview, waitUntilTextContains, waitForMultipleElementsLocated, waitUntil, verifyTerminalText } from './util';
import { expect } from 'chai';
import { DND_PALETTE_COMMAND, EXPLORER_ACTIVITY } from './constants';
import { ExtendedEditorView } from './utils/ExtendedEditorView';

export const RUN_OUTPUT = 'Running executable';
export const REQUEST_RECIEVED_OUTPUT = 'request received';

describe('Swagger view UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data', 'helloServicePackage');
    const FILE_NAME = 'hello_service.bal';
    let browser: VSBrowser;
    let driver: WebDriver;
    let workbench : Workbench;
    
    before(async () => {
        VSBrowser.instance.waitForWorkbench();
        const editorView = new EditorView();
        await editorView.closeAllEditors();
        
        workbench = new Workbench();
        await workbench.executeCommand(DND_PALETTE_COMMAND);

        browser = VSBrowser.instance;
        driver = browser.driver;
        await browser.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/${FILE_NAME}`);
        await clickOnActivity(EXPLORER_ACTIVITY);
    });

    it('Test tryit button', async () => {
        
        await driver.wait(until.elementLocated(By.className("codelens-decoration")), 30000);;

        // Click on `Run` code lens to run service
        const editorView = new ExtendedEditorView(new EditorView());
        const runLens = await editorView.getCodeLens("Run");
        await runLens.click();
        await verifyTerminalText(RUN_OUTPUT);

        // Click on `Try it` code lens to open up swagger
        const lens = await editorView.getCodeLens("Try it");
        await lens.click();
        
        // switch to swagger window
        await waitForWebview("Swagger");
        const swaggerWebView = await new EditorView().openEditor('Swagger', 1) as WebView;
        await swaggerWebView.switchToFrame();

        // expand get
        await waitUntil(By.className("operation-tag-content"), 30000 );
        const operationTag = By.className("operation-tag-content");
        const getTab = await swaggerWebView.findWebElement(operationTag);
        await getTab.click();
        const tryItOutButton = By.className("try-out__btn");
        await waitForMultipleElementsLocated(driver, [tryItOutButton]);

        // click try it
        const tryIt = (await swaggerWebView.findWebElements(By.className("try-out__btn")))[0];
        await tryIt.click();

        // cilck execute
        const execute = (await swaggerWebView.findWebElements(By.className("opblock-control__btn")))[0];
        await execute.click();

        // Verify request receival
        await swaggerWebView.switchBack();
        await verifyTerminalText(REQUEST_RECIEVED_OUTPUT);
        await swaggerWebView.switchToFrame();

        // check response
        await waitUntil(By.className("highlight-code"), 30000 );
        const codeBlock = await swaggerWebView.findWebElement(By.className("highlight-code"));
        const reponseBox = await codeBlock.findElement(By.css("code"));
        const reponse = await reponseBox.findElement(By.css("span"));
        await waitUntilTextContains(reponse, '"Hello, World!"', 10000);
        expect(await reponse.getText()).is.equal('"Hello, World!"');
    });

    after(async () => {
        workbench.executeCommand(DND_PALETTE_COMMAND);
    });
});
