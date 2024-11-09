/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { expect, Frame, Locator, Page } from "@playwright/test";
import { switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";
import { Form, FormFillProps } from "./Form";
import * as fs from 'fs';
import { dataFolder, newProjectPath, page } from '../Utils';
import path from "path";
import { DM_OPERATORS_FILE_NAME } from "../../../constants";
import { IOType } from "@wso2-enterprise/mi-core";


type SchemaTypeLabel = "JSON" | "JSON Schema" | "XML" | "CSV";
export class DataMapper {

    public webView!: Frame;
    // configFolder!: string;
    tsFile!: string;
    comparingFolder!: string;

    constructor(private _page: Page, private _name: string) {
    }

    public async init() {
        const webview = await switchToIFrame("Data Mapper View", this._page)
        if (!webview) {
            throw new Error("Failed to switch to Data Mapper View iframe");
        }
        this.webView = webview;
        this.tsFile = path.join(newProjectPath, 'testProject', 'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper', this._name, `${this._name}.ts`);
        this.comparingFolder = path.join(dataFolder, 'datamapper-files', this._name);
    }

    public getWebView() {
        return this.webView;
    }



    public async scrollClickOutput(locator: Locator) {
        await this.scrollOutputUntilClickable(locator);
        await locator.click();
    }

    public async scrollOutputUntilClickable(locator: Locator) {
        const outputNode = this.webView.locator(`div[data-testid$="Output-node"]`);
        await outputNode.hover();

        for (let i = 0; !(await this.isClickable(locator)) && i < 5; i++) {
            await page.page.mouse.wheel(0, 400);
            // await page.page.waitForTimeout(1000);
            // console.log('.:.', i);
        }
    }



    public async isClickable(element: Locator): Promise<boolean> {
        // Check if the element is visible
        // const isVisible = await element.isVisible();

        // // Check if the element is enabled (not disabled)
        // const isEnabled = await element.isEnabled();

        // Check if the element is not covered by other elements
        const isNotObstructed = await element.evaluate((el) => {
            const rect = el.getBoundingClientRect();
            const elementAtPoint = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
            return elementAtPoint === el || el.contains(elementAtPoint) || (elementAtPoint?.contains(el) ?? false);
        });

        // Element is clickable if it's visible, enabled, and not obstructed
        return isNotObstructed;
    }



    public async waitForProgressEnd() {
        await this.webView.waitForSelector('vscode-progress-ring', { state: 'detached' });
    }

    public async importSchema(ioType: IOType, schemaType: SchemaTypeLabel, schemaFile: string) {
        const importNode = this.webView.getByTestId(`${ioType}-data-import-node`);
        await importNode.waitFor();
        await importNode.click();

        const importForm = new ImportForm(this.webView);
        await importForm.init();
        await importForm.importData(schemaType, fs.readFileSync(schemaFile, 'utf8'));
        await importNode.waitFor({ state: 'detached' });
    }

    public async loadJsonFromCompFolder() {

        const inputJsonFile = path.join(this.comparingFolder, 'inp.json');
        const outputJsonFile = path.join(this.comparingFolder, 'out.json');
        await this.importSchema(IOType.Input, 'JSON', inputJsonFile);
        await this.importSchema(IOType.Output, 'JSON', outputJsonFile);

    }

    public async mapFields(sourceFieldFQN: string, targetFieldFQN: string) {

        const sourceField = this.webView.locator(`div[id="recordfield-${sourceFieldFQN}"]`);
        await sourceField.waitFor();
        await sourceField.click();

        const targetField = this.webView.locator(`div[id="recordfield-${targetFieldFQN}"]`);
        await targetField.waitFor();
        await targetField.click();


        await this.webView.waitForSelector('vscode-progress-ring', { state: 'attached' });

        await this.webView.waitForSelector('vscode-progress-ring', { state: 'detached' });

    }

    public async mapArrayDirect(sourceFieldFQN: string, targetFieldFQN: string) {

        const sourceField = this.webView.locator(`div[data-name="${sourceFieldFQN}.OUT"]`);
        await sourceField.waitFor();
        await sourceField.click();

        const targetField = this.webView.locator(`div[data-name="${targetFieldFQN}.IN"]`);
        await targetField.waitFor();
        await targetField.click();

        const menuItem = this.webView.locator(`div[id="menu-item-a2a-direct"]`);
        await menuItem.waitFor();
        await menuItem.click();

        // await this.webView.waitForSelector('vscode-progress-ring', { state: 'attached' });
        await this.webView.waitForSelector('vscode-progress-ring', { state: 'detached' });

    }

    public async mapArrayInner(sourceFieldFQN: string, targetFieldFQN: string) {

        const sourceField = this.webView.locator(`div[data-name="${sourceFieldFQN}.OUT"]`);
        await sourceField.waitFor();
        await sourceField.click();

        const targetField = this.webView.locator(`div[data-name="${targetFieldFQN}.IN"]`);
        await targetField.waitFor();
        await targetField.click();

        const menuItem = this.webView.locator(`div[id="menu-item-a2a-inner"]`);
        await menuItem.waitFor();
        await menuItem.click();

        // await this.webView.waitForSelector('vscode-progress-ring', { state: 'attached' });
        await this.webView.waitForSelector('vscode-progress-ring', { state: 'detached' });

        const expandButton = await this.webView.locator(`div[data-testid="array-connector-node-${targetFieldFQN}.IN"] vscode-button[title="Map array elements"]`);
        await expandButton.waitFor();
        await expandButton.click();

        const fieldName = sourceFieldFQN.split('.').pop();
        await this.webView.waitForSelector(`div[id^="recordfield-focusedInput."]`);

    }

    public async gotoPreviousView() {
        const breadcrumbs = this.webView.locator(`a[data-testid^="dm-header-breadcrumb-"]`);
        const previousCrumb = this.webView.locator(`a[data-testid="dm-header-breadcrumb-${await breadcrumbs.count() - 1}"]`);
        await previousCrumb.waitFor();
        await previousCrumb.click();
        await previousCrumb.waitFor({ state: 'detached' });
    }

    public async saveSnapshot(snapshotFile: string) {
        const root = this.webView.locator(`div#data-mapper-canvas-container`);
        await root.waitFor();
        fs.writeFileSync(snapshotFile, await root.innerHTML());
    }

    public async runEventActions(eaFile: string) {
        const eaFileContent = fs.readFileSync(eaFile, 'utf8');
        const actionLines = eaFileContent.split('\n');

        const links = this.webView.locator('g [data-testid]');
        let linkCount = await links.count();

        for (const actionLine of actionLines) {
            const [_, actionType, query] = actionLine.split(':');
            switch (actionType) {
                case 'click':
                    linkCount = await links.count();
                    const element = this.webView.locator(query);
                    await element.waitFor();
                    await element.click();
                    break;
                case 'wait':
                    await this.webView.waitForSelector('vscode-progress-ring', { state: 'detached' });
                    // await this.webView.waitForSelector(query, { state: 'attached' });
                    // await expect(links).not.toHaveCount(linkCount);
                    //await page.page.waitForTimeout(3000);
                    break;
            }
        }

    }

    public async expectErrorLink(locator: Locator) {
        await locator.waitFor({ state: 'attached' });
        const hasDiagnostic = await locator.evaluate((el) => el.getAttribute('data-diagnostics') == "true");
        expect(hasDiagnostic).toBeTruthy();
    }

    public verifyTsFileContent(comparingFile: string) {
        return this.compareFiles(this.tsFile, path.join(this.comparingFolder, comparingFile));
    }

    public compareFiles(file1: string, file2: string) {
        const file1Content = fs.readFileSync(file1, 'utf8');
        const file2Content = fs.readFileSync(file2, 'utf8');

        return file1Content === file2Content;
    }

    public verifyFileCreation() {
        const configFolder = path.join(
            newProjectPath, 'testProject', 'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper', this._name);

        const operatorsFile = path.join(configFolder, `${DM_OPERATORS_FILE_NAME}.ts`);

        return fs.existsSync(operatorsFile) && fs.existsSync(this.tsFile);
    }

    public overwriteTsFile(newTsFile: string) {
        const tsFile = path.join(newProjectPath, 'testProject', 'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper', this._name, `${this._name}.ts`);
        fs.writeFileSync(tsFile, fs.readFileSync(newTsFile, 'utf8'));
    }


}

class ImportForm {
    private sidePanel!: Locator;

    constructor(private container: Frame) {
    }

    public async init() {
        this.sidePanel = this.container.getByTestId("import-data-form");
        await this.sidePanel.waitFor();
    }

    public async importData(importTypeLabel: SchemaTypeLabel, content: string) {
        const typeButton = this.sidePanel.getByText(`Import from ${importTypeLabel}`, { exact: true });
        await typeButton.waitFor();
        await typeButton.click();

        const textArea = this.sidePanel.locator(`textarea`);
        await textArea.waitFor();
        await textArea.fill(content);

        const submitBtn = this.sidePanel.locator(`vscode-button:text("Save")`);
        await submitBtn.waitFor();
        await submitBtn.click();
    }

    public async close() {
        const closeIcon = this.sidePanel.locator('i.codicon.codicon-close');
        await closeIcon.waitFor();
        await closeIcon.click();
    }
}
