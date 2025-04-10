/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Locator, Page } from "@playwright/test";

export class Explorer {
    private explorer!: Locator;

    constructor(page: Page, name: string) {
        this.explorer = page.locator(`div[role="tree"][aria-label="${name}"]`);
    }

    public async init () {
        await this.explorer.waitFor();
    }

    public async findItem(path: string[], click: boolean = false) {
        let currentItem: any;
        for (let i = 0; i < path.length; i++) {

            currentItem = this.explorer.locator(`div[role="treeitem"][aria-label="${path[i]}"]`);
            await currentItem.waitFor();

            if (i < path.length - 1) {
                let isExpanded = await currentItem.getAttribute('aria-expanded');
                if (isExpanded === 'false') {
                    await currentItem.click();
                }
            } else {
                if (click) {
                    await currentItem.click();
                }
            }
        }
        return currentItem;
    }
}
