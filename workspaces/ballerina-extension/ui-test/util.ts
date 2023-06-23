/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { expect } from "chai";
import { SideBarView, CustomTreeSection, ActivityBar, By, until, VSBrowser, Locator } from "vscode-extension-tester";

export function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function waitUntil(locator: Locator) {
    return VSBrowser.instance.driver.wait(until.elementLocated(locator), 15000);
}

export function waitForWebview(name: string) {
    return waitUntil(By.xpath("//div[@title='" + name + "']"));
}

export async function getDiagramExplorer() {
    const activityBar = new ActivityBar();
    // test side bar low code activity
    const lowCodeActivity = await activityBar.getViewControl('Ballerina Low-Code');
    expect(lowCodeActivity).is.not.undefined;
    lowCodeActivity!.openView();
    const sideBar = new SideBarView();
    // test tree views
    expect(await sideBar.getTitlePart().getTitle()).is.equal("BALLERINA LOW-CODE: DIAGRAM EXPLORER");
    const diagramExplorer = await sideBar.getContent().getSection('Diagram Explorer') as CustomTreeSection;
    expect(diagramExplorer).is.not.undefined;
    await wait(5000);
    return diagramExplorer;
}
