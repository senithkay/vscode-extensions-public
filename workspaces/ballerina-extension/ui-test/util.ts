/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { expect } from "chai";
import {
    By,
    until,
    VSBrowser,
    Locator,
    WebElement,
    WebElementPromise,
    WebDriver
} from "vscode-extension-tester";

export function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function waitUntil(locator: Locator) {
    return VSBrowser.instance.driver.wait(until.elementLocated(locator), 15000);
}

export function waitUntilVisible(element: WebElement, timeout: number = 15000): WebElementPromise {
    return VSBrowser.instance.driver.wait(until.elementIsVisible(element), timeout);
}

export function waitUntilTextContains(element: WebElement, text: string, timeout: number = 15000): WebElementPromise {
    return VSBrowser.instance.driver.wait(until.elementTextContains(element, text), timeout, "Element text did not contain " + text);
}

export function waitForWebview(name: string) {
    return waitUntil(By.xpath("//div[@title='" + name + "']"));
}

export function areVariablesIncludedInString(variables, str) {
    for (const variable of variables) {
        if (!str.includes(variable)) {
            return false;
        }
    }
    return true;
}

export const switchToIFrame = async (frameName: string, driver: WebDriver): Promise<WebElement> => {
    let allIFrames: WebElement[] = [];
    while (allIFrames.length === 0) {
        allIFrames = await driver.findElements(By.xpath("//iframe"));
    }
    for (const iframeItem of allIFrames) {
        try {
            await driver.switchTo().frame(iframeItem);
            try {
                const frameElement = await driver.wait(until.elementLocated(By.xpath(`//iframe[@title='${frameName}']`)), 10000);
                await driver.switchTo().frame(frameElement);
                return frameElement;
            } catch {
                // Go back to root level if unable to find the frame name
                await driver.switchTo().parentFrame();
            }
        } catch {
            // no need to handle this catch block
        }
    }

    throw new Error(`IFrame of ${frameName} not found`);
};
