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
import path from "path";
import os from "os";
import { copyFile } from "../../Utils";
export class LocalEntry {

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
        await addArtifactPage.add('Local Entry');
    }

    public async addInlineTextLocalEntry(name: string) {
        const leWebView = await switchToIFrame('Local Entry Form', this._page);
        if (!leWebView) {
            throw new Error("Failed to switch to Local Entry Form iframe");
        }
        const leFrame = leWebView.locator('div#root');
        await leFrame.getByText('In-Line Text Entry').click();
        const mspWebview = await switchToIFrame('Local Entry Form', this._page);
        if (!mspWebview) {
            throw new Error("Failed to switch to Local Entry Form iframe");
        }
        const ileFrame = mspWebview.locator('div#root');
        await ileFrame.getByRole('textbox', { name: 'Local Entry Name*' }).click();
        await ileFrame.getByRole('textbox', { name: 'Local Entry Name*' }).fill(name);
        await ileFrame.getByRole('textbox', { name: 'In-Line Text Value*' }).click();
        await ileFrame.getByRole('textbox', { name: 'In-Line Text Value*' }).fill('text');
        await ileFrame.getByRole('button', { name: 'Create' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }

    public async editInlineTextLocalEntry(prevName: string, newName: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Local Entries', prevName], true);

        const leWebview = await switchToIFrame('Local Entry Form', this._page);
        if (!leWebview) {
            throw new Error("Failed to switch to Local Entry Form iframe");
        }
        const leFrame = leWebview.locator('div#root');
        await leFrame.getByRole('textbox', { name: 'Local Entry Name*' }).click();
        await leFrame.getByRole('textbox', { name: 'Local Entry Name*' }).fill(newName);
        await leFrame.getByRole('textbox', { name: 'In-Line Text Value*' }).click();
        await leFrame.getByRole('textbox', { name: 'In-Line Text Value*' }).fill('newText');
        await leFrame.getByRole('button', { name: 'Update' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }

    public async addXmlLocalEntry(name: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        console.log("Navigated to project overview");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Local Entries'], true);
        await this._page.getByLabel('Add Local Entry').click();

        const leWebview = await switchToIFrame('Local Entry Form', this._page);
        if (!leWebview) {
            throw new Error("Failed to switch to Local Entry Form iframe");
        }
        const leFrame = leWebview.locator('div#root');
        await leFrame.getByText('In-Line XML Entry').click();

        await leFrame.getByRole('textbox', { name: 'Local Entry Name*' }).fill(name);
        await leFrame.getByRole('textbox').first().fill('<endpoint name="Tests" xmlns="http://ws.apache.org/ns/synapse"/>');
        await leFrame.getByRole('button', { name: 'Create' }).click();
    }

    public async editXmlLocalEntry(prevName: string, newName: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Local Entries', prevName], true);

        const leWebview = await switchToIFrame('Local Entry Form', this._page);
        if (!leWebview) {
            throw new Error("Failed to switch to Local Entry Form iframe");
        }
        const leFrame = leWebview.locator('div#root');
        await leFrame.getByRole('textbox', { name: 'Local Entry Name*' }).click();
        await leFrame.getByRole('textbox', { name: 'Local Entry Name*' }).fill(newName);
        await leFrame.getByRole('button', { name: 'Update' }).click();
    }

    public async addSourceUrlLocalEntry(name: string) {
        const xmlFile = path.join(__dirname, 'data', 'test.xml');
        const homeDir = os.homedir();
        const desination = path.join(homeDir, 'test.xml');
        console.log("Copying WSDL file to ", desination, " from ", xmlFile);
        await copyFile(xmlFile, desination);
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        console.log("Navigated to project overview");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Local Entries'], true);
        await this._page.getByLabel('Add Local Entry').click();

        const leWebview = await switchToIFrame('Local Entry Form', this._page);
        if (!leWebview) {
            throw new Error("Failed to switch to Local Entry Form iframe");
        }
        const leFrame = leWebview.locator('div#root');
        await leFrame.getByText('Source URL Entry').click();

        await leFrame.getByRole('textbox', { name: 'Local Entry Name*' }).fill(name);
        await leFrame.getByRole('textbox', { name: 'Source URL*' }).fill(desination);
        await leFrame.getByRole('button', { name: 'Create' }).click();
        console.log("Clicked on create");
    }

    public async editSourceUrlLocalEntry(prevName: string, newName: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Local Entries', prevName], true);

        const leWebview = await switchToIFrame('Local Entry Form', this._page);
        if (!leWebview) {
            throw new Error("Failed to switch to Local Entry Form iframe");
        }
        const leFrame = leWebview.locator('div#root');
        await leFrame.getByRole('textbox', { name: 'Local Entry Name*' }).click();
        await leFrame.getByRole('textbox', { name: 'Local Entry Name*' }).fill(newName);
        await leFrame.getByRole('button', { name: 'Update' }).click();
    }
}
