/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Page } from '@playwright/test';
import * as os from 'os';

export class ExtendedPage {
    constructor(private _page: Page) {
    }

    get page(): Page {
        return this._page;
    }

    async waitUntilExtensionReady() {
        if (process.env.CI) {
            return;
        }
        await this._page.waitForSelector('a:has-text("Activating Extensions...")', { timeout: 60000 });
        await this._page.waitForSelector('a:has-text("Activating Extensions...")', { state: 'detached' });
    }

    async getCurrentWebview() {
        const webviewFrame = await this._page.waitForSelector('iframe.webview.ready', { timeout: 30000 });
        const frame = await webviewFrame.contentFrame();
        if (!frame) {
            throw new Error(`IFrame not found`);
        }
        await frame.waitForLoadState();
        const targetFrame = await frame.waitForSelector(`iframe[title]`, { timeout: 30000 });
        const iframeTitle = await targetFrame.getAttribute('title');
        const webview = await targetFrame.contentFrame();
        console.log('Current webview:', iframeTitle);
        return { title: iframeTitle, webview };
    }

    async executePaletteCommand(command: string) {
        await this._page.keyboard.press(os.platform() === 'darwin' ? 'Meta+Shift+p' : 'Control+Shift+p');
        await this._page.keyboard.type(command);
        await this._page.keyboard.press('Enter');
    }

    async selectSidebarItem(item: string) {
        await this._page.waitForSelector(`a[aria-label="${item}"]`);
        return await this._page.click(`a[aria-label="${item}"]`);
    }
}
