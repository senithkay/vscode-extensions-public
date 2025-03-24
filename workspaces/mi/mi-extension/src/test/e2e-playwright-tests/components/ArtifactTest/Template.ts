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

export class Template {
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
        const btn = await createIntegrationSection.waitForSelector(`div:text("Template") >> ../../../..`);
        await btn.click();
    }

    public async addTemplate() {
        const templEpWebView = await switchToIFrame('Template Form', this._page);
        if (!templEpWebView) {
            throw new Error("Failed to switch to Template Form iframe");
        }
        const templEPFrame = templEpWebView.locator('div#root');
        await templEPFrame.getByText('Address Endpoint Template').click();
        const mspWebview = await switchToIFrame('Template Form', this._page);
        if (!mspWebview) {
            throw new Error("Failed to switch to Template Form iframe");
        }
        const tmplAddEPFrame = mspWebview.locator('div#root');
        await tmplAddEPFrame.getByRole('textbox', { name: 'Template Name*' }).click();
        await tmplAddEPFrame.getByRole('textbox', { name: 'Template Name*' }).fill('tempEP');
        await tmplAddEPFrame.getByRole('textbox', { name: 'Endpoint Name*' }).click();
        await tmplAddEPFrame.getByRole('textbox', { name: 'Endpoint Name*' }).fill('templateEp');
        await tmplAddEPFrame.getByRole('textbox', { name: 'URI*' }).click();
        await tmplAddEPFrame.getByRole('textbox', { name: 'URI*' }).fill('http://localhost:8290/endpoint');
        await tmplAddEPFrame.locator('#format div').nth(1).click();
        await tmplAddEPFrame.getByLabel('REST').click();
        await tmplAddEPFrame.locator('#traceEnabled').getByLabel('Enable').click();
        await tmplAddEPFrame.locator('#statisticsEnabled').getByLabel('Enable').click();
        await tmplAddEPFrame.getByRole('button', { name: 'Create' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }

    public async editTemplate() {
        await this._page.locator('.monaco-tl-twistie').click();
        await this._page.getByRole('treeitem', { name: 'Other Artifacts' }).locator('a').click();
        await this._page.locator('a').filter({ hasText: 'Templates' }).click();
        await this._page.getByRole('treeitem', { name: 'tempEP' }).locator('a').click();

        const tmplAddWebview = await switchToIFrame('Address Endpoint Form', this._page);
        if (!tmplAddWebview) {
            throw new Error("Failed to switch to Address Endpoint Form iframe");
        }
        const tmplAddEPFrame = tmplAddWebview.locator('div#root');

        await tmplAddEPFrame.getByRole('textbox', { name: 'Template Name*' }).click();
        await tmplAddEPFrame.getByRole('textbox', { name: 'Template Name*' }).fill('newTempEP');
        await tmplAddEPFrame.getByRole('textbox', { name: 'Endpoint Name*' }).click();
        await tmplAddEPFrame.getByRole('textbox', { name: 'Endpoint Name*' }).fill('newTemplateEp');
        await tmplAddEPFrame.getByRole('textbox', { name: 'URI*' }).click();
        await tmplAddEPFrame.getByRole('textbox', { name: 'URI*' }).fill('http://localhost:8290/endpoints');
        await tmplAddEPFrame.locator('#format div').nth(1).click();
        await tmplAddEPFrame.getByLabel('SOAP 1.2').click();
        await tmplAddEPFrame.locator('#traceEnabled').getByLabel('Disable').click();
        await tmplAddEPFrame.locator('#statisticsEnabled').getByLabel('Disable').click();
        await tmplAddEPFrame.getByRole('button', { name: 'Save Changes' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }
}
