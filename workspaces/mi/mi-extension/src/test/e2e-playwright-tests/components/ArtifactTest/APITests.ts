/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { expect, Frame, Page } from "@playwright/test";
import { getVsCodeButton, switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";
import { AddArtifact } from "../AddArtifact";
import { ProjectExplorer } from "../ProjectExplorer";
import { Overview } from "../Overview";
import { closeEditorGroup, copyFile, page } from "../../Utils";
import { MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import path from "path";
import os from "os";

export class API {
    private webView!: Frame;

    constructor(private _page: Page) {
    }

    public async init(projectName: string = "testProject") {
        console.log("API init");
        let iframeTitle;

        try {
            const webview = await page.getCurrentWebview();
            iframeTitle = webview.title;
        } catch (error) {
            console.error("Error retrieving iframe title:", error);
            iframeTitle = null;
        }                         
        if (iframeTitle != MACHINE_VIEW.ADD_ARTIFACT) {
            const projectExplorer = new ProjectExplorer(this._page);
            await projectExplorer.goToOverview(projectName);
            console.log("Navigated to project overview");

            const overviewPage = new Overview(this._page);
            await overviewPage.init();
            console.log("Initialized overview page");
            await overviewPage.goToAddArtifact();
            console.log("Navigated to add artifact");
        }

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

    public async addAPI(name: string, context: string) {
        const frame = this.webView.locator('div#root');
        await frame.waitFor();
        await frame.getByRole('textbox', { name: 'Name*' }).fill(name);
        await frame.getByRole('textbox', { name: 'Context*' }).fill(context);
        await frame.locator('#version-type div').nth(1).click();
        await frame.getByLabel('Context', { exact: true }).click();
        const version = frame.getByRole('textbox', { name: 'Version' });
        await version.waitFor();
        await version.fill('1.0.1');
        await frame.getByRole('radio', { name: 'None' }).click();
        const submitBtn = await getVsCodeButton(frame, 'Create', 'primary');
        expect(await submitBtn.isEnabled()).toBeTruthy();
        await submitBtn.click();
    }

    public async editAPI(name: string, context: string) {
        const webView = await switchToIFrame('Service Designer', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Service Designer iframe");
        }
        const frame = webView.locator('div#root');
        await frame.waitFor();
        const editBtn = frame.getByTestId('edit-button').getByLabel('Icon Button');
        await editBtn.waitFor();
        await editBtn.click();
        const apiFormWebView = await switchToIFrame('API Form', this._page);
        if (!apiFormWebView) {
            throw new Error("Failed to switch to API Form iframe");
        }
        const apiFormFrame = apiFormWebView.locator('div#root');
        await apiFormFrame.getByRole('textbox', { name: 'Name*' }).fill(name);
        await apiFormFrame.getByRole('textbox', { name: 'Context*' }).fill(context);
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
        const submitBtn = await getVsCodeButton(frame, 'Save changes', 'primary');
        expect(await submitBtn.isEnabled()).toBeTruthy();
        await submitBtn.click();
        await submitBtn.waitFor({ state: 'detached' });
    }

    public async addResource(path: string) {
        const desWebView = await switchToIFrame('Service Designer', this._page);
        if (!desWebView) {
            throw new Error("Failed to switch to Service Designer iframe");
        }
        const frame = desWebView.locator('div#root');
        await frame.getByRole('button', { name: ' Resource' }).click();
        await frame.getByRole('textbox', { name: 'Resource Path' }).fill(path);
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

    public async goToSwaggerView() {
        const desWebView = await switchToIFrame('Service Designer', this._page);
        if (!desWebView) {
            throw new Error("Failed to switch to Service Designer iframe");
        }
        console.log("Switched to Service Designer iframe");
        const serviceDesignerFrame = desWebView.locator('div#root');
        await serviceDesignerFrame.getByRole('button', { name: ' OpenAPI Spec' }).click();
        console.log("Clicked on OpenAPI Spec");
        const webviewFrame = this._page.locator('iframe.webview.ready').nth(1);
        await webviewFrame.waitFor();
        console.log("Found webview frame");
        const frame = webviewFrame.contentFrame();
        if (!frame) {
            throw new Error(`IFrame of Swagger View not found`);
        }
        const targetFrame = frame.locator(`iframe[title="Swagger View"]`);
        console.log("Waiting for target frame");
        await targetFrame.waitFor();
        const swaggerView = targetFrame.contentFrame();
        if (!swaggerView) {
            throw new Error(`IFrame of Swagger View not found`);
        }
        console.log("Found swagger view frame");
        const swaggerFrame = swaggerView.locator('div#root');
        console.log("Waiting for swagger frame");
        await swaggerFrame.waitFor();
        const getRes = swaggerFrame.getByRole('button', { name: 'GET /', exact: true });
        console.log("Waiting for GET resource button");
        await getRes.waitFor();
        console.log("GET resource button found");
        await getRes.click();
        console.log("Clicked on GET resource button");
        await swaggerView.getByRole('button', { name: 'Try it out' }).click();
        console.log("Clicked on try it out");
        await swaggerView.getByRole('button', { name: 'Execute' }).click();
        console.log("Clicked on execute");
        closeEditorGroup();
        try {
            const saveBtn = this._page.getByRole('button', { name: 'Save', exact: true });
            await saveBtn.waitFor({ timeout: 5000 });
            console.log("Save button found");
            await saveBtn.click();
            console.log("Clicked on save button");
        } catch (error) {
            console.log("Save button not found or not clickable, continuing anyway");
        }

        const projectExplorer = new ProjectExplorer(this._page);
        const item = await projectExplorer.findItem(['Project testProject', 'APIs', 'NewTestAPI1:v1.0.2']);
        await item.getByRole('button', { name: 'Open Service Designer' }).click();
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

    public async deleteAPI() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        console.log("Navigated to project overview");

        const overviewPage = new Overview(this._page);
        await overviewPage.init();
        const webview = await overviewPage.getWebView();
        console.log("Found project testProject");
        await this._page.getByLabel('Open Project Overview').click();
        console.log("Clicked on open project overview");
        await webview.locator('vscode-button > svg').first().click();
        const deleteBtn = webview.getByText('Delete');
        console.log("Clicked on delete API");
        await deleteBtn.waitFor();
        await deleteBtn.click();
        console.log("Clicked on delete");
    }

    public async createWSDLFromFile(name: string, context: string) {
        const overviewPage = new Overview(this._page);
        await overviewPage.init();
        console.log("Initialized overview page");
        await overviewPage.goToAddArtifact();
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

        const apiFormFrame = apiWebView.locator('div#root');
        await apiFormFrame.waitFor();
        await apiFormFrame.getByRole('textbox', { name: 'Name*' }).fill(name);
        await apiFormFrame.getByRole('textbox', { name: 'Context*' }).fill(context);
        console.log("Filled name and context");
        await apiFormFrame.getByRole('radio', { name: 'From WSDL file' }).click();
        console.log("Clicked on from WSDL file");
        const wsdlFile = path.join(__dirname, 'data', 'wsdl.xml');
        // Get the users home directory
        const homeDir = os.homedir();
        const desination = path.join(homeDir, 'wsdl.wsdl');
        console.log("Copying WSDL file to ", desination, " from ", wsdlFile);
        await copyFile(wsdlFile, desination);
        console.log("Copied WSDL file to ", desination);
        await apiFormFrame.getByRole('button', { name: 'Select Location' }).click();
        await this._page.getByLabel('input').fill(desination);
        await this._page.getByRole('button', { name: 'OK' }).click();
        console.log("Clicked on OK");
        await apiFormFrame.getByRole('button', { name: 'Create' }).click();
        console.log("Clicked on create");
        const webView = await switchToIFrame('Service Designer', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Service Designer iframe");
        }
    }

    public async createWSDLFromSidePanel(name: string, context: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        console.log("Navigated to project overview");
        await projectExplorer.findItem(['Project testProject', 'APIs'], true);
        await this._page.getByLabel('Add API').click();
        console.log("Clicked on add API");
        const apiFormWebView = await switchToIFrame('API Form', this._page);
        if (!apiFormWebView) {
            throw new Error("Failed to switch to API Form iframe");
        }
        console.log("Switched to API Form iframe");
        const apiFormFrame = apiFormWebView.locator('div#root');
        await apiFormFrame.getByRole('textbox', { name: 'Name*' }).fill(name);
        await apiFormFrame.getByRole('textbox', { name: 'Context*' }).fill(context);
        console.log("Filled name and context");
        await apiFormFrame.getByLabel('From WSDL file').click();
        console.log("Clicked on from WSDL file");
        await apiFormFrame.getByRole('radio', { name: 'URL' }).click();
        await apiFormFrame.getByRole('radio', { name: 'URL' }).click();
        await apiFormFrame.getByRole('textbox', { name: 'WSDL URL' }).fill('http://www.dneonline.com/calculator.asmx?wsdl');
        await apiFormFrame.getByRole('button', { name: 'Create' }).click();
        console.log("Clicked on create");
        const webView = await switchToIFrame('Service Designer', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Service Designer iframe");
        }
        console.log("Switched to Service Designer iframe");
    }

    public async createOpenApi(name: string, context: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        console.log("Navigated to project overview");

        const overviewPage = new Overview(this._page);
        await overviewPage.init();
        await overviewPage.goToAddArtifact();
        console.log("Navigated to add artifact");

        const addArtifactPage = new AddArtifact(this._page);
        await addArtifactPage.init();
        await addArtifactPage.add('API');
        console.log("Clicked on API");

        const openAPIFile = path.join(__dirname, 'data', 'openapi.yaml');
        // Get the users home directory
        const homeDir = os.homedir();
        const desination = path.join(homeDir, 'openapi.yaml');
        console.log("Copying OpenAPI file to ", desination, " from ", openAPIFile);
        await copyFile(openAPIFile, desination);
        console.log("Copied OpenAPI file to ", desination);
        const apiFormWebView = await switchToIFrame('API Form', this._page);
        if (!apiFormWebView) {
            throw new Error("Failed to switch to API Form iframe");
        }
        const apiFormFrame = apiFormWebView.locator('div#root');
        await apiFormFrame.waitFor();
        console.log("Switched to API Form iframe");
        await apiFormFrame.getByRole('textbox', { name: 'Name*' }).fill(name);
        await apiFormFrame.getByRole('textbox', { name: 'Context*' }).fill(context);
        await apiFormFrame.locator('#version-type div').nth(1).click();
        await apiFormFrame.getByLabel('Context', { exact: true }).click();
        await apiFormFrame.getByRole('textbox', { name: 'Version' }).fill('1.0.0');
        await apiFormFrame.getByLabel('From OpenAPI definition').click();
        await apiFormFrame.getByRole('button', { name: 'Select Location' }).click();
        await this._page.getByLabel('input').fill(desination);
        await this._page.getByRole('button', { name: 'OK' }).click();
        await apiFormFrame.getByRole('button', { name: 'Create' }).click();
        console.log("Clicked on create");
        const webView = await switchToIFrame('Service Designer', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Service Designer iframe");
        }
        console.log("Switched to Service Designer iframe");
    }

    public async openDiagramView(name: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'APIs', name]);
        await page.page.locator('a').filter({ hasText: name }).first().click();
        await this._page.getByRole('treeitem', { name: /^\// }).locator('a').first().click();
        const webView = await switchToIFrame('Resource View', this._page);
        if (!webView) {
            throw new Error("Failed to switch to Resource View iframe");
        }
        await webView.getByText('Start').click();
    }
}
