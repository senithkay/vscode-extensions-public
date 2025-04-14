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
import { Form } from "../Form";

interface RegistryDataFromTemplate {
    name: string;
    templateType: string;
    registryType: 'gov' | 'conf'; 
    registryPath: string;
}

interface RegistryDataFromFileSystem {
    filePath: string;
    registryType: 'gov' | 'conf';
    registryPath: string;
}

export class Registry {

    constructor(private _page: Page) {
    }

    public async openFormFromArtifacts() {
        const explorerSection = this._page.getByLabel('Project Explorer Section');
        await explorerSection.hover();
        await explorerSection.getByRole('button', { name: 'Add Artifact' }).click();
        const addArtifactPage = new AddArtifact(this._page);
        await addArtifactPage.init();
        await addArtifactPage.add('Registry');
    }

    private getRegistryForm(): Form {
        const form = new Form(this._page, 'Resource Creation Form');
        return form;
    }

    public async openFormFromSidePanel() {
        await this._page.getByLabel('Registry Explorer Section').click();
        await this._page.getByLabel('Add to Resource').click();
    }

    public async cancelForm() {
        const form = this.getRegistryForm();
        await form.switchToFormView();
        await form.cancel();
    }

    public async openRegistry(dirName:string, resName: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Registrys', dirName, resName], true);
    }

    public async addFromFileSystem(data: RegistryDataFromFileSystem) {
        const resWebView = await switchToIFrame('Resource Creation Form', this._page);
        if (!resWebView) {
            throw new Error("Failed to switch to Registry Form iframe");
        }
        const resFrame = resWebView.locator('div#root');
        await resFrame.waitFor();
        await resFrame.getByLabel('Import from file system').click();
        await resFrame.getByText('Browse file').click();
        await this._page.getByLabel('input').fill(data.filePath);
        await this._page.getByRole('button', { name: 'OK' }).click();
        await resFrame.getByRole('textbox', { name: 'Registry Path' }).fill(data.registryPath);
        await resFrame.getByRole('button', { name: 'Create' }).click();
    }

    public async addFromTemplate(data: RegistryDataFromTemplate) {
        const resWebView = await switchToIFrame('Resource Creation Form', this._page);
        if (!resWebView) {
            throw new Error("Failed to switch to Registry Form iframe");
        }
        const resFrame = resWebView.locator('div#root');
        await resFrame.waitFor();
        await resFrame.getByLabel('From existing template').click();
        await resFrame.getByRole('textbox', { name: 'Resource Name*' }).fill(data.name);
        await resFrame.locator('#templateType div').nth(1).click();
        await resFrame.getByLabel(data.templateType).click();
        await resFrame.getByLabel(this.getRegistryTypeLabel(data.registryType)).click();
        await resFrame.getByRole('textbox', { name: 'Registry Path' }).click();
        await resFrame.getByRole('textbox', { name: 'Registry Path' }).fill(data.registryPath);
        await resFrame.getByRole('button', { name: 'Create' }).click();
    }

    private getRegistryTypeLabel(type: string): string {
        switch (type) {
            case 'gov':
                return 'Governance registry (gov)';
            case 'conf':
                return 'Configuration registry (conf)';
            default:
                throw new Error(`Invalid registry type: ${type}`);
        }
    }
}
