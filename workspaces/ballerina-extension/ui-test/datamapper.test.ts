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
import { By, VSBrowser, WebView, EditorView, TextEditor } from 'vscode-extension-tester';
import { DIAGRAM_LOADING_TIME } from './constants';
import { wait } from './util';

describe.skip('VSCode Data mapper Webview UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data');
    const FILE_NAME = 'data_mapper.bal';
    let ORIGINAL_CONTENT = '';
    let webview: WebView;

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

        await VSBrowser.instance.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/${FILE_NAME}`);
        await wait(10000);

        ORIGINAL_CONTENT = await new TextEditor().getText();
    });

    it('Open data mapper using code lens', async () => {
        await wait(10000);  // wait for code lenses to appear

        // Click on `Design` code lens to open up data mapper
        const lens = await new TextEditor().getCodeLens('Design');
        await lens?.click();

        await wait(DIAGRAM_LOADING_TIME)

        // Close code editor as it blocks the vscode-extension-tester:Webview from detecting elements
        await new EditorView().closeEditor(FILE_NAME);
        await wait(3000);
    });

    it('Configure data mapper transform function', async () => {
        webview = new WebView()

        await webview.switchToFrame()

        // Click on add new record button for imports
        const inputNewRecord = await webview.findWebElement(By.xpath("//*[@data-testid='dm-inputs']//button[@data-testid='new-record']"));
        await inputNewRecord.click();

        // Click on create record from json
        const importJsonBtn = await webview.findWebElement(By.xpath("//button[@data-testid='import-json']"));
        await importJsonBtn.click();

        await wait(3000);

        // Insert a name for the new record to be created
        const importJsonNameInput = await webview.findWebElement(By.xpath("//*[@data-testid='import-record-name']/*/input"));
        await importJsonNameInput.sendKeys(NEW_JSON_FOR_RECORD_NAME)

        // Insert the json that needs to be converted as a record
        const importJsonJsonInput = await webview.findWebElement(By.xpath("//*[@class='textarea-wrapper']//textarea[1]"));
        await importJsonJsonInput.sendKeys(NEW_JSON_FOR_RECORD);

        // Save the new record type
        const importJsonJsonSave = await webview.findWebElement(By.xpath("//button//*[contains(text(),'Save')]"));
        await importJsonJsonSave.click()

        // Wait until the new record gets added
        await wait(5000);

        // Click existing records option for input type
        const inputExistingRecord = await webview.findWebElement(By.xpath("//*[@data-testid='dm-inputs']//button[@data-testid='exiting-record']"));
        await inputExistingRecord.click()

        // Await LS call to complete, to fetch all record types
        await wait(5000);

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
        await wait(5000);

        // Select `Output` record as the output type
        const outputSelectionItem = await webview.findWebElement(By.xpath("//li/*/*[contains(text(),'Output')]"));
        await outputSelectionItem.click();

        const outputUpdateButton = await webview.findWebElement(By.xpath("//button//*[contains(text(),'Update')]"));
        await outputUpdateButton.click();

        // Click save button to create the data mapper transform function
        const saveButton = await webview.findWebElement(By.xpath("//button[@data-testid='save-btn']"));
        await saveButton.click();

        // Await for the transform function to be created
        await wait(5000);
    });

    it('Create mapping between data mapper nodes', async () => {
        await webview.switchToFrame()

        // Create mapping between Input.st1 and Output.st1
        const inputSt1 = await webview.findWebElement(By.xpath("//div[@data-name='input.st1.OUT']"));
        await inputSt1.click();
        const outputSt1 = await webview.findWebElement(By.xpath("//div[@data-name='mappingConstructor.Output.st1.IN']"));
        await outputSt1.click();

        // Await for the mapping change to take place
        await wait(5000);
    });

    it('Verify data mapper generated code is correct', async () => {
        await webview.switchBack()

        await VSBrowser.instance.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/${FILE_NAME}`);
        await wait(5000);
        await new EditorView().openEditor(FILE_NAME);

        // Check if generated code equals expected code
        const text = await new TextEditor().getText();
        expect(text.replace(/\s/g, '')).to.include(EXPECTED_NEW_RECORD_FROM_JSON.replace(/\s/g, ''));
        expect(text.replace(/\s/g, '')).to.include(EXPECTED_TRANSFORM_FUNCTION.replace(/\s/g, ''));
    });

    after(async () => {
        await webview.switchBack()

        await VSBrowser.instance.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/${FILE_NAME}`);
        await wait(5000);
        await new EditorView().openEditor(FILE_NAME);

        // Revert content back to the original state
        const textEditor = new TextEditor();

        await textEditor.setText(ORIGINAL_CONTENT);
        await textEditor.save();
    })
});
