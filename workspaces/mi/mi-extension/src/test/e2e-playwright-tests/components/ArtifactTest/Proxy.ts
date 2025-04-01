/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Page } from "@playwright/test";
import { switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";
import { ProjectExplorer } from "../ProjectExplorer";

export class Proxy {

    constructor(private _page: Page) {
    }

    public async init() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        const overviewWebView = await switchToIFrame("Project Overview", this._page);
        if (!overviewWebView) {
            throw new Error("Failed to switch to Add Artifact iframe");
        }
        await overviewWebView.getByRole('button', { name: ' Add Artifact' }).click();
        const createIntegrationSection = await overviewWebView.waitForSelector(`h3:text("Create an Integration") >> ..`);
        const viewMoreBtn = await createIntegrationSection.waitForSelector(`p:text("View More") >> ..`);
        await viewMoreBtn.click();
        const btn = await createIntegrationSection.waitForSelector(`div:text("Proxy") >> ../../../..`);
        await btn.click();
    }

    public async add() {
        const proxyWebView = await switchToIFrame('Proxy Service Form', this._page);
        if (!proxyWebView) {
            throw new Error("Failed to switch to Proxy Service Form iframe");
        }
        const proxyFrame = proxyWebView.locator('div#root');
        await proxyFrame.getByRole('textbox', { name: 'Proxy Service Name*' }).fill('testProxy');
        await proxyFrame.getByLabel('vfs').click();
        await proxyFrame.getByLabel('udp').click();
        await proxyFrame.getByRole('button', { name: 'Create' }).click();
    }

    public async edit() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Proxy Services', 'testProxy']);

        const webView = await switchToIFrame('Proxy View', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Proxy View iframe");
        }
        const frame = webView.locator('div#root');
        await frame.getByTestId('edit-button').click();
        await frame.getByRole('textbox', { name: 'Name' }).click();
        await frame.getByRole('textbox', { name: 'Name' }).fill('newTestProxy');
        await frame.getByRole('textbox', { name: 'Pinned Servers' }).fill('newPinnedServers');
        await frame.getByRole('textbox', { name: 'Service Group' }).fill('newServiceGroup');
        await frame.getByLabel('vfs').click();
        await frame.getByLabel('udp').click();
        await frame.getByRole('button', { name: 'Update' }).click();
    }
}
