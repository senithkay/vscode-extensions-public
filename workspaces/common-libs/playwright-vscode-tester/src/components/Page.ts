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

    executePaletteCommand(command: string) {
        return this._page.keyboard.press(os.platform() === 'darwin' ? 'Meta+Shift+p' : 'Ctrl+Shift+p')
            .then(() => this._page.keyboard.type(command))
            .then(() => this._page.keyboard.press('Enter'))
            .then(() => this._page.waitForSelector('div[class="monaco-list-row"]'))
            .then(() => this._page.keyboard.press('Enter'));
    }
}
