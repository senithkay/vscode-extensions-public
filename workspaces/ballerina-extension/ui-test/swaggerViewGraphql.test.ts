/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { By, EditorView, VSBrowser, WebDriver, WebView, Workbench, until, InputBox } from 'vscode-extension-tester';
import { join } from 'path';
import { before, describe } from 'mocha';
import { clickOnActivity, waitForWebview, waitUntilTextContains, waitForMultipleElementsLocated, waitUntil, verifyTerminalText, wait } from './util';
import { expect } from 'chai';
import { DND_PALETTE_COMMAND, EXPLORER_ACTIVITY } from './constants';
import { ExtendedEditorView } from './utils/ExtendedEditorView';
import { SwaggerView } from './utils/SwaggerView';
import { GraphqlTryItView } from './utils/GraphqlTryitView';

export const RUN_OUTPUT = 'Running executable';
export const REQUEST_RECIEVED_OUTPUT = 'request received';

describe('Swagger view UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data', 'graphqlServicePackage');
    const FILE_NAME = 'graphql_service.bal';
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
        await wait(3000);
        const lens = await editorView.getCodeLens("Try it");
        await lens.click();

        // Confirm path
        const inputBox = new InputBox();
        await wait(2000);
        await inputBox.confirm();
        
        // switch to swagger window
        await waitForWebview("Graphql");
        console.log("swagger available");
        const graphqlWebView = await new EditorView().openEditor('Graphql') as WebView;
        const graphqlView = new GraphqlTryItView(graphqlWebView);
        await graphqlWebView.switchToFrame();

        // click explorer button
        await graphqlView.clickExplorer();

        // select query variable
        await graphqlView.selectQueryVariable();

        // verify query generation
        await graphqlView.verifyQueryGeneration();

        // click execute button
        await graphqlView.execute();

        // get query response
        const response =  await graphqlView.getResponse();
        expect(response).is.equal('5.833');
    });

    after(async () => {
        workbench.executeCommand(DND_PALETTE_COMMAND);
    });
});
