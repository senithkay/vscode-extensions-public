/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Locator } from "@playwright/test";
import { MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { ExtendedPage, getVsCodeButton, switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";

export class Welcome {
    private container!: Locator;

    constructor(private page: ExtendedPage) {
    }

    public async init() {
        const webview = await switchToIFrame(MACHINE_VIEW.Welcome, this.page.page, 60000)
        if (!webview) {
            throw new Error("Failed to switch to Design View iframe");
        }
        this.container = webview.locator('div#root');
    }
    public async createNewProject() {
        const btn = await getVsCodeButton(this.container, 'Create New Project', 'primary');
        await btn.click();
    }

    public async waitUntilDeattached() {
        await this.page.page.waitForSelector('iframe.webview.ready', { state: 'detached' });
    }

    public async setupEnvironment() {
        const { title: iframeTitle, webview } = await this.page.getCurrentWebview();

        if (iframeTitle === MACHINE_VIEW.ADD_ARTIFACT) {
            return true;
        }
        if (iframeTitle !== MACHINE_VIEW.SETUP_ENVIRONMENT) {
            throw new Error(`Invalid IFrame: ${iframeTitle}`);
        }

        console.log('Setting up environment');
        const container = webview?.locator('div#root');
        const javaErrorMessage = container?.locator('div:has-text("Java is not properly setup")');
        await javaErrorMessage?.waitFor({ timeout: 8000 }).catch(() => { });
        if (await javaErrorMessage!.count() > 0) {
            console.log('Java is not setup');
            const downloadJava = await getVsCodeButton(container!, 'Download Java', 'primary');
            await downloadJava.click();

            // Wait for Java to be downloaded
            await container?.locator('div:has-text("Java is setup")').first().waitFor({ timeout: 180000 });
            console.log('Java setup done');
        }
        const microIntegratorErrorMessage = container?.locator('div:has-text("Micro Integrator is not available")');
        if (await microIntegratorErrorMessage!.count() > 0) {
            console.log('Micro Integrator is not setup');
            const downloadMI = await getVsCodeButton(container!, 'Download Micro Integrator', 'primary');
            await downloadMI.click();

            // Wait for MI to be downloaded
            await container!.locator('div:has-text("Micro Integrator is setup")').first().waitFor({ timeout: 180000 });
            console.log('Micro Integrator setup done');
        }

        console.log('Environment setup done');
        const continueBtn = await getVsCodeButton(container!, 'Continue', 'primary');
        await continueBtn.click();
    }
}
