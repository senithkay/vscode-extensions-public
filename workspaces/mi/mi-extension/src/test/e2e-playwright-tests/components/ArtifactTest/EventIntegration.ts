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

export class EventIntegration {

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
        await addArtifactPage.add('Event Integration');
    }

    public async add() {
        const epWebView = await switchToIFrame('Event Integration Form', this._page);
        if (!epWebView) {
            throw new Error("Failed to switch to Event Integration Form iframe");
        }
        const epFrame = epWebView.locator('div#root');
        const httpsMessage = epFrame.locator('div:has-text("HTTPS")');
        await httpsMessage.waitFor({ timeout: 10000 });
        await epFrame.getByText('HTTPS').click();
        const httpEPWebview = await switchToIFrame('Event Integration Form', this._page);
        if (!httpEPWebview) {
            throw new Error("Failed to switch to Http Endpoint Form iframe");
        }
    }

    public async edit() {
        
    }
}
