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

export class EventIntegration {

    constructor(private _page: Page) {
    }

    public async init() {
        const addArtifactPage = new AddArtifact(this._page);
        await addArtifactPage.init();
        await addArtifactPage.add('Event Integration');
    }

    public async add(name: string) {
        const epWebView = await switchToIFrame('Event Integration Form', this._page);
        if (!epWebView) {
            throw new Error("Failed to switch to Event Integration Form iframe");
        }
        await epWebView.getByText('Inbuilt HTTP Event Listener').click();
        await epWebView.getByRole('textbox', { name: 'Event Integration Name*' }).fill(name);
        try {
            await epWebView.getByText('An artifact with same').click();
            console.log('Artifact:' + name + 'found, no action on Create button.');
            return;
        } catch (error) {
            await epWebView.getByRole('textbox', { name: 'Port*' }).fill('8093');
            await epWebView.getByRole('button', { name: 'Create' }).click();         
        }
    }

    public async edit(name: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Event Integrations', name], true);
        const webView = await switchToIFrame('Event Integration View', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Event Integration View iframe");
        }
        await webView.getByTestId('edit-button').click();
        await webView.getByRole('textbox', { name: 'Port*' }).fill('8098');
        await webView.getByText('Update').click();
    }

    public async openDiagramView(name: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Event Integrations', name], true);
        const webView = await switchToIFrame('Event Integration View', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Event Integration View iframe");
        }
        await webView.getByText('Start').click();
    }
}
