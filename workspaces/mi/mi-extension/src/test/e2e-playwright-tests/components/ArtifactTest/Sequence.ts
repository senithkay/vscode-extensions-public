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

export class Sequence {

    constructor(private _page: Page) {
    }

    public async init() {
        const addArtifactPage = new AddArtifact(this._page);
        await addArtifactPage.init();
        await addArtifactPage.add('Sequence');
    }

    public async add(name: string) {
        const seqWebView = await switchToIFrame('Sequence Form', this._page);
        if (!seqWebView) {
            throw new Error("Failed to switch to Sequence Form iframe");
        }
        const seqFrame = seqWebView.locator('div#root');
        await seqFrame.getByRole('textbox', { name: 'Name*' }).fill(name);
        await seqFrame.getByTestId('create-button').click();
    }

    public async edit(prevName: string, newName: string, taskName: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Sequences', prevName], true);
        const webView = await switchToIFrame('Sequence View', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Sequence View iframe");
        }
        const frame = webView.locator('div#root');
        await frame.getByTestId('edit-button').click();
        await frame.getByRole('textbox', { name: 'Name' }).click();
        await frame.getByRole('textbox', { name: 'Name' }).fill(newName);
        await frame.locator('[id="headlessui-combobox-input-\\:r0\\:"]').click();
        await frame.getByText(taskName).click();
        await frame.getByTestId('update-button').click();
        console.log("Waiting for update button to be detached");
        await this._page.waitForSelector('[data-testid="update-button"]', { state: 'detached' });
    }
}
