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

export class MessageStore {

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
        await addArtifactPage.add('Message Store');
    }

    public async addInMemmoryMS() {
        const msWebView = await switchToIFrame('Message Store Form', this._page);
        if (!msWebView) {
            throw new Error("Failed to switch to Message Store Form iframe");
        }
        const msFrame = msWebView.locator('div#root');
        await msFrame.getByText('In Memory Message Store').click();
        const mspWebview = await switchToIFrame('Message Store Form', this._page);
        if (!mspWebview) {
            throw new Error("Failed to switch to Message Store Form iframe");
        }
        const msInFrame = mspWebview.locator('div#root');
        await msInFrame.getByRole('textbox', { name: 'Message Store Name*' }).click();
        await msInFrame.getByRole('textbox', { name: 'Message Store Name*' }).fill('msgStore');
        await msInFrame.getByRole('button', { name: 'Create' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to overview iframe");
        }
    }

    public async editInMemoryMS() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Message Stores', 'msgStore'], true);
        const msWebview = await switchToIFrame('Message Store Form', this._page);
        if (!msWebview) {
            throw new Error("Failed to switch to Message Store Form iframe");
        }
        const msInFrame = msWebview.locator('div#root');
        await msInFrame.getByRole('textbox', { name: 'Message Store Name*' }).click();
        await msInFrame.getByRole('textbox', { name: 'Message Store Name*' }).fill('newMsgStore');
        await msInFrame.getByRole('button', { name: 'Update' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }
}
