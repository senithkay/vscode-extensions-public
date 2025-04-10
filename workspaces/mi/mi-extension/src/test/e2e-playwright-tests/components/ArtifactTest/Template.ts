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

export class Template {

    constructor(private _page: Page) {
    }

    public async init() {
        const addArtifactPage = new AddArtifact(this._page);
        await addArtifactPage.init();
        await addArtifactPage.add('Template');
    }

    public async addTemplate(name: string) {
        const templEpWebView = await switchToIFrame('Template Form', this._page);
        if (!templEpWebView) {
            throw new Error("Failed to switch to Template Form iframe");
        }
        const templEPFrame = templEpWebView.locator('div#root');
        await templEPFrame.getByText('Address Endpoint Template').click();
        const mspWebview = await switchToIFrame('Template Form', this._page);
        if (!mspWebview) {
            throw new Error("Failed to switch to Template Form iframe");
        }
        const tmplAddEPFrame = mspWebview.locator('div#root');
        await tmplAddEPFrame.getByRole('textbox', { name: 'Template Name*' }).click();
        await tmplAddEPFrame.getByRole('textbox', { name: 'Template Name*' }).fill(name);
        await tmplAddEPFrame.getByRole('textbox', { name: 'Endpoint Name*' }).click();
        await tmplAddEPFrame.getByRole('textbox', { name: 'Endpoint Name*' }).fill('templateEp');
        await tmplAddEPFrame.getByRole('textbox', { name: 'URI*' }).click();
        await tmplAddEPFrame.getByRole('textbox', { name: 'URI*' }).fill('http://localhost:8290/endpoint');
        await tmplAddEPFrame.locator('#format div').nth(1).click();
        await tmplAddEPFrame.getByLabel('REST').click();
        await tmplAddEPFrame.locator('#traceEnabled').getByLabel('Enable').click();
        await tmplAddEPFrame.locator('#statisticsEnabled').getByLabel('Enable').click();
        await tmplAddEPFrame.getByRole('button', { name: 'Create' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }

    public async editTemplate(prevName: string, newName: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Templates', prevName], true);

        const tmplAddWebview = await switchToIFrame('Address Endpoint Form', this._page);
        if (!tmplAddWebview) {
            throw new Error("Failed to switch to Address Endpoint Form iframe");
        }
        const tmplAddEPFrame = tmplAddWebview.locator('div#root');

        await tmplAddEPFrame.getByRole('textbox', { name: 'Template Name*' }).click();
        await tmplAddEPFrame.getByRole('textbox', { name: 'Template Name*' }).fill(newName);
        await tmplAddEPFrame.getByRole('textbox', { name: 'Endpoint Name*' }).click();
        await tmplAddEPFrame.getByRole('textbox', { name: 'Endpoint Name*' }).fill('newTemplateEp');
        await tmplAddEPFrame.getByRole('textbox', { name: 'URI*' }).click();
        await tmplAddEPFrame.getByRole('textbox', { name: 'URI*' }).fill('http://localhost:8290/endpoints');
        await tmplAddEPFrame.locator('#format div').nth(1).click();
        await tmplAddEPFrame.getByLabel('SOAP 1.2').click();
        await tmplAddEPFrame.locator('#traceEnabled').getByLabel('Disable').click();
        await tmplAddEPFrame.locator('#statisticsEnabled').getByLabel('Disable').click();
        await tmplAddEPFrame.getByRole('button', { name: 'Save Changes' }).click();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to Endpoint Form iframe");
        }
    }
}
