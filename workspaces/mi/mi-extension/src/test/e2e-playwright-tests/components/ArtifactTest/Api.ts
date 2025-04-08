/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */


import { Page } from "@playwright/test";
import { ProjectExplorer } from "../ProjectExplorer";
import { switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";
import { AddArtifact } from "../AddArtifact";
import { Overview } from "../Overview";
import { page } from "../../Utils";

export class Api {

    constructor(private _page: Page) {
    }

    public async init() {
        const addArtifactPage = new AddArtifact(this._page);
        await addArtifactPage.init();
        await addArtifactPage.add('API');
    }

    public async add(name: string) {
        const apiWebView = await switchToIFrame('API Form', this._page);
        if (!apiWebView) {
            throw new Error("Failed to switch to Sequence Form iframe");
        }
        await apiWebView.getByRole('textbox', { name: 'Name*' }).fill(name);
        try {
            await apiWebView.getByText('An artifact with same').click();
            console.log('Artifact:' + name + ' found, no action on Create button.');
            return;
        } catch (error) {
            const createButton = await apiWebView.getByRole('button', { name: 'Create' });
            await createButton.click();
        }
    }

    public async edit(name: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'APIs', name], true);
        await page.page.getByRole('treeitem', { name: /^\// }).locator('a').click();
        const webView = await switchToIFrame('Resource View', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Task View iframe");
        }
        await webView.getByTestId('edit-button').click();
        await webView.getByRole('textbox', { name: 'Resource Path' }).click();
        await webView.getByRole('textbox', { name: 'Resource Path' }).fill('/path');
        await webView.getByLabel('POST').click();
        await webView.getByLabel('GET').click();
        await webView.getByRole('button', { name: 'Update' }).click();
    }
}
