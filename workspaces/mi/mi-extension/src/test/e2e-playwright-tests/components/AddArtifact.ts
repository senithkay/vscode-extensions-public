/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Frame, Page } from "@playwright/test";
import { switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";

export class AddArtifact {
    private webView!: Frame;

    constructor(private _page: Page) {
    }

    public async init() {
        const webview = await switchToIFrame("Add Artifact", this._page)
        if (!webview) {
            throw new Error("Failed to switch to Add Artifact iframe");
        }
        this.webView = webview;
    }

    public async add(artifactType: string) {
        const createIntegrationSection = this.webView.locator('div#artifacts');
        await createIntegrationSection.waitFor({ state: 'visible' });
        
        const viewMoreBtn = createIntegrationSection.locator('p:text("View More")').locator('..');
        await viewMoreBtn.waitFor({ state: 'visible' });
        await viewMoreBtn.click();
        
        const btn = createIntegrationSection.locator(`div[id="${artifactType}"]`);
        await btn.waitFor({ state: 'visible' });
        await btn.click();
    }
}
