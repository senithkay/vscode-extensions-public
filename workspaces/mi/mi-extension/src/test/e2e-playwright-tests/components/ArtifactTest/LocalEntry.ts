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

export class LocalEntry {

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
        const btn = await createIntegrationSection.waitForSelector(`div:text("Local Entry") >> ../../../..`);
        await btn.click();
    }

    public async addLocalEntry() {
        const mpWebView = await switchToIFrame('Local Entry Form', this._page);
        if (!mpWebView) {
            throw new Error("Failed to switch to Local Entry Form iframe");
        }
        const mpFrame = mpWebView.locator('div#root');
        await mpFrame.getByText('In-Line Text Entry').click();
        const mspWebview = await switchToIFrame('Local Entry Form', this._page);
        if (!mspWebview) {
            throw new Error("Failed to switch to Local Entry Form iframe");
        }
        const mspFrame = mspWebview.locator('div#root');
        await mspFrame.getByRole('textbox', { name: 'Local Entry Name*' }).click();
        await mspFrame.getByRole('textbox', { name: 'Local Entry Name*' }).fill('localEntry');
        await mspFrame.getByRole('textbox', { name: 'In-Line Text Value*' }).click();
        await mspFrame.getByRole('textbox', { name: 'In-Line Text Value*' }).fill('text');
        await mspFrame.getByRole('button', { name: 'Create' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }

    public async editLocalEntry() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Local Entries', 'localEntry'], true);

        const mspWebview = await switchToIFrame('Local Entry Form', this._page);
        if (!mspWebview) {
            throw new Error("Failed to switch to Local Entry Form iframe");
        }
        const mspFrame = mspWebview.locator('div#root');
        await mspFrame.getByRole('textbox', { name: 'Local Entry Name*' }).click();
        await mspFrame.getByRole('textbox', { name: 'Local Entry Name*' }).fill('newLocalEntry');
        await mspFrame.getByRole('textbox', { name: 'In-Line Text Value*' }).click();
        await mspFrame.getByRole('textbox', { name: 'In-Line Text Value*' }).fill('newText');
        await mspFrame.getByRole('button', { name: 'Update' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }
}
