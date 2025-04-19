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

export class InboundEPForm {
    private webView!: Frame;

    constructor(private _page: Page) {
    }

    public async init() {
        const webview = await switchToIFrame(`Event Integration Form`, this._page)
        if (!webview) {
            throw new Error("Failed to switch to Inbound EP iframe");
        }
        this.webView = webview;
    }

    public async selectType(type: string) {
        const inboundEPSection = await this.webView.waitForSelector(`h2:text("Create Event Integration") >> ../..`);
        const inboundTypeBtn = await inboundEPSection.waitForSelector(`div:text("${type}") >> ../../../..`);
        await inboundTypeBtn.click();
        await this.webView.waitForSelector(`span:text("Type:") >> ../../..`);
        await this.webView.waitForSelector(`div:text("${type}") >> ../../..`);
    }

    public async selectStoreType(type: string, typeChipName?: string) {
        const inboundEPSection = await this.webView.waitForSelector(`h2:text("Create Event Integration") >> ../..`);
        const inboundTypeBtn = await inboundEPSection.waitForSelector(`div:text("${type}") >> ../../../..`);
        await inboundTypeBtn.click();

        try {
            console.log('Confirming download of dependencies');
            const dependencyConfirmationLocator = this.webView.locator(`p:text("Dependencies will be added to the project. Do you want to continue?") >> ..`);
            await dependencyConfirmationLocator.waitFor();
            const confiramtionBtn = await getVsCodeButton(dependencyConfirmationLocator, "Yes", "primary");
            await confiramtionBtn.click();
            console.log('Download dependency confirmed');
        } catch (error) {
            console.log("Dependency download confirmation not found");
        }

        await this.webView.waitForSelector(`span:text("Type:") >> ../../..`);
        await this.webView.waitForSelector(`div:text("${typeChipName ?? type}") >> ../../..`);
    }

}
