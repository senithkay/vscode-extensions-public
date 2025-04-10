/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Frame, Page } from "@playwright/test";
import { switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";
import { MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { page } from '../Utils';
import { ProjectExplorer } from "../components/ProjectExplorer";
import { Overview } from "../components/Overview";

export class AddArtifact {
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
        if (iframeTitle != MACHINE_VIEW.ADD_ARTIFACT) {
            const projectExplorer = new ProjectExplorer(this._page);
            await projectExplorer.goToOverview("testProject");
    
            const overviewPage = new Overview(this._page);
            await overviewPage.init();
            await overviewPage.goToAddArtifact();    
        } 

        const webview = await switchToIFrame("Add Artifact", this._page)
        if (!webview) {
            throw new Error("Failed to switch to Add Artifact iframe");
        }
        this.webView = webview;
    }

    public async add(artifactType: string) {
        const createIntegrationSection = await this.webView.waitForSelector(`h3:text("Create an Integration") >> ..`);
        const viewMoreBtn = await createIntegrationSection.waitForSelector(`p:text("View More") >> ..`);
        await viewMoreBtn.click();
        const btn = await createIntegrationSection.waitForSelector(`div:text("${artifactType}") >> ../../../..`);
        await btn.click();
    }
}
