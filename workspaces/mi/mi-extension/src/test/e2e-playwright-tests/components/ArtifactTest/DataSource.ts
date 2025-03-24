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

export class DataSource {
    private webView!: Frame;

    constructor(private _page: Page) {
    }

    public async init() {
        await this._page.waitForTimeout(1000);
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
        const btn = await createIntegrationSection.waitForSelector(`div:text("Data Source") >> ../../../..`);
        await btn.click();
    }

    public async add() {
        const dsWebView = await switchToIFrame('Data Source Creation Form', this._page);
        if (!dsWebView) {
            throw new Error("Failed to switch to Data Source Creation Form iframe");
        }
        const dsFrame = dsWebView.locator('div#root');
        await dsFrame.getByRole('textbox', { name: 'Datasource Name*' }).fill('testDataSource');
        await dsFrame.locator('#dbEngine div').nth(1).click();
        await dsFrame.getByRole('textbox', { name: 'Description' }).fill('Test Ds');
        await dsFrame.getByRole('textbox', { name: 'Database Name*' }).fill('TestDB');
        await dsFrame.getByRole('textbox', { name: 'Username*' }).fill('wso2');
        await dsFrame.getByRole('textbox', { name: 'Password' }).click();
        await dsFrame.getByRole('textbox', { name: 'Password' }).fill('wso2');
        await dsFrame.getByRole('button', { name: 'Next' }).click();
        await dsFrame.getByLabel('Continue without any database').click();
        await dsFrame.getByRole('button', { name: 'Create' }).click();
    }

    public async edit() {
        await this._page.locator('.monaco-tl-twistie').click();
        await this._page.getByRole('treeitem', { name: 'Other Artifacts' }).locator('a').click();
        await this._page.locator('a').filter({ hasText: 'Data Sources' }).click();
        await this._page.getByRole('treeitem', { name: 'testDataSource' }).locator('a').click();

        const webView = await switchToIFrame('Data Source Creation Form', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Data Source Creation Form iframe");
        }
        const frame = webView.locator('div#root');
        await frame.getByRole('textbox', { name: 'Datasource Name*' }).fill('newTestDataSource');
        await frame.locator('#dbEngine div').nth(2).click();
        await frame.getByRole('textbox', { name: 'Description' }).fill('New Test Ds');
        await frame.getByRole('textbox', { name: 'Database Name*' }).fill('NewTestDB');
        await frame.getByRole('textbox', { name: 'Username*' }).fill('newwso2');
        await frame.getByRole('textbox', { name: 'Password' }).fill('newwso2');
        await frame.getByRole('button', { name: 'Next' }).click();
        await frame.getByLabel('Continue without any database').click();
        await frame.getByRole('button', { name: 'Update' }).click();
    }
}
