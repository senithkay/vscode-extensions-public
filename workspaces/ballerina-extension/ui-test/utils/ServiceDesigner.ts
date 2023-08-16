/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { waitUntil } from "../util";
import { By, Input, WebDriver, WebElement, WebView, until } from "vscode-extension-tester";

let webview: WebView;
let driver: WebDriver;

let resourceSaveBtn: WebElement

export class ServiceDesigner {
    constructor(webDriver, webView) {
        driver = webDriver;
        webview = webView;
    }

    async clickAddResource() {
        // Click on add new resource button
        const addResourceBtn = await webview.findWebElement(By.xpath("//*[@data-testid='add-resource-btn']"));
        await addResourceBtn.click();

        // Wait for resource form
        const resourceForm = By.xpath("//*[@data-testid='resource-form']");
        await waitUntil(resourceForm, 30000);

        // Wait for the loading element to become stale (not found)
        const loadingElement = await driver.findElement(By.xpath("//*[@role='progressbar']"));
        await driver.wait(until.stalenessOf(loadingElement));

        // Resource Save button
        resourceSaveBtn = await webview.findWebElement(By.xpath("//*[@data-testid='save-btn']"));
        return new ResourceForm()
    }

}

class ResourceForm {

    // Select the HTTP Method
    async selectHttpMethod(method: string) {
        // Find and click on the MuiSelect component to open the dropdown
        const selectComponent = await driver.findElement(By.className('MuiSelect-selectMenu'));
        await selectComponent.click();

        // Find the option based on the optionText
        const option = await selectComponent.findElement(By.xpath(`//*[contains(text(), '${method}')]`));
        await option.click();

        // Wait for changes from LS
        await waitForDisableEnableElement();
    }

    // Update the resource path 
    async updateResourcePath(path: string) {
        // Resource path input update
        const resourcePath = await webview.findWebElement(By.xpath("//input[@value='path']")) as Input;
        await resourcePath.click();
        await resourcePath.sendKeys(path);
        // Wait for changes from LS
        await waitForDisableEnableElement();
    }

    // Add a new query param
    async addQueryParam() {
        const addQueryBtn = await webview.findWebElement(By.xpath("//*[@data-test-id='query-param-add-button']"));
        await addQueryBtn.click();
        // Wait for changes from LS
        await waitForDisableEnableElement();
    }


    async addBodyParam(type: string, typeName: string, newType?: boolean) {
        // Click add parameter button
        const addParamBtn = await webview.findWebElement(By.xpath("//*[@data-test-id='param-add-button']"));
        await addParamBtn.click();
        // Wait for changes from LS
        await waitForDisableEnableElement();

        // Param save button
        const paramFormSaveBtn = By.xpath("//*[@data-testid='path-segment-add-btn']");
        const saveParambtn = await waitUntil(paramFormSaveBtn);

        // Wait for param form
        const paramForm = By.xpath("//*[@data-testid='Select TypeQuery']");
        await waitUntil(paramForm);

        // Get the type input element
        const typeInput = await webview.findWebElement(By.xpath("//input[@value='string?']"));
        // clear the input add new Record "Foo"
        await typeInput.click();
        const clearBtn = await typeInput.findElement(By.xpath("//*[@title='Clear']"));
        await clearBtn.click();
        await typeInput.sendKeys(type);

        if (newType) {
            // Wait for diagnostic
            const getDiagnosticsMsg = By.xpath("//*[@data-testid='expr-diagnostics']");
            await waitUntil(getDiagnosticsMsg);

            // Click "Create Record"
            const createRecordBtn = await waitUntil(By.xpath("//*[contains(text(), 'Create Record')]"));
            await createRecordBtn.click();
            await driver.wait(until.stalenessOf(createRecordBtn));
            // Wait for changes from LS
            await waitForDisableEnableElement();
        }

        const paramInput = await webview.findWebElement(By.xpath("//input[@value='param']"));
        await paramInput.click();
        await paramInput.sendKeys(typeName);
        // Wait for changes from LS
        await waitForDisableEnableElement();

        // Click save parameter
        await driver.wait(until.elementIsEnabled(saveParambtn));
        await saveParambtn.click();

        // Wait for param item
        const getParamItem = By.xpath(`//*[@data-testid='${type} ${typeName}-item']`);
        await waitUntil(getParamItem);
        
    }

    async addResponseParam(type: string, newType?: boolean, returnType?: string) {
        // Click add response
        const addBtn = By.xpath("//*[@data-test-id='response-add-button']");
        const responseAddBtn = await waitUntil(addBtn);
        await responseAddBtn.click();

        if (returnType) {
            // Get return type input
            const returnTypeInput = await webview.findWebElement(By.xpath("//*[@id='param-type-selector']"));
            await returnTypeInput.click();
            await returnTypeInput.sendKeys(returnType);

            // Find the option based on the optionText
            const option = await webview.findWebElement(By.xpath(`//*[contains(text(), '${returnType}')]`));
            await option.click();
        }
        // Get empty input value
        const responseTypeInput = await webview.findWebElement(By.xpath("//*[@data-testid='type-select-dropdown']"));
        await responseTypeInput.click();

        // Find and click on the input element of the Autocomplete component
        const input = await responseTypeInput.findElement(By.className('MuiAutocomplete-input'));
        await input.sendKeys(type);

        if (newType) {
            // Wait for diagnostic
            const getDiagnosticsMsg = By.xpath("//*[@data-testid='expr-diagnostics']");
            await waitUntil(getDiagnosticsMsg);

            // Click "Create Record"
            const createRecordBtn = await waitUntil(By.xpath("//*[contains(text(), 'Create Record')]"));
            await createRecordBtn.click();
            await driver.wait(until.stalenessOf(createRecordBtn));
        }

        const responseSaveBtn = await webview.findWebElement(By.xpath("//*[@data-testid='path-segment-add-btn']"));
        await driver.wait(until.elementIsEnabled(responseSaveBtn));
        await responseSaveBtn.click();

        await waitUntil(addBtn);
    }

    async saveResource(method: string) {
        // Wait for changes from LS
        await waitForDisableEnableElement();
        await resourceSaveBtn.click();

        // Wait for new resource
        const resource = By.xpath(`//*[@class='function-box ${method.toLowerCase()}']`);
        await waitUntil(resource);

        await webview.switchBack();
    }

}

async function waitForDisableEnableElement() {
    await driver.wait(until.elementIsDisabled(resourceSaveBtn));
    await driver.wait(until.elementIsEnabled(resourceSaveBtn));
}
