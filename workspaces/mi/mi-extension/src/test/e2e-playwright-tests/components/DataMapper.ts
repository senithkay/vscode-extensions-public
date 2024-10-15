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
import { newProjectPath, resourcesFolder } from '../Utils';
import path from "path";
import { DM_OPERATORS_FILE_NAME } from "../../../constants";
import { IOType } from "@wso2-enterprise/mi-core";


type SchemaTypeLabel = "JSON" | "JSON Schema" | "XML" | "CSV";
export class DataMapper {

    private webView!: Frame;
    // configFolder!: string;
    // tsFile!: string;

    constructor(private _page: Page, private _name: string) {
    }

    public async init() {
        const webview = await switchToIFrame("Data Mapper View", this._page)
        if (!webview) {
            throw new Error("Failed to switch to Data Mapper View iframe");
        }
        this.webView = webview;

    }

    public verifyFileCreation() {
        const configFolder = path.join(
            newProjectPath, 'testProject', 'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper', this._name);

        const tsFile = path.join(configFolder, `${this._name}.ts`);
        const operatorsFile = path.join(configFolder, `${DM_OPERATORS_FILE_NAME}.ts`);

        return fs.existsSync(operatorsFile) && fs.existsSync(tsFile);
    }

    public async importSchema(ioType: IOType, schemaType: SchemaTypeLabel, content: string) {
        const importNode = this.webView.getByTestId(`${ioType}-data-import-node`);
        await importNode.waitFor();
        await importNode.click();

        const importForm = new ImportForm(this.webView);
        await importForm.init();
        await importForm.importData(schemaType, content);
        await importNode.waitFor({ state: 'detached' });
    }

    public async waitForCanvasToLoad() {
        await this.webView.waitForSelector(`div#data-mapper-canvas-container`);
    }

    public async mapFields(sourceFieldFQN: string, targetFieldFQN: string) {
        const links = this.webView.locator('g[data-linkid]');
        const linkCount = await links.count();

        const sourceField = this.webView.locator(`div[id="recordfield-${sourceFieldFQN}"]`);
        await sourceField.waitFor();
        await sourceField.click();

        const targetField = this.webView.locator(`div[id="recordfield-${targetFieldFQN}"]`);
        await targetField.waitFor();
        await targetField.click();

        await expect(links).not.toHaveCount(linkCount);
    }

    public verifyTsFileContent() {
        const tsFile = path.join(newProjectPath, 'testProject', 'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper', this._name, `${this._name}.ts`);
        const comparingFile = path.join(resourcesFolder, 'file-snapshots', `${this._name}.ts`);

        const tsFileContent = fs.readFileSync(tsFile, 'utf8');
        const comparingFileContent = fs.readFileSync(comparingFile, 'utf8');
        
        return tsFileContent === comparingFileContent;
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






    //--------------------------------------------------------------------------------

    public async addMediator(mediatorName: string, data?: FormFillProps, submitBtnText?: string) {
        const mediator = this.sidePanel.locator(`#card-select-${mediatorName}`);
        await mediator.waitFor({ timeout: 180000 });
        await mediator.click();

        const drawer = this.sidePanel.locator("#drawer1");
        await drawer.waitFor();
        const formDiv = drawer.locator("div").first();
        await formDiv.waitFor();

        const form = new Form(undefined, undefined, formDiv);
        if (data) {
            await form.fill(data);
        }
        await form.submit(submitBtnText ?? "Submit");
    }

    public async updateMediator(props: FormFillProps) {
        const form = new Form(undefined, undefined, this.sidePanel);
        await form.fill(props);
        await form.submit("Submit");
    }

    public async addConnector(connectionName: string, operationName: string, props: FormFillProps) {
        const connection = this.sidePanel.locator(`#card-select-${connectionName}`);
        await connection.waitFor();
        await connection.click();

        const operation = this.sidePanel.locator(`#card-select-${operationName}`);
        await operation.waitFor();
        await operation.click();

        const form = new Form(undefined, undefined, this.sidePanel);
        await form.fill(props);
        await form.submit("Submit");
    }

    public async selectConnectorOperationFromConnectorTab(connectorName: string, operationName: string) {
        const connector = this.sidePanel.locator(`#card-select-${connectorName}`);
        await connector.waitFor();
        await connector.click();

        const operation = this.sidePanel.locator(`#card-select-${operationName}`);
        await operation.waitFor();
        await operation.click();

        const form = new Form(undefined, undefined, this.sidePanel);
        return form;
    }



    public async verifyConnection(name: string, type: string) {
        const connectionSection = this.sidePanel.locator(`h4:text("Available Connections") >> ../..`);
        const connectionTitle = connectionSection.locator(`div:text("${name}")`);
        connectionTitle.waitFor();
        const connectionTypeLabel = connectionSection.locator(`div:text("${type}")`);
        connectionTypeLabel.waitFor();
        if (connectionTitle && connectionTypeLabel) {
            return true;
        }
        return false;
    }

    public async close() {
        const closeIcon = this.sidePanel.locator('i.codicon.codicon-close');
        await closeIcon.waitFor();
        await closeIcon.click();
    }
}
