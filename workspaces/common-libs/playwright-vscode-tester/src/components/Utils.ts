/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Frame, Page } from "@playwright/test";

export async function switchToIFrame(
    frameName: string,
    page: Page,
    timeout: number = 150000
): Promise<Frame | null> {
    const webviewFrame = await page.waitForSelector('iframe.webview.ready', { timeout });
    const frame = await webviewFrame.contentFrame();
    if (!frame) {
        throw new Error(`IFrame of ${frameName} not found`);
    }
    await frame.waitForLoadState();
    const targetFrame = await frame.waitForSelector(`iframe[title="${frameName}"]`, { timeout });
    if (!targetFrame) {
        throw new Error(`IFrame of ${frameName} not found`);
    }
    const childFrame = await targetFrame.contentFrame();
    await childFrame?.waitForLoadState();
    return childFrame;
}
