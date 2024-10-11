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

export class DataMapper {
    private dataMapperWebView!: Frame;

    constructor(private _page: Page, private _name: string) {
    }

    public async init() {
        const webview = await switchToIFrame("Data Mapper View", this._page)
        if (!webview) {
            throw new Error("Failed to switch to Data Mapper View iframe");
        }
        this.dataMapperWebView = webview;

        const dataMapperConfigFolder = path.join(
            newProjectPath, 'testProject', 'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper', this._name);

        const dmUtilsFile = path.join(dataMapperConfigFolder, 'dm-utils.ts');
        const tsFile = path.join(dataMapperConfigFolder, `${this._name}.ts`);

        if (!(fs.existsSync(dmUtilsFile) && fs.existsSync(tsFile))) {
            throw new Error(`Data mapper files creation failed.`);
        }

    }

    public async edit() {
        const editButton = await this.dataMapperWebView.waitForSelector('vscode-button[title="Edit"]');
        await editButton.click();
    }



    // public async getRoot() {
    //     const titleElement = await this.dataMapperWebView.waitForSelector('#root div');
    //     const title = await titleElement.innerHTML();
    //     return title;
    // }

    public async getMediator(mediatorName: string, index: number = 0) {
        const mediatorNode = (await this.getDiagramContainer()).locator(`[data-testid^="mediatorNode-${mediatorName}-"]`).nth(index).locator('div').first();
        await mediatorNode.waitFor();
        await mediatorNode.hover();
        return new Mediator(this.dataMapperWebView, mediatorNode);
    }

    public async addMediator(mediatorName: string, index: number = 0, data?: FormFillProps, submitBtnText?: string) {
        await this.clickPlusButtonByIndex(index);

        const sidePanel = new SidePanel(this.dataMapperWebView);
        await sidePanel.init();
        await sidePanel.search(mediatorName);
        await sidePanel.addMediator(mediatorName, data, submitBtnText);
    }

    public async goToExternalsPage() {
        const sidePanel = new SidePanel(this.dataMapperWebView);
        await sidePanel.init();
        sidePanel.goToExternalsPage();
    }

    public async goToConnectorsPage() {
        const sidePanel = new SidePanel(this.dataMapperWebView);
        await sidePanel.init();
        sidePanel.goToConnectorsPage();
    }

    public async addNewConnection(index: number = 0) {
        await this.clickPlusButtonByIndex(index);

        const sidePanel = new SidePanel(this.dataMapperWebView);
        await sidePanel.init();
        sidePanel.goToExternalsPage();
        sidePanel.addNewConnection();
    }

    public async addNewConnectionFromConnectorTab() {
        const sidePanel = new SidePanel(this.dataMapperWebView);
        await sidePanel.init();
        sidePanel.addNewConnection();
    }

    public async verifyConnection(name: string, type: string) {
        const sidePanel = new SidePanel(this.dataMapperWebView);
        await sidePanel.init();
        sidePanel.goToExternalsPage();
        return sidePanel.verifyConnection(name, type);
    }

    public async addConnector(connectionName: string, operationName: string, index: number = 0, props: FormFillProps) {
        await this.clickPlusButtonByIndex(index);
        await this.goToExternalsPage();
        const sidePanel = new SidePanel(this.dataMapperWebView);
        await sidePanel.init();

        await sidePanel.addConnector(connectionName, operationName, props);
    }

    public async selectConnectorFromConnectorTab(connectorName: string, operationName: string, index: number = 0) {
        await this.clickPlusButtonByIndex(index);
        await this.goToConnectorsPage();
        const sidePanel = new SidePanel(this.dataMapperWebView);
        await sidePanel.init();

        return await sidePanel.selectConnectorOperationFromConnectorTab(connectorName, operationName);
    }

    public async getConnector(connectorName: string, operationName: string, index: number = 0) {
        const connectorNode = (await this.getDiagramContainer()).locator(`[data-testid^="connectorNode-${connectorName}.${operationName}"]`).nth(index).locator('div').first();
        await connectorNode.waitFor();
        await connectorNode.hover();
        return new Mediator(this.dataMapperWebView, connectorNode);
    }

    public async closeSidePanel() {
        const sidePanel = new SidePanel(this.dataMapperWebView);
        await sidePanel.init();
        await sidePanel.close();
    }

    private async clickPlusButtonByPosition(line: number, column: number) {
        const link = (await this.getDiagramContainer()).locator(`g[data-linkid=${line},${column}]`);
        await link.waitFor();
        await link.hover();
        await link.getByTestId("add-mediator-button").click();
    }

    private async clickPlusButtonByIndex(index: number) {
        const plusBtns = (await this.getDiagramContainer()).getByTestId("add-mediator-button");
        if (await plusBtns.count() > 1) {
            await plusBtns.nth(index).hover();
            await plusBtns.nth(index).click();
        } else {
            await plusBtns.hover();
            await plusBtns.click();
        }
    }

    private async getDiagramContainer() {
        const continaer = this.dataMapperWebView.getByTestId("diagram-container");
        await continaer.waitFor();
        return continaer;
    }
}


class Mediator {

    constructor(private container: Frame, private mediatorNode: Locator) {
    }

    public async edit(props: FormFillProps) {
        await this.mediatorNode.click();
        const form = new SidePanel(this.container);
        await form.init();
        await form.updateMediator(props);
    }

    public async open(text: string) {
        const link = this.mediatorNode.locator(`div:text("${text}")`);
        await link.waitFor();
        await link.click();
    }

    public async getDescription() {
        const description = this.mediatorNode.getByTestId("mediator-description");
        await description.waitFor();
        return await description.textContent();
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
