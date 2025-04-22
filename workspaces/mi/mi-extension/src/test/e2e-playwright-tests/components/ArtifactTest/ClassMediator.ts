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
import { Overview } from "../Overview";
import { AddArtifact } from "../AddArtifact";
import { page } from "../../Utils";

export class ClassMediator {

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
        await addArtifactPage.add('Class Mediator');
    }

    public async createClassMediatorFromProjectExplorer(className: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.addArtifact(['Project testProject', 'Other Artifacts', 'Class Mediators']);

        const cmWebview = await switchToIFrame('ClassMediator Creation Form', this._page);
        if (!cmWebview) {
            throw new Error("Failed to switch to Class Mediator Form iframe");
        }
        const classMediatorFrame = cmWebview.locator('div#root');
        await classMediatorFrame.getByRole('textbox', { name: 'Package Name*' }).fill('org.wso2.sample');
        await classMediatorFrame.getByRole('textbox', { name: 'Class Name*' }).fill(className);
        await classMediatorFrame.getByRole('button', { name: 'Create' }).click();
    }

    public async createClassMediator(className: string) {
        const cmWebview = await switchToIFrame('ClassMediator Creation Form', this._page);
        if (!cmWebview) {
            throw new Error("Failed to switch to Class Mediator Form iframe");
        }
        const classMediatorFrame = cmWebview.locator('div#root');
        await classMediatorFrame.getByRole('textbox', { name: 'Package Name*' }).fill("org.wso2.sample");
        await classMediatorFrame.getByRole('textbox', { name: 'Class Name*' }).fill(className);
        await classMediatorFrame.getByRole('button', { name: 'Create' }).click();
    }

    public async openClassMediator(className: string) {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Class Mediators', `${className}.java (org.wso2.sample)`], true);
        await page.selectSidebarItem('Micro Integrator');
        await projectExplorer.goToOverview("testProject");
    }

    public async clear(classNames: string[]) {
        for (const className of classNames) {
            await this._page.getByRole('tab', { name: className }).getByLabel('Close').click();
        }
    }
}
