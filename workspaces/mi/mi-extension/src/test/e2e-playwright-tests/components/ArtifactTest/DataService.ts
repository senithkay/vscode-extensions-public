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

export class DataService {

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
        await addArtifactPage.add('Data Service');
    }

    public async add() {
        const dsWebView = await switchToIFrame('Data Service Form', this._page);
        if (!dsWebView) {
            throw new Error("Failed to switch to Data Service Form iframe");
        }
        const dsFrame = dsWebView.locator('div#root');
        await dsFrame.getByRole('textbox', { name: 'Data Service Name*' }).fill('testDataService');
        await dsFrame.getByRole('textbox', { name: 'Description' }).fill('Test Ds');
        await dsFrame.getByText('Add Datasource').click();
        await dsFrame.getByRole('textbox', { name: 'Datasource Identifier*' }).fill('dataID');
        await dsFrame.locator('#dataSourceType div').first().click();
        await dsFrame.getByLabel('RDBMS').click();
        await dsFrame.getByRole('textbox', { name: 'Database Name*' }).fill('testDb');
        await dsFrame.getByRole('textbox', { name: 'Username*' }).fill('wso2');
        await dsFrame.getByRole('textbox', { name: 'Password' }).fill('wso2');
        await dsFrame.getByRole('button', { name: 'Next' }).click();
        await dsFrame.getByLabel('Continue without any database').click();
        await dsFrame.getByRole('button', { name: 'Create' }).click();
        await dsFrame.getByRole('button', { name: 'Create' }).click();
    }

    public async edit() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Data Services', 'testDataService'], true);

        const webView = await switchToIFrame('Data Service Designer', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Data Service Designer iframe");
        }
        const frame = webView.locator('div#root');
        await frame.getByTestId('edit-button').getByLabel('Icon Button').click();

        const dssWebView = await switchToIFrame('Data Service Form', this._page);
        if (!dssWebView) {
            throw new Error("Failed to switch to Data Service Form iframe");
        }
        await dssWebView.getByRole('textbox', { name: 'Data Service Name*' }).fill('newTestDataService');
        await dssWebView.getByRole('textbox', { name: 'Description' }).fill('New Test Ds');
        await frame.getByRole('button', { name: 'Save Changes' }).click();
    }
}
