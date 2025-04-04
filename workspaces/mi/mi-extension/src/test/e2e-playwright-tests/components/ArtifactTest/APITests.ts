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
import { Overview } from "../Overview";
import { copyFile } from "../../Utils";
import path from "path";
import os from "os";

export class API {
    private webView!: Frame;

    constructor(private _page: Page) {
    }

    public async init() {
        console.log("API init");
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        console.log("Navigated to project overview");

        const overviewPage = new Overview(this._page);
        await overviewPage.init();
        console.log("Initialized overview page");
        await overviewPage.goToAddArtifact();
        console.log("Navigated to add artifact");

        const addArtifactPage = new AddArtifact(this._page);
        await addArtifactPage.init();
        console.log("Initialized add artifact page");
        await addArtifactPage.add('API');
        console.log("Clicked on API");
        const apiWebView = await switchToIFrame('API Form', this._page);
        if (!apiWebView) {
            throw new Error("Failed to switch to API Form iframe");
        }
        console.log("Switched to API Form iframe");
        this.webView = apiWebView;
    }

    public async addAPI() {
        const frame = this.webView.locator('div#root');
        await frame.waitFor();
        await frame.getByRole('textbox', { name: 'Name*' }).fill('TestAPI');
        await frame.getByRole('textbox', { name: 'Context*' }).fill('/test');
        await frame.locator('#version-type div').nth(1).click();
        await frame.getByLabel('Context', { exact: true }).click();
        const version = frame.getByRole('textbox', { name: 'Version' });
        await version.waitFor();
        await version.fill('1.0.1');
        await frame.getByRole('radio', { name: 'None' }).click();
        await frame.getByRole('button', { name: 'Create' }).click();
    }

    public async editAPI() {
        const webView = await switchToIFrame('Service Designer', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Service Designer iframe");
        }
        const frame = webView.locator('div#root');
        const editBtn = await frame.getByTestId('edit-button');
        await editBtn.waitFor();
        await editBtn.click();
        const apiFormWebView = await switchToIFrame('API Form', this._page);
        if (!apiFormWebView) {
            throw new Error("Failed to switch to API Form iframe");
        }
        const apiFormFrame = apiFormWebView.locator('div#root');
        await apiFormFrame.getByRole('textbox', { name: 'Name*' }).fill('NewTestAPI');
        await apiFormFrame.getByRole('textbox', { name: 'Context*' }).fill('/newtest');
        await apiFormFrame.getByRole('textbox', { name: 'Version' }).fill('1.0.2');
        await apiFormFrame.getByLabel('Trace Enabled').click();
        await apiFormFrame.getByLabel('Statistics Enabled').click();
        await apiFormFrame.getByRole('button', { name: 'Add Handler' }).click();
        await apiFormFrame.getByRole('textbox', { name: 'Text field' }).fill('testClass');
        await apiFormFrame.getByRole('button', { name: 'Add Property' }).click();
        await apiFormFrame.locator('#property-name').getByPlaceholder('Property name').click();
        await apiFormFrame.locator('#property-name').getByPlaceholder('Property name').fill('testProp');
        await apiFormFrame.locator('#property-value').getByPlaceholder('Property value').click();
        await apiFormFrame.locator('#property-value').getByPlaceholder('Property value').fill('testValue');
        await apiFormFrame.getByRole('button', { name: 'Save changes' }).click();
    }

    public async addResource() {
        const desWebView = await switchToIFrame('Service Designer', this._page);
        if (!desWebView) {
            throw new Error("Failed to switch to Service Designer iframe");
        }
        const frame = desWebView.locator('div#root');
        await frame.getByRole('button', { name: ' Resource' }).click();
        await frame.getByRole('textbox', { name: 'Resource Path' }).fill('/testResource');
        await frame.getByText('Add Path Param').click();
        await frame.getByRole('textbox', { name: 'Path Parameter*' }).fill('p1');
        await frame.getByRole('button', { name: 'Add' }).click();
        await frame.getByText('Add Query Param').click();
        await frame.getByRole('textbox', { name: 'Query Parameter*' }).fill('q1');
        await frame.getByRole('button', { name: 'Add' }).click();
        await frame.getByLabel('GET').click();
        await frame.getByLabel('DELETE').click();
        await frame.getByRole('button', { name: 'Create' }).click();
    }

    public async editResource() {
        const webView = await switchToIFrame('Service Designer', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Service Designer iframe");
        }
        const frame = webView.locator('div#root');
        await frame.getByTestId('service-design-view').locator('i').nth(1).click();
        // wait until go to source text appear
        await webView.getByRole('gridcell', { name: 'Edit' }).click();
        await frame.getByText('Add Query Param').click();
        await frame.getByRole('textbox', { name: 'Query Parameter*' }).fill('q2');
        await frame.getByRole('button', { name: 'Add' }).click();
        await frame.getByLabel('POST').click();
        await frame.getByRole('button', { name: 'Update' }).click();
    }

