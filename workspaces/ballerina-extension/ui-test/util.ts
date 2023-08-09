/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    By,
    until,
    VSBrowser,
    Locator,
    WebElement,
    WebDriver,
    ActivityBar
} from "vscode-extension-tester";
import { DEFAULT_TIME_OUT } from "./constants";

export function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function waitUntil(locator: Locator, timeout: number = DEFAULT_TIME_OUT) {
    return VSBrowser.instance.driver.wait(until.elementLocated(locator), timeout);
}

export function waitUntilTextContains(
    element: WebElement,
    text: string,
    timeout: number = DEFAULT_TIME_OUT
) {
    return VSBrowser.instance.driver.wait(
        until.elementTextContains(element, text),
        timeout,
        "Element text did not contain " + text
    );
}

export async function waitTillCodeLensVisible(
    codeLensTitle: string,
    driver: WebDriver,
    timeout: number = DEFAULT_TIME_OUT
) {
    return driver.wait(until.elementLocated(By.xpath("//a[@title='" + codeLensTitle + "']")), timeout);
}

export function areVariablesIncludedInString(variables, str) {
    for (const variable of variables) {
        if (!str.includes(variable)) {
            return false;
        }
    }
    return true;
}

export async function switchToIFrame(
    frameName: string,
    driver: WebDriver,
    timeout: number = DEFAULT_TIME_OUT
) {
    let allIFrames: WebElement[] = [];
    const startTime = Date.now();

    while (allIFrames.length === 0) {
        allIFrames = await driver.findElements(By.xpath("//iframe"));

        if (Date.now() - startTime > timeout) {
            throw new Error(`Timeout: Unable to find any iframes within ${timeout}ms`);
        }
    }

    for (const iframeItem of allIFrames) {
        try {
            await driver.switchTo().frame(iframeItem);
            try {
                const frameElement = await driver.wait(
                    until.elementLocated(By.xpath(`//iframe[@title='${frameName}']`)),
                    timeout
                );
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
}

export async function clickOnActivity(activityName: string) {
    const activityBar = new ActivityBar();
    const viewControl = await activityBar.getViewControl(activityName);
    viewControl.click();
}
