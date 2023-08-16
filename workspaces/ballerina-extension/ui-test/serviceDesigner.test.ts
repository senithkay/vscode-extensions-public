/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import { join } from 'path';
import { By, VSBrowser, WebView, EditorView, TextEditor, WebDriver } from 'vscode-extension-tester';
import {
    switchToIFrame,
    waitUntil,
    getLabelElement
} from './util';
import { ExtendedEditorView } from './utils/ExtendedEditorView';
import { ServiceDesigner } from './utils/ServiceDesigner';

describe('VSCode Service Designer Webview UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data', 'sampleService');
    const FILE_NAME = 'service.bal';
    let ORIGINAL_CONTENT = `import ballerina/http;

    service /breakingbad on new http:Listener(9090) {
    
    
    }
    `;
    let browser: VSBrowser;
    let driver: WebDriver;
    let webview: WebView;

    before(async () => {
        browser = VSBrowser.instance;
        driver = browser.driver;
        webview = new WebView();
        await new EditorView().closeAllEditors();
        await browser.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/${FILE_NAME}`);
        const textEditor = new TextEditor();
        await textEditor.setText(ORIGINAL_CONTENT);
        await textEditor.save();
    });

    it('Open service designer view using code lens', async () => {
        // wait till 'Visualize' code lens to appear
        const editorView = new ExtendedEditorView(new EditorView());
        const lens = await editorView.getCodeLens('Visualize');
        await lens.click();

        // Wait for the service design view to load
        await switchToIFrame('Overview Diagram', driver);
        const serviceDesignView = By.xpath("//*[@data-testid='service-design-view']");
        await waitUntil(serviceDesignView, 30000);

        expect(getLabelElement(driver, '/hello')).to.be.exist;
        expect(getLabelElement(driver, 'http:Listener(9090)')).to.be.exist;
        expect(getLabelElement(driver, 'Service list is empty')).to.be.exist;

    });

    it('Add a new get resource with a new record', async () => {

        const serviceOverview = new ServiceDesigner(driver, webview);

        const resourceForm = await serviceOverview.clickAddResource();

        await resourceForm.updateResourcePath("characters");

        await resourceForm.addResponseParam("Character[]", true);

        await resourceForm.saveResource("GET");

        await webview.switchBack();
        await new EditorView().openEditor(FILE_NAME);

        const EXPECTED = `import ballerina/http;
        service /breakingbad on new http:Listener(9090) {
            resource function get characters() returns error?|Character[] {
            }
        }
        type Character record {
        };
        `;

        // Check if generated code equals expected code
        const text = await new TextEditor().getText();
        expect(text.replace(/\s/g, '')).to.include(EXPECTED.replace(/\s/g, ''));

    });


    it('Add a new post resource with existing record', async () => {

        await switchToIFrame('Overview Diagram', driver);
       
        const serviceOverview = new ServiceDesigner(driver, webview);

        const resourceForm = await serviceOverview.clickAddResource();

        await resourceForm.selectHttpMethod("POST");

        await resourceForm.updateResourcePath("cooking");

        await resourceForm.addResponseParam("Character");

        await resourceForm.saveResource("POST");

        await webview.switchBack();
    
        await new EditorView().openEditor(FILE_NAME);

        const EXPECTED = `resource function post cooking() returns error?|Character {}}`;

        // Check if generated code equals expected code
        const text = await new TextEditor().getText();
        expect(text.replace(/\s/g, '')).to.include(EXPECTED.replace(/\s/g, ''));

    });

    it('Add a new put resource different return type', async () => {

        await switchToIFrame('Overview Diagram', driver);

        const serviceOverview = new ServiceDesigner(driver, webview);

        const resourceForm = await serviceOverview.clickAddResource();

        await resourceForm.selectHttpMethod("PUT");

        await resourceForm.updateResourcePath("selling");

        await resourceForm.addResponseParam("string");

        await resourceForm.addResponseParam("Character", false, "Accept");

        await resourceForm.saveResource("PUT");

        await webview.switchBack();

        await new EditorView().openEditor(FILE_NAME);

        const EXPECTED = `resource function put selling() returns error?|string|record {|*http:Accepted; Character body;|} {}}`;

        // Check if generated code equals expected code
        const text = await new TextEditor().getText();
        expect(text.replace(/\s/g, '')).to.include(EXPECTED.replace(/\s/g, ''));

    });

    after(async () => {
        await webview.switchBack();
        await new EditorView().openEditor(FILE_NAME);
        const textEditor = new TextEditor();
        await textEditor.setText("");
        await textEditor.save();
    });

});
