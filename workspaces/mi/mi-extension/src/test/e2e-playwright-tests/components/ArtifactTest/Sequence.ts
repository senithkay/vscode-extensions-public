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

export class Sequence {
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
        const btn = await createIntegrationSection.waitForSelector(`div:text("Sequence") >> ../../../..`);
        await btn.click();
    }

    public async add() {
        const seqWebView = await switchToIFrame('Sequence Form', this._page);
        if (!seqWebView) {
            throw new Error("Failed to switch to Sequence Form iframe");
        }
        const seqFrame = seqWebView.locator('div#root');
        await seqFrame.getByRole('textbox', { name: 'Name*' }).fill('seqEP');
        await seqFrame.getByTestId('create-button').click();
        await this._page.waitForTimeout(2000); // Wait for the sequence to be created
    }

    public async edit() {
        await this._page.locator('a').filter({ hasText: 'Sequences' }).click();
        await this._page.locator('a').filter({ hasText: 'seqEP' }).click();
        const webView = await switchToIFrame('Sequence View', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Sequence View iframe");
        }
        const frame = webView.locator('div#root');
        await frame.getByTestId('edit-button').click();
        await frame.getByRole('textbox', { name: 'Name' }).click();
        await frame.getByRole('textbox', { name: 'Name' }).fill('newSeqEP');
        await frame.locator('[id="headlessui-combobox-input-\\:r0\\:"]').click();
        await frame.getByText('TestTaskSequence').click();
        await frame.getByTestId('update-button').click();
        await this._page.waitForSelector('[data-testid="update-button"]', { state: 'detached' });
        await this._page.waitForTimeout(2000); // Wait for the sequence to be updated
    }
}
