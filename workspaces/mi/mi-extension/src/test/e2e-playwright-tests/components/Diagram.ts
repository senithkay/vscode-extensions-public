/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Frame, Locator, Page } from "@playwright/test";
import { switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";
import { Form, FormFillProps } from "./Form";

export class Diagram {
    private diagramWebView!: Frame;

    constructor(private _page: Page, private type: 'Resource' | 'Sequence') {
    }

    public async init() {
        const webview = await switchToIFrame(`${this.type} View`, this._page)
        if (!webview) {
            throw new Error("Failed to switch to Diagram View iframe");
        }
        this.diagramWebView = webview;
    }

    public async getMediator(mediatorName: string, index: number = 0) {
        const mediatorNode = (await this.getDiagramContainer()).locator(`[data-testid^="mediatorNode-${mediatorName}-"]`).nth(index).locator('div').first();
        await mediatorNode.waitFor();
        await mediatorNode.hover();
        return new Mediator(this.diagramWebView, mediatorNode);
    }

    public async addMediator(mediatorName: string, index: number = 0) {
        await this.clickPlusButtonByIndex(index);

        const sidePanel = new SidePanel(this.diagramWebView);
        await sidePanel.init();
        await sidePanel.search(mediatorName);
        await sidePanel.addMediator(mediatorName);
    }

    public async goToExternalsPage() {
        const sidePanel = new SidePanel(this.diagramWebView);
        await sidePanel.init();
        sidePanel.goToExternalsPage();
    }

    public async addNewConnection(index: number = 0) {
        await this.clickPlusButtonByIndex(index);

        const sidePanel = new SidePanel(this.diagramWebView);
        await sidePanel.init();
        sidePanel.goToExternalsPage();
        sidePanel.addNewConnection();
    }

    public async verifyConnection(name: string, type: string) {
        const sidePanel = new SidePanel(this.diagramWebView);
        await sidePanel.init();
        sidePanel.goToExternalsPage();
        return sidePanel.verifyConnection(name, type);
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
        const continaer = this.diagramWebView.getByTestId("diagram-container");
        await continaer.waitFor();
        return continaer;
    }
}


class Mediator {

    constructor(private container: Frame, private mediatotNode: Locator) {
    }

    public async edit(props: FormFillProps) {
        await this.mediatotNode.click();
        const form = new SidePanel(this.container);
        await form.init();
        await form.updateMediator(props);
    }

    public async getDescription() {
        const description = this.mediatotNode.getByTestId("mediator-description");
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

    public async addMediator(mediatorName: string) {
        const mediator = this.sidePanel.locator(`#card-select-${mediatorName}`);
        await mediator.waitFor();
        await mediator.click();

        const drawer = this.sidePanel.locator("#drawer1");
        await drawer.waitFor();
        const formDiv = drawer.locator("div").first();
        await formDiv.waitFor();

        const form = new Form(undefined, undefined, formDiv);
        await form.submit("Submit");
    }

    public async updateMediator(props: FormFillProps) {
        const form = new Form(undefined, undefined, this.sidePanel);
        await form.fill(props);
        await form.submit("Submit");
    }

    public async goToExternalsPage() {
        const externalPageBtn = this.sidePanel.locator(`vscode-button:text("Externals") >> ..`);
        await externalPageBtn.waitFor();
        await externalPageBtn.click();
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
}
