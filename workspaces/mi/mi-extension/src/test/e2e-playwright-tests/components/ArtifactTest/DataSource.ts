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

export class DataSource {

    constructor(private _page: Page) {
    }

    public async init() {
        const addArtifactPage = new AddArtifact(this._page);
        await addArtifactPage.init();
        await addArtifactPage.add('Data Source');
    }

    public async add(name: string) {
        const dsWebView = await switchToIFrame('Data Source Creation Form', this._page);
        if (!dsWebView) {
            throw new Error("Failed to switch to Data Source Creation Form iframe");
        }
        const dsFrame = dsWebView.locator('div#root');
        await dsFrame.getByRole('textbox', { name: 'Datasource Name*' }).fill(name);
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

    public async edit(prevName: string, newName: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Data Sources', prevName], true);

        const webView = await switchToIFrame('Data Source Creation Form', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Data Source Creation Form iframe");
        }
        const frame = webView.locator('div#root');
        await frame.getByRole('textbox', { name: 'Datasource Name*' }).fill(newName);
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
