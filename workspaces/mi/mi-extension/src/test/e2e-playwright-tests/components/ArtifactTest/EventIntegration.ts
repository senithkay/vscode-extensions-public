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

export class EventIntegration {
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
        const btn = await createIntegrationSection.waitForSelector(`div:text("Event Integration") >> ../../../..`);
        await btn.click();
    }

    public async add() {
        const epWebView = await switchToIFrame('Event Integration Form', this._page);
        if (!epWebView) {
            throw new Error("Failed to switch to Event Integration Form iframe");
        }
        const epFrame = epWebView.locator('div#root');
        // Wait untill a component with testId 'add-button' is visible
        await epWebView.waitForSelector('[data-testid="HTTPS"]', { state: 'visible' });
        await epFrame.getByText('HTTPS').click();
        const httpEPWebview = await switchToIFrame('Event Integration Form', this._page);
        if (!httpEPWebview) {
            throw new Error("Failed to switch to Http Endpoint Form iframe");
        }
        const httpEPFrame = httpEPWebview.locator('div#root');
        this._page.pause();
    }

    public async edit() {
        
    }
}
