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
import { clearNotificationAlerts } from "../../Utils";

export class BallerinaModule {

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
        const btn = await createIntegrationSection.waitForSelector(`div:text("Ballerina Module") >> ../../../..`);
        await btn.click();
    }

    public async add() {
        const seqWebView = await switchToIFrame('Ballerina Module Creation Form', this._page);
        if (!seqWebView) {
            throw new Error("Failed to switch to Ballerina Module Form iframe");
        }
        const seqFrame = seqWebView.locator('div#root');
        await seqFrame.getByRole('textbox', { name: 'Module Name*' }).fill('testBal');
        await seqFrame.getByRole('textbox', { name: 'Version*' }).fill('1.0.0');
        await clearNotificationAlerts(this._page);
        await seqFrame.getByRole('button', { name: 'Create' }).click();
        const page = await this._page;
        await page.getByRole('tab', { name: 'testBal-module.bal' }).getByLabel('Close (⌘W)').click();
        await page.getByLabel('Open Project Overview').click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to the overview page");
        }
    }
}
