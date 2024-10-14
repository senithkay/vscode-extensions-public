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
import { newProjectPath } from '../Utils';
import path from "path";
import { DM_OPERATORS_FILE_NAME } from "../../../constants";

export class DataMapper {
    
    private webView!: Frame;
    configFolder!: string;
    tsFile!: string;

    constructor(private _page: Page, private _name: string) {
    }

    public async init() {
        const webview = await switchToIFrame("Data Mapper View", this._page)
        if (!webview) {
            throw new Error("Failed to switch to Data Mapper View iframe");
        }
        this.webView = webview;

        this.configFolder = path.join(
            newProjectPath, 'testProject', 'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper', this._name);

        this.tsFile = path.join(this.configFolder, `${this._name}.ts`);

    }

    public verifyFileCreation() {
        const operatorsFile = path.join(this.configFolder, `${DM_OPERATORS_FILE_NAME}.ts`);
        return fs.existsSync(operatorsFile) && fs.existsSync(this.tsFile);
    }

    
}

class SidePanel {
    private sidePanel!: Locator;

    constructor(private container: Frame) {
    }

    public async init() {
        this.sidePanel = this.container.getByTestId("sidepanel");
        await this.sidePanel.waitFor();
        const loader = this.sidePanel.getByTestId("sidepanel-loader");
        await loader.waitFor({ state: "hidden" });
    }

    public async search(str: string) {
        const searchInput = this.sidePanel.locator("input");
        await searchInput.type(str);
    }

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

    public async goToExternalsPage() {
        const externalPageBtn = this.sidePanel.locator(`vscode-button:text("Externals") >> ..`);
        await externalPageBtn.waitFor();
        await externalPageBtn.click();
    }

    public async goToConnectorsPage() {
        const connectorsPageBtn = this.sidePanel.locator(`vscode-button:text("Connectors") >> ..`);
        await connectorsPageBtn.waitFor();
        await connectorsPageBtn.click();
    }

    public async addNewConnection() {
        const addNewConnectionBtn = await this.sidePanel.locator(`div:text("Add new connection")`);
        await addNewConnectionBtn.waitFor();
        await addNewConnectionBtn.click();
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
