/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Frame, Keyboard, Locator, Page } from "@playwright/test";
import { getVsCodeButton, switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";
import path from "path";
import * as os from 'os';

const dataFolder = __dirname.replace('components', 'data');
export class ConnectorStore {
    private webView!: Frame;
    private container!: Locator;

    constructor(private _page: Page, private type: 'Connector Store Form' | 'Resource View') {
    }

    public async init() {
        const webview = await switchToIFrame(`${this.type}`, this._page)
        if (!webview) {
            throw new Error("Failed to switch to Connector Store iframe");
        }
        this.webView = webview;
        this.container = webview.locator('div#root');
    }

    public async add(artifactType: string) {
        const createIntegrationSection = await this.webView.waitForSelector(`h3:text("Create an Integration") >> ..`);
        const viewMoreBtn = await createIntegrationSection.waitForSelector(`p:text("View More") >> ..`);
        await viewMoreBtn.click();
        const btn = await createIntegrationSection.waitForSelector(`div:text("${artifactType}") >> ../../../..`);
        await btn.click();
    }

    public async search(str: string) {
        const searchInput = this.webView.locator("input");
        await searchInput.type(str);
    }

    public async selectOperation(operationName: string) {
        const operationBtn = await this.webView.waitForSelector(`div:text("${operationName}") >> ../..`);
        await operationBtn.click();
    }

    public async confirmDownloadDependency(failIfNotFound: boolean = false) {
        try {
            console.log('Confirming download of dependencies');
            await this.webView.waitForSelector(`p:text("Dependencies will be added to the project. Do you want to continue?")`);
            const confiramtionBtn = await getVsCodeButton(this.container, "Yes", "primary");
            await confiramtionBtn.click();
            console.log('Download dependency confirmed');
        } catch (error) {
            if (failIfNotFound) {
                throw new Error("Failed to confirm download dependency");
            }
            console.log("Dependency download confirmation not found");
        }
    }

    public async importConnector(fileName: string, type: 'proto' | 'zip' | 'OpenAPI') {
        console.log(`Importing connector from file: ${fileName}`);
        if (type === 'proto') {
            console.log(`Importing gRPC (Proto) connector from file: ${fileName}`);
            const dropdownBtn = this.webView.locator('#dropdown-icon-openapi i')
            await dropdownBtn.waitFor();
            await dropdownBtn.click();
            console.log(`Clicked on dropdown button for import options`);
            const option = this.webView.getByRole('heading', { name: 'For gRPC (Proto)' });
            await option.waitFor();
            await option.click();
            const importBtn = this.webView.getByText('Import (proto)');
            await importBtn.waitFor();
            await importBtn.click();
        } else if (type === 'OpenAPI') {
            const importBtn = this.webView.getByText('Import (openapi)');
            await importBtn.waitFor();
            await importBtn.click();
        }

        const locationBtn = await this.webView.waitForSelector(`vscode-button:text("Select Location")`);
        await locationBtn.click();

        const filePath = path.join(dataFolder, fileName);
        await this.fillLocationPath(filePath);

        const submitBtn = await this.webView.waitForSelector(`vscode-button:text("Import")`);
        await submitBtn.click();

        const loader = this.webView.locator(`div:text("Importing Connector...")`);
        await loader.waitFor();

        if (type !== 'zip') {
            const addNewConnection = this.webView.locator(`h2:text("Add New Connection")`);
            await addNewConnection.waitFor();
        }
    }

    async fillLocationPath(path: string) {
        const keyboard = this._page.keyboard;
        // Waiting for the command palette input
        await new Promise(resolve => setTimeout(resolve, 500));
        await keyboard.press(os.platform() === 'darwin' ? 'Meta+A' : 'Control+A');
        await keyboard.press('Backspace');
        await keyboard.type(path);
        await keyboard.press('Enter');
    }

}