    public async deleteResource() {
        const desWebView = await switchToIFrame('Service Designer', this._page);
        if (!desWebView) {
            throw new Error("Failed to switch to Service Designer iframe");
        }
        const frame = desWebView.locator('div#root');
        await frame.getByTestId('service-design-view').locator('i').first().click();
        await desWebView.getByRole('gridcell', { name: 'Delete' }).click();
    }

    public async createOpenApiFromSidePanel() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        
        const overviewPage = new Overview(this._page);
        await overviewPage.init();
        await overviewPage.goToAddArtifact();

        const addArtifactPage = new AddArtifact(this._page);
        await addArtifactPage.init();
        await addArtifactPage.add('API');

        const openAPIFile = path.join(__dirname, 'data', 'openapi.yaml');
        // Get the users home directory
        const homeDir = os.homedir();
        const desination = path.join(homeDir, 'openapi.yaml');
        await copyFile(openAPIFile, desination);
        const apiFormWebView = await switchToIFrame('API Form', this._page);
        if (!apiFormWebView) {
            throw new Error("Failed to switch to API Form iframe");
        }
        const apiFormFrame = apiFormWebView.locator('div#root');
        await apiFormFrame.getByRole('textbox', { name: 'Name*' }).fill('NewOpenAPI');
        await apiFormFrame.getByRole('textbox', { name: 'Context*' }).fill('/openAPI');
        await apiFormFrame.locator('#version-type div').nth(1).click();
        await apiFormFrame.getByLabel('Context', { exact: true }).click();
        await apiFormFrame.getByRole('textbox', { name: 'Version' }).fill('1.0.0');
        await apiFormFrame.getByLabel('From OpenAPI definition').click();
        await apiFormFrame.getByRole('button', { name: 'Select Location' }).click();
        await this._page.getByLabel('input').fill(desination);
        await this._page.getByRole('button', { name: 'OK' }).click();
        await apiFormFrame.getByRole('button', { name: 'Create' }).click();
    }

    public async createWSDLFromSidePanel() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'APIs'], true);
        const addAPIButton = this._page.getByLabel('Add API');
        await addAPIButton.waitFor();
        await addAPIButton.click();
        const apiFormWebView = await switchToIFrame('API Form', this._page);
        if (!apiFormWebView) {
            throw new Error("Failed to switch to API Form iframe");
        }
        const apiFormFrame = apiFormWebView.locator('div#root');
        await apiFormFrame.getByRole('textbox', { name: 'Name*' }).fill('NewUrlWSDLAPI');
        await apiFormFrame.getByRole('textbox', { name: 'Context*' }).fill('/wsdlAPI');
        await apiFormFrame.getByLabel('From WSDL file').click();
        await apiFormFrame.getByRole('radio', { name: 'URL' }).click();
        await apiFormFrame.getByRole('textbox', { name: 'WSDL URL' }).fill('http://www.dneonline.com/calculator.asmx?wsdl');
        await apiFormFrame.getByRole('button', { name: 'Create' }).click();
    }

    public async createWSDLFromFile() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'APIs'], true);
        const addAPIButton = this._page.getByLabel('Add API');
        await addAPIButton.waitFor();
        await addAPIButton.click();
        const apiFormWebView = await switchToIFrame('API Form', this._page);
        if (!apiFormWebView) {
            throw new Error("Failed to switch to API Form iframe");
        }
        const apiFormFrame = apiFormWebView.locator('div#root');
        await apiFormFrame.getByRole('textbox', { name: 'Name*' }).fill('NewFileWSDLAPI');
        await apiFormFrame.getByRole('textbox', { name: 'Context*' }).fill('/wsdlAPI');
        await apiFormFrame.getByLabel('From WSDL file').click();
        const wsdlFile = path.join(__dirname, 'data', 'wsdl.xml');
        // Get the users home directory
        const homeDir = os.homedir();
        const desination = path.join(homeDir, 'wsdl.wsdl');
        await copyFile(wsdlFile, desination);
        await apiFormFrame.getByRole('button', { name: 'Select Location' }).click();
        await this._page.getByLabel('input').fill(desination);
        await this._page.getByRole('button', { name: 'OK' }).click();
        await apiFormFrame.getByRole('button', { name: 'Create' }).click();
        const webView = await switchToIFrame('Service Designer', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Service Designer iframe");
        }
    }

    public async deleteAPI() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.findItem(['Project testProject'], true);
        await this._page.getByLabel('Open Project Overview').click();
        const webview = await switchToIFrame("Project Overview", this._page);
        if (!webview) {
            throw new Error("Failed to switch to Overview iframe");
        }
        await this._page.getByLabel('Open Project Overview').click();
        await webview.locator('div:nth-child(7) > .css-ta44yg > .css-t6i1up > .css-ij0d9h > vscode-button > svg > path').click();
        await webview.getByText('Delete').click();
    }
}
