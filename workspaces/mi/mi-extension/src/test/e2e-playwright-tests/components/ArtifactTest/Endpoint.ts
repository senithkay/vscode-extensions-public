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

export class Endpoint {

    constructor(private _page: Page) {
    }

    public async init() {
        const projectExplorer = new ProjectExplorer(this._page);
        projectExplorer.goToOverview("testProject");
        const overviewWebView = await switchToIFrame("Project Overview", this._page);
        if (!overviewWebView) {
            throw new Error("Failed to switch to Add Artifact iframe");
        }
        await overviewWebView.getByRole('button', { name: ' Add Artifact' }).click();
        const createIntegrationSection = await overviewWebView.waitForSelector(`h3:text("Create an Integration") >> ..`);
        const viewMoreBtn = await createIntegrationSection.waitForSelector(`p:text("View More") >> ..`);
        await viewMoreBtn.click();
        await clearNotificationAlerts(this._page);
        const btn = await createIntegrationSection.waitForSelector(`div:text("Endpoint") >> ../../../..`);
        await btn.click();
    }

    public async addHttpEndpoint() {
        const epWebView = await switchToIFrame('Endpoint Form', this._page);
        if (!epWebView) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
        const epFrame = epWebView.locator('div#root');
        await epFrame.getByText('HTTP connection endpoint').click();
        const httpEPWebview = await switchToIFrame('Http Endpoint Form', this._page);
        if (!httpEPWebview) {
            throw new Error("Failed to switch to Http Endpoint Form iframe");
        }
        const httpEPFrame = httpEPWebview.locator('div#root');
        await httpEPFrame.getByRole('textbox', { name: 'Endpoint Name*' }).click();
        await httpEPFrame.getByRole('textbox', { name: 'Endpoint Name*' }).fill('httpEP');
        await httpEPFrame.getByRole('textbox', { name: 'URI Template*' }).click();
        await httpEPFrame.getByRole('textbox', { name: 'URI Template*' }).fill('https://fake-json-api.mock.beeceptor.com/users');
        await httpEPFrame.locator('svg').click();
        await httpEPFrame.getByLabel('POST').click();
        await clearNotificationAlerts(this._page);
        await httpEPFrame.getByTestId('create-button').click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }

    public async editHttpEndpoint() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Endpoints', 'httpEP'], true);

        const httpEPWebview = await switchToIFrame('Http Endpoint Form', this._page);
        if (!httpEPWebview) {
            throw new Error("Failed to switch to Http Endpoint Form iframe");
        }
        const httpEPFrame = httpEPWebview.locator('div#root');
        await httpEPFrame.getByRole('textbox', { name: 'Endpoint Name*' }).click();
        await httpEPFrame.getByRole('textbox', { name: 'Endpoint Name*' }).fill('httpEndpoint');
        await httpEPFrame.getByRole('textbox', { name: 'URI Template*' }).click();
        await httpEPFrame.getByRole('textbox', { name: 'URI Template*' }).fill('https://fake-json-api.mock.beeceptor.com');
        await httpEPFrame.locator('svg').click();
        await httpEPFrame.getByLabel('PUT').click();
        await clearNotificationAlerts(this._page);
        await httpEPFrame.getByTestId('create-button').click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }

    public async addLoadBalanceEndpoint() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Endpoints'], true);
        await this._page.getByLabel('Add Endpoint').click();
        const epWebview = await switchToIFrame('Endpoint Form', this._page);
        if (!epWebview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
        const epFrame = epWebview.locator('div#root');
        await epFrame.getByText('Load Balance Endpoint').click();
        const lbEPWebview = await switchToIFrame('Load Balance Endpoint Form', this._page);
        if (!lbEPWebview) {
            throw new Error("Failed to switch to load balance Endpoint Form iframe");
        }
        const lbEPFrame = lbEPWebview.locator('div#root');
        await lbEPFrame.getByRole('textbox', { name: 'Name*' }).click();
        await lbEPFrame.getByRole('textbox', { name: 'Name*' }).fill('loadBalanceEP');
        await lbEPFrame.locator('#algorithm svg').click();
        await lbEPFrame.getByLabel('Weighted RRLC Algorithm').click();
        await clearNotificationAlerts(this._page);
        await lbEPFrame.getByRole('button', { name: 'Create' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }

    public async editLoadBalanceEndpoint() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Endpoints', 'loadBalanceEP'], true);
        // await this._page.locator('#list_id_4_4').getByLabel('Endpoints').locator('div').filter({ hasText: 'Endpoints' }).click();
        // await this._page.getByRole('treeitem', { name: 'loadBalanceEP' }).locator('a').click();
        const lbEPWebview = await switchToIFrame('Load Balance Endpoint Form', this._page);
        if (!lbEPWebview) {
            throw new Error("Failed to switch to load balance Endpoint Form iframe");
        }
        const lbEPFrame = lbEPWebview.locator('div#root');
        await lbEPFrame.getByRole('textbox', { name: 'Name*' }).click();
        await lbEPFrame.getByRole('textbox', { name: 'Name*' }).fill('loadBalanceEndpoint');
        await lbEPFrame.locator('#algorithm svg').click();
        await lbEPFrame.getByLabel('Weighted Round Robin').click();
        await clearNotificationAlerts(this._page);
        await lbEPFrame.getByRole('button', { name: 'Save Changes' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }
}
