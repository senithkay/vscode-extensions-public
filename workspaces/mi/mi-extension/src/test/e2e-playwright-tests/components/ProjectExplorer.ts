/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Locator, Page } from "@playwright/test";

export class ProjectExplorer {
    private explorer!: Locator;

    constructor(private page: Page) {
        this.explorer = this.page.getByRole('tree').locator('div').first();
    }

    public async findItem(path: string[], click: boolean = false) {
        let currentItem;
        for (let i = 0; i < path.length; i++) {

            currentItem = this.explorer.locator(`div[role="treeitem"][aria-label="${path[i]}"]`);
            await currentItem.waitFor();

            if (i < path.length - 1) {
                const isExpanded = await currentItem.getAttribute('aria-expanded');
                if (isExpanded === 'false') {
                    await currentItem.click();
                }
            } else {
                if (click) {
                    await currentItem.click();
                } else {
                    await currentItem.hover();
                }
            }
        }
        return currentItem;
    }

    public async goToOverview(projectName: string, timeout?: number) {
        // wait for 1s
        const projectExplorerRoot = this.explorer.locator(`div[role="treeitem"][aria-label="Project ${projectName}"]`);
        await projectExplorerRoot.waitFor(timeout ? { timeout } : undefined);
        await projectExplorerRoot.hover();
        const locator = projectExplorerRoot.getByLabel('Open Project Overview');
        await locator.waitFor();
        await this.page.waitForTimeout(500); // To fix intermittent issues
        await locator.click();
    }

    public async goToAddArtifact(projectName: string) {
        // wait for 1s
        const projectExplorerRoot = this.explorer.locator(`div[role="treeitem"][aria-label="Project ${projectName}"]`);
        await projectExplorerRoot.waitFor();
        await projectExplorerRoot.hover();
        const locator = projectExplorerRoot.getByLabel('Add Artifact');
        await locator.waitFor();
        await this.page.waitForTimeout(500); // To fix intermittent issues
        await locator.click();
    }

    public async addArtifact(path: string[]) {
        let currentItem;
        for (let i = 0; i < path.length; i++) {

            currentItem = this.explorer.locator(`div[role="treeitem"][aria-label="${path[i]}"]`);
            await currentItem.waitFor();

            const isExpanded = await currentItem.getAttribute('aria-expanded');
            if (isExpanded === 'false') {
                await currentItem.click();
            }

            if (i === path.length - 1) {
                await currentItem.hover();
                const plusBtn = currentItem.locator('div.monaco-action-bar').locator('a[aria-label^="Add"]')
                await plusBtn.waitFor();
                await this.page.waitForTimeout(500); // To fix intermittent issues
                await plusBtn.click();
            }
        }
        return currentItem;
    }

}
