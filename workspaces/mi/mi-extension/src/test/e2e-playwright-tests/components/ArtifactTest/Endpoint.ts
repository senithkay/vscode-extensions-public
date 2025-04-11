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
import { AddArtifact } from "../AddArtifact";
import { Overview } from "../Overview";

export class Endpoint {

    constructor(private _page: Page) {
    }

    public async init() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");

        const overviewPage = new Overview(this._page);
        await overviewPage.init();
        await overviewPage.goToAddArtifact();

        const addArtifactPage = new AddArtifact(this._page);
        await addArtifactPage.init();
        await addArtifactPage.add('Endpoint');
    }

    public async addHttpEndpoint(name: string) {
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
        await httpEPFrame.getByRole('textbox', { name: 'Endpoint Name*' }).fill(name);
        await httpEPFrame.getByRole('textbox', { name: 'URI Template*' }).click();
        await httpEPFrame.getByRole('textbox', { name: 'URI Template*' }).fill('https://fake-json-api.mock.beeceptor.com/users');
        await httpEPFrame.locator('svg').click();
        await httpEPFrame.getByLabel('POST').click();
        await httpEPFrame.getByTestId('create-button').click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }

    public async editHttpEndpoint(prevName: string, newName: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Endpoints', prevName], true);

        const httpEPWebview = await switchToIFrame('Http Endpoint Form', this._page);
        if (!httpEPWebview) {
            throw new Error("Failed to switch to Http Endpoint Form iframe");
        }
        const httpEPFrame = httpEPWebview.locator('div#root');
        await httpEPFrame.getByRole('textbox', { name: 'Endpoint Name*' }).click();
        await httpEPFrame.getByRole('textbox', { name: 'Endpoint Name*' }).fill(newName);
        await httpEPFrame.getByRole('textbox', { name: 'URI Template*' }).click();
        await httpEPFrame.getByRole('textbox', { name: 'URI Template*' }).fill('https://fake-json-api.mock.beeceptor.com');
        await httpEPFrame.locator('svg').click();
        await httpEPFrame.getByLabel('PUT').click();
        await httpEPFrame.getByTestId('create-button').click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }

    public async addLoadBalanceEndpoint(name: string) {
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
        await lbEPFrame.getByRole('textbox', { name: 'Name*' }).fill(name);
        await lbEPFrame.locator('#algorithm svg').click();
        await lbEPFrame.getByLabel('Weighted RRLC Algorithm').click();
        await lbEPFrame.getByRole('button', { name: 'Create' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }

    public async editLoadBalanceEndpoint(prevName: string, newName: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Endpoints', prevName], true);
        // await this._page.locator('#list_id_4_4').getByLabel('Endpoints').locator('div').filter({ hasText: 'Endpoints' }).click();
        // await this._page.getByRole('treeitem', { name: 'loadBalanceEP' }).locator('a').click();
        const lbEPWebview = await switchToIFrame('Load Balance Endpoint Form', this._page);
        if (!lbEPWebview) {
            throw new Error("Failed to switch to load balance Endpoint Form iframe");
        }
        const lbEPFrame = lbEPWebview.locator('div#root');
        await lbEPFrame.getByRole('textbox', { name: 'Name*' }).click();
        await lbEPFrame.getByRole('textbox', { name: 'Name*' }).fill(newName);
        await lbEPFrame.locator('#algorithm svg').click();
        await lbEPFrame.getByLabel('Weighted Round Robin').click();
        await lbEPFrame.getByRole('button', { name: 'Save Changes' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }
}
