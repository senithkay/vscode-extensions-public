/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Locator, Page } from "@playwright/test";
import { switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";
import { ProjectExplorer } from "../ProjectExplorer";
import { AddArtifact } from "../AddArtifact";
import { Overview } from "../Overview";
import { Form } from "../Form";
import { page } from "../../Utils";

interface ResourceDataFromTemplate {
    name: string;
    type: string;
    registryPath: string;
}

interface ResourceDataFromFileSystem {
    filePath: string,
    registryPath: string;
}

export class Resource {

    constructor(private _page: Page) {
    }

    public async openNewFormFromArtifacts() {
        console.log("Opening Resource Form from Artifacts");
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        console.log("Navigated to project overview");

        const overviewPage = new Overview(this._page);
        await overviewPage.init();
        await overviewPage.goToAddArtifact();
        console.log("Navigated to Add Artifact page");

        const addArtifactPage = new AddArtifact(this._page);
        await addArtifactPage.init();
        console.log("Initialized Add Artifact page");
        await addArtifactPage.add('Resource');
        console.log("Clicked on Resource");
    }

    private getResourceForm(): Form {
        const form = new Form(this._page, 'Resource Creation Form');
        return form;
    }

    public async openNewFormFromSidePanel() {
        console.log("Opening Resource Form from Side Panel");
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Resources'], true);
        console.log("Navigated to Resources in Project Explorer");
        await this._page.getByLabel('Add Resource').click();
        console.log("Clicked on Add Resource");
        await switchToIFrame('Resource Creation Form', this._page);
    }

    public async cancelForm() {
        const form = this.getResourceForm();
        await form.switchToFormView();
        await form.cancel();
    }

    public async openResource(dirName:string, resName: string) {
        console.log("Opening Resource from Project Explorer");
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Resources', dirName, resName], true);
        console.log(`Opened Resource: ${resName} from directory: ${dirName}`);
    }

    public async addFromFileSystem(data: ResourceDataFromFileSystem) {
        console.log("Adding Resource from file system");
        const resWebView = await switchToIFrame('Resource Creation Form', this._page);
        if (!resWebView) {
            throw new Error("Failed to switch to Resource Form iframe");
        }
        console.log("Filling Resource Form from file system");
        const resourceForm = new Form(page.page, 'Resource Creation Form');
        await resourceForm.switchToFormView();
        await resourceForm.fill({
            values: {
                'Import from file system': {
                    type: 'radio',
                    value: 'checked',
                },
                'Browse file': {
                    type: 'file',
                    value: data.filePath
                },
                'Registry Path': {
                    type: 'input',
                    value: data.registryPath,
                }
            },
        });
        await resourceForm.submit();
        console.log("Resource Form submitted from file system");
    }

    public async addFromTemplate(data: ResourceDataFromTemplate, isPopUp?: boolean) {
        console.log("Adding Resource from template");
        let resFrame: Locator;
        if (isPopUp) {
            console.log("Adding Resource from template in popup");
            const resWebView = await switchToIFrame('Resource View', this._page);
            if (!resWebView) {
                throw new Error('Failed to switch to Resource View iframe');
            }
            resFrame = resWebView.locator('#popUpPanel');
        } else {
            console.log("Adding Resource from template in main view");
            const resWebView = await switchToIFrame('Resource Creation Form', this._page);
            if (!resWebView) {
                throw new Error("Failed to switch to Resource Form iframe");
            }
            resFrame = resWebView.locator('div#root');
        }
        await resFrame.waitFor();
        console.log("Filling Resource Form");
        await resFrame.getByRole('textbox', { name: 'Resource Name*' }).fill(data.name);
        await resFrame.locator('#templateType div').nth(1).click();
        await resFrame.getByLabel(data.type).click();
        await resFrame.getByRole('textbox', { name: 'Registry Path' }).click();
        await resFrame.getByRole('textbox', { name: 'Registry Path' }).fill(data.registryPath);
        await resFrame.getByRole('button', { name: 'Create' }).click();
        console.log("Resource Form submitted");
        if (!isPopUp) {
            // after adding go to project overview page
            // it was needed to avoid an issue when switching to Resource Form
            console.log("Navigating to project overview page after adding Resource");
            const projectExplorer = new ProjectExplorer(this._page);
            await projectExplorer.goToOverview("testProject");
            console.log("Initialized Project Explorer");
            const overviewPage = new Overview(this._page);
            await overviewPage.init();
            console.log("Initialized Overview Page");
        }
    }
}
