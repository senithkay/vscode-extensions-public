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
import { AddArtifact } from "../AddArtifact";
import { ProjectExplorer } from "../ProjectExplorer";

export class Automation {
    private webView!: Frame;

    constructor(private _page: Page) {
    }

    public async init() {
        const overviewPage = new AddArtifact(this._page);
        await overviewPage.init();
        await overviewPage.add('Automation');
        const webView = await switchToIFrame('Task Form', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Task Form iframe");
        }
        this.webView = webView;
    }

    public async add(name: string) {
        const frame = this.webView.locator('div#root');
        await frame.getByRole('textbox', { name: 'Task Name*' }).click();
        await frame.getByRole('textbox', { name: 'Task Name*' }).fill(name);
        await frame.locator('#triggerInterval div').nth(2).click();
        await frame.getByRole('textbox', { name: 'Interval (in seconds)*' }).fill('10');
        await frame.getByTestId('create-task-button').click();
    }

    public async edit(name: string) {
        const webView = await switchToIFrame('Task View', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Task View iframe");
        }
        const frame = webView.locator('div#root');
        await frame.getByTestId('edit-button').click();
        await frame.getByRole('textbox', { name: 'Task Name*' }).click();
        await frame.getByRole('textbox', { name: 'Task Name*' }).fill(name);
        await frame.getByLabel('Cron').click();
        await frame.getByRole('textbox', { name: 'Cron*' }).click();
        await frame.getByRole('textbox', { name: 'Cron*' }).fill('* * * * * ? *');
        await frame.getByTestId('create-task-button').click();
    }

    public async createExternalTrigger(name: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        console.log("Navigated to project overview");
        await projectExplorer.findItem(['Project testProject', 'Automations'], true);
        await this._page.getByLabel('Add Scheduled Task').click();
        const webView = await switchToIFrame('Task Form', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Task Form iframe");
        }
        const frame = webView.locator('div#root');
        await frame.getByLabel('External Trigger').click();
        await frame.getByRole('textbox', { name: 'Name*' }).fill(name);
        await frame.getByRole('heading', { name: 'Advanced Configuration' }).click();
        await frame.locator('[id="headlessui-combobox-input-\\:r0\\:"]').click();
        await frame.getByText('SEQUENCE TestTask1Sequence').click();
        await frame.getByLabel('Enable tracing').click();
        await frame.getByLabel('Enable statistics').click();
        await frame.getByRole('button', { name: 'Create' }).click();
    }

    public async openDiagramView(name: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Automations', name], true);
        const webView = await switchToIFrame('Task View', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Task View iframe");
        }
        await webView.getByText('Start').click();
    }
}
