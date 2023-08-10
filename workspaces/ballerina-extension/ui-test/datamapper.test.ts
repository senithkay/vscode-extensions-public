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
import { By, VSBrowser, WebView, EditorView, TextEditor, until, WebDriver } from 'vscode-extension-tester';
import {
    clickOnActivity,
    switchToIFrame,
    waitForElementToDisappear,
    waitUntil,
    waitForMultipleElementsLocated
} from './util';
import { EXPLORER_ACTIVITY } from "./constants";
import { ExtendedEditorView } from "./utils/ExtendedEditorView";

describe('VSCode Data mapper Webview UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data');
    const FILE_NAME = 'data_mapper.bal';
    let ORIGINAL_CONTENT = '';
    let webview: WebView;
    let browser: VSBrowser;
    let driver: WebDriver;

    const NEW_JSON_FOR_RECORD_NAME = 'ImportedRecord';
    const NEW_JSON_FOR_RECORD = `{"st1":"string"}`;
    const EXPECTED_NEW_RECORD_FROM_JSON = `type ImportedRecord record {
        string st1;
    };`;
    const EXPECTED_TRANSFORM_FUNCTION = `function transform(ImportedRecord importedRecord, Input input) returns Output => {
        st1: input.st1
    };`;

    before(async () => {
        const editorView = new EditorView();
        await editorView.closeAllEditors();

        browser = VSBrowser.instance;
        driver = browser.driver;
        await browser.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/${FILE_NAME}`);
        await clickOnActivity(EXPLORER_ACTIVITY);

        ORIGINAL_CONTENT = await new TextEditor().getText();
    });
    
    it('Open data mapper using code lens', async () => {
        // Wait and click on `Visualize` code lens to open up data mapper
        const editorView = new ExtendedEditorView(new EditorView());
        const lens = await editorView.getCodeLens('Visualize');
        await lens?.click();

        // Wait for the data mapper to load
        await switchToIFrame('Overview Diagram', driver);
        const dataMapperForm = By.xpath("//*[@data-testid='data-mapper-form']");
        await waitUntil(dataMapperForm);
    });

    it('Configure data mapper transform function', async () => {
        webview = new WebView();

        // Click on add new record button for imports
        const inputNewRecord = await webview.findWebElement(By.xpath("//*[@data-testid='dm-inputs']//button[@data-testid='new-record']"));
        await inputNewRecord.click();

        // Click on create record from json
        const importJsonBtn = await webview.findWebElement(By.xpath("//button[@data-testid='import-json']"));
        await importJsonBtn.click();

        // Wait for record form to load
        const recordForm = By.xpath("//*[@data-testid='record-form']");
        await waitUntil(recordForm);

        // Insert a name for the new record to be created
        const importJsonNameInput = await webview.findWebElement(By.xpath("//*[@data-testid='import-record-name']/*/input"));
        await importJsonNameInput.sendKeys(NEW_JSON_FOR_RECORD_NAME);

        // Insert the json that needs to be converted as a record
        const importJsonJsonInput = await webview.findWebElement(By.xpath("//*[@class='textarea-wrapper']//textarea[1]"));
        await importJsonJsonInput.sendKeys(NEW_JSON_FOR_RECORD);

        // Save the new record type
        const importJsonJsonSave = await webview.findWebElement(By.xpath("//button//*[contains(text(),'Save')]"));
        await importJsonJsonSave.click();

        // Wait until the new record gets added
        const recordLoader = By.xpath("//*[@data-testid='test-preloader-vertical']");
        await waitForElementToDisappear(driver, recordLoader);

        // Click existing records option for input type
        const inputExistingRecord = await webview.findWebElement(By.xpath("//*[@data-testid='dm-inputs']//button[@data-testid='exiting-record']"));
        await inputExistingRecord.click();

        // Await LS call to complete, to fetch all record types
        const lastInputCompletionItem = By.xpath("//*[@data-option-index='2']");
        await waitUntil(lastInputCompletionItem);

        // Select `Input` record as the input type
        const inputSelectionItem = await webview.findWebElement(By.xpath("//li/*/*[contains(text(),'Input')]"));
        await inputSelectionItem.click();

        // Click Add to as `Input` as the input type
        const inputAddButton = await webview.findWebElement(By.xpath("//button//*[contains(text(),'Add')]"));
        await inputAddButton.click();

        // Click existing records option for output type
        const outputExistingRecord = await webview.findWebElement(By.xpath("//*[@data-testid='dm-output']//button[@data-testid='exiting-record']"));
        await outputExistingRecord.click();

        // Await LS call to complete, to fetch all record types
        const lastOutputCompletionItem = By.xpath("//*[@data-option-index='2']");
        await waitUntil(lastOutputCompletionItem);

        // Select `Output` record as the output type
        const outputSelectionItem = await webview.findWebElement(By.xpath("//li/*/*[contains(text(),'Output')]"));
        await outputSelectionItem.click();

        const outputUpdateButton = await webview.findWebElement(By.xpath("//button//*[contains(text(),'Update')]"));
        await outputUpdateButton.click();

        // Click save button to create the data mapper transform function
        const saveButton = await webview.findWebElement(By.xpath("//button[@data-testid='save-btn']"));
        await saveButton.click();

        // Click continue button to proceed with the transform function creation
        const continueButton = await webview.findWebElement(By.xpath("//button[@data-testid='dm-save-popover-continue-btn']"));
        await continueButton.click();

        // Await for the transform function to be created
        const inputNode1 = By.xpath("//*[@data-testid='input-node']");
        const inputNode2 = By.xpath("//*[@data-testid='"
            + `${NEW_JSON_FOR_RECORD_NAME.charAt(0).toLowerCase() + NEW_JSON_FOR_RECORD_NAME.slice(1)}-node` + "']");
        const outputNode = By.xpath("//*[@data-testid='mappingConstructor.Output-node']");
        await waitForMultipleElementsLocated(driver, [inputNode1, inputNode2, outputNode]);
    });

    it('Create mapping between data mapper nodes', async () => {
        webview = new WebView();
        // Create mapping between Input.st1 and Output.st1
        const inputSt1 = await webview.findWebElement(By.xpath("//div[@data-name='input.st1.OUT']"));
        await inputSt1.click();
        const outputSt1 = await webview.findWebElement(By.xpath("//div[@data-name='mappingConstructor.Output.st1.IN']"));
        await outputSt1.click();

        // Await for the mapping change to take place
        const link = By.xpath("//*[@data-testid='link-from-input.st1.OUT-to-mappingConstructor.Output.st1.IN']");
        await waitUntil(link);
    });

    it('Verify data mapper generated code is correct', async () => {
        await webview.switchBack();

        await new EditorView().openEditor(FILE_NAME);

        // Check if generated code equals expected code
        const text = await new TextEditor().getText();
        expect(text.replace(/\s/g, '')).to.include(EXPECTED_NEW_RECORD_FROM_JSON.replace(/\s/g, ''));
        expect(text.replace(/\s/g, '')).to.include(EXPECTED_TRANSFORM_FUNCTION.replace(/\s/g, ''));
    });

    after(async () => {
        await webview.switchBack();

        await new EditorView().openEditor(FILE_NAME);

        // Revert content back to the original state
        const textEditor = new TextEditor();

        await textEditor.setText(ORIGINAL_CONTENT);
        await textEditor.save();
    });
});
