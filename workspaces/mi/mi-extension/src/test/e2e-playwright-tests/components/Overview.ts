/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Frame, Page } from "@playwright/test";
import { getVsCodeButton, switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";
import { ProjectExplorer } from "./ProjectExplorer";
import { MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { page } from '../Utils';

export class Overview {
    private webView!: Frame;

    constructor(private _page: Page) {
    }

    public async init() {
        let iframeTitle;

        try {
            const webview = await page.getCurrentWebview();
            iframeTitle = webview.title;
        } catch (error) {
            console.error("Error retrieving iframe title:", error);
            iframeTitle = null;
        }                         
        if (iframeTitle != MACHINE_VIEW.Overview) {
            const projectExplorer = new ProjectExplorer(this._page);
            await projectExplorer.goToOverview("testProject");   
        } 
        const webview = await switchToIFrame("Project Overview", this._page)
        if (!webview) {
            throw new Error("Failed to switch to Overview iframe");
        }
        this.webView = webview;
    }
    public async createNewProject() {
        const container = this.webView.locator('div#root');
        (await getVsCodeButton(container, 'Create New Project', 'primary')).click();
    }

    public async checkForArtifact(artifactType: string, artifactName: string) {
        const artifactTypeSection = await this.webView.waitForSelector(`h3:text("${artifactType}") >> ..`);
        const artifact = await artifactTypeSection.waitForSelector(`div:text("${artifactName}") >> ..`);
        if (await artifact.isVisible()) {
            return true;
        }
        return false;
    }

    public async selectArtifact(artifactType: string, artifactName: string) {
        const artifactTypeSection = await this.webView.waitForSelector(`h3:text("${artifactType}") >> ..`);
        const artifact = await artifactTypeSection.waitForSelector(`div:text("${artifactName}") >> ..`);
        await artifact.click();
    }

    public async goToAddArtifact() {
        const addArtifactBtn = await this.webView.waitForSelector(`vscode-button:text("Add Artifact")`);
        await addArtifactBtn.click();
    }

    public async getWebView() {
        return this.webView;
    }

    public async getProjectSummary() {
        await this.webView.getByRole('heading', { name: 'Project Information Icon' }).locator('i').click();
    }

    public async updateProjectVersion(version: string) {
        await this.webView.getByRole('textbox', { name: 'Version*The version of the' }).fill(version);
        await this.webView.getByRole('button', { name: 'Save Changes' }).click();
    }

    public async addOtherDependencies() {
        await this.webView.locator('[id="link-external-manage-dependencies-Other\\ Dependencies"] i').click();
        await this.webView.waitForSelector('#popUpPanel >> text=Other Dependencies', { state: 'visible', timeout: 5000});
        await this.webView.getByText('Add Dependency').click();
        await this.webView.getByRole('textbox', { name: 'Group ID*' }).fill("mysql");
        await this.webView.getByRole('textbox', { name: 'Artifact ID*' }).fill("mysql-connector-java");
        await this.webView.getByRole('textbox', { name: 'Version*' }).fill("8.0.33");
        await this.webView.getByText('Save').click();
        await this.webView.getByRole('button', { name: 'Update Dependencies' }).click();
    }

    public async editOtherDependencies() {
        const manageDependency = await this.webView.waitForSelector('[id="link-external-manage-dependencies-Other\\ Dependencies"] i', { state: 'visible', timeout: 5000});
        await manageDependency.click();
        await this.webView.waitForSelector('#popUpPanel >> text=Other Dependencies', { state: 'visible', timeout: 5000});
        await this.webView.locator('[data-testid^="mysql-connector-java   8.0.33"]:has-text("mysql mysql-connector-java")').click();
        await this.webView.getByRole('textbox', { name: 'Artifact ID*' }).fill('mysql-connector--java');
        await this.webView.getByText('Save').click();
        await this.webView.getByRole('button', { name: 'Update Dependencies' }).click();
    }

    public async deleteOtherDependencies() {
        await this.webView.locator('[id="link-external-manage-dependencies-Other\\ Dependencies"] i').click();
        await this.webView.waitForSelector('#popUpPanel >> text=Other Dependencies', { state: 'visible', timeout: 5000});
        await this.webView.locator('[data-testid^="mysql-connector--java   8.0.33"]').locator('i').nth(2).click();
        await this.webView.getByRole('button', { name: 'Update Dependencies' }).click();
    }

    public async addConnectorDependencies() {
        await this.webView.locator('[id="link-external-manage-dependencies-Connector\\ Dependencies"] i').click();
        await this.webView.waitForSelector('#popUpPanel >> text=Connector Dependencies', { state: 'visible', timeout: 5000});
        await this.webView.getByText('Add Dependency').click();
        await this.webView.getByRole('textbox', { name: 'Group ID*' }).fill("org.wso2.integration.connector");
        await this.webView.getByRole('textbox', { name: 'Artifact ID*' }).fill("mi-connector-amazonsqs");
        await this.webView.getByRole('textbox', { name: 'Version*' }).fill("2.0.3");
        await this.webView.getByText('Save').click();
        await this.webView.getByRole('button', { name: 'Update Dependencies' }).click();
    }

    public async editConnectorDependencies() {
        await this.webView.locator('[id="link-external-manage-dependencies-Connector\\ Dependencies"] i').click();
        await this.webView.waitForSelector('#popUpPanel >> text=Connector Dependencies', { state: 'visible', timeout: 5000});
        await this.webView.locator('[data-testid^="mi-connector-amazonsqs   2.0.3"]:has-text("mi-connector-amazonsqs")').click();
        await this.webView.getByRole('textbox', { name: 'Artifact ID*' }).fill('mi-connector--amazonsqs');
        await this.webView.getByText('Save').click();
        await this.webView.getByRole('button', { name: 'Update Dependencies' }).click();
    }

    public async deleteConnectorDependencies() {
        await this.webView.locator('[id="link-external-manage-dependencies-Connector\\ Dependencies"] i').click();
        await this.webView.waitForSelector('#popUpPanel >> text=Connector Dependencies', { state: 'visible', timeout: 5000});
        await this.webView.locator('[data-testid^="mi-connector--amazonsqs   2.0.3"]').locator('i').nth(2).click();
        await this.webView.getByRole('button', { name: 'Update Dependencies' }).click();
    }

    public async addConfig() {
        await this.webView.locator('vscode-link').filter({ hasText: 'Manage Configurables' }).locator('i').click();
        await this.webView.waitForSelector('#popUpPanel >> text=Configurable', { state: 'visible', timeout: 5000});
        await this.webView.getByText('Add Configurable').click();
        await this.webView.getByRole('textbox', { name: 'Key*' }).fill("test_name");
        await this.webView.locator('#dropdown-1 div').nth(1).click()
        await this.webView.getByLabel('string').click();
        await this.webView.getByText('Save').click();
        await this.webView.getByRole('button', { name: 'Update Configurables' }).click();
    }

    public async editConfig() {
        await this.webView.locator('vscode-link').filter({ hasText: 'Manage Configurables' }).locator('i').click();
        await this.webView.waitForSelector('#popUpPanel >> text=Configurable', { state: 'visible', timeout: 5000});
        await this.webView.locator('[id="0"] .codicon').first().click();
        await this.webView.locator('#dropdown-1 svg').click();
        await this.webView.getByLabel('cert').click();
        await this.webView.getByText('Save').click();
        await this.webView.getByRole('button', { name: 'Update Configurables' }).click();
    }

    public async deleteConfig() {
        await this.webView.locator('vscode-link').filter({ hasText: 'Manage Configurables' }).locator('i').click();
        await this.webView.waitForSelector('#popUpPanel >> text=Configurable', { state: 'visible', timeout: 5000});
        await this.webView.locator('[id="0"] .codicon').nth(1).click();
        await this.webView.getByRole('button', { name: 'Update Configurables' }).click();
    }
}
