/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Frame, Page } from "@playwright/test";
import { switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";

export class MessageProcessor {
    private webView!: Frame;

    constructor(private _page: Page) {
    }

    public async init() {
        await this._page.locator('#list_id_4_0').getByLabel('Project testProject').locator('div').filter({ hasText: 'Project testProject' }).click();
        await this._page.getByLabel('Open Project Overview').click();
        const overviewWebView = await switchToIFrame("Project Overview", this._page);
        if (!overviewWebView) {
            throw new Error("Failed to switch to Add Artifact iframe");
        }
        await overviewWebView.getByRole('button', { name: ' Add Artifact' }).click();
        const createIntegrationSection = await overviewWebView.waitForSelector(`h3:text("Create an Integration") >> ..`);
        const viewMoreBtn = await createIntegrationSection.waitForSelector(`p:text("View More") >> ..`);
        await viewMoreBtn.click();
        const btn = await createIntegrationSection.waitForSelector(`div:text("Message Processor") >> ../../../..`);
        await btn.click();
    }

    public async addMessageSamplingProcessor() {
        const mpWebView = await switchToIFrame('Message Processor Form', this._page);
        if (!mpWebView) {
            throw new Error("Failed to switch to Message Processor Form iframe");
        }
        const mpFrame = mpWebView.locator('div#root');
        await mpFrame.getByText('Message Sampling Processor').click();
        const mspWebview = await switchToIFrame('Message Processor Form', this._page);
        if (!mspWebview) {
            throw new Error("Failed to switch to Message Processor Form iframe");
        }
        const mspFrame = mspWebview.locator('div#root');
        await mspFrame.getByRole('textbox', { name: 'Message Processor Name*' }).click();
        await mspFrame.getByRole('textbox', { name: 'Message Processor Name*' }).fill('msgProcessor');
        await mspFrame.locator('[id="headlessui-combobox-input-\\:r0\\:"]').click();
        await mspFrame.getByText('msgStore').click();
        await mspFrame.getByRole('textbox', { name: 'Quartz configuration file path' }).click();
        await mspFrame.getByRole('textbox', { name: 'Quartz configuration file path' }).fill('temp/test-file.txt');
        await mspFrame.getByRole('textbox', { name: 'Cron Expression' }).click();
        await mspFrame.getByRole('textbox', { name: 'Cron Expression' }).fill('0 0 * * FRI');
        await mspFrame.locator('[id="headlessui-combobox-input-\\:r2\\:"]').click();
        await mspFrame.getByRole('button', { name: 'Create' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }

    public async editMessageSamplingProcessor() {
        await this._page.locator('.monaco-tl-twistie').click();
        await this._page.getByRole('treeitem', { name: 'Other Artifacts' }).locator('a').click();
        await this._page.locator('a').filter({ hasText: 'Message Processors' }).click();
        await this._page.getByRole('treeitem', { name: 'msgProcessor' }).locator('a').click();

        const mspWebview = await switchToIFrame('Message Processor Form', this._page);
        if (!mspWebview) {
            throw new Error("Failed to switch to Message Processor Form iframe");
        }
        const mspFrame = mspWebview.locator('div#root');
        await mspFrame.getByRole('textbox', { name: 'Message Processor Name*' }).click();
        await mspFrame.getByRole('textbox', { name: 'Message Processor Name*' }).fill('newMsgProcessor');
        await mspFrame.getByRole('textbox', { name: 'Quartz configuration file path' }).click();
        await mspFrame.getByRole('textbox', { name: 'Quartz configuration file path' }).fill('temp/new-test-file.txt');
        await mspFrame.getByRole('textbox', { name: 'Cron Expression' }).click();
        await mspFrame.getByRole('textbox', { name: 'Cron Expression' }).fill('0 0 * * MON');
        await mspFrame.getByRole('button', { name: 'Save Changes' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }
}
