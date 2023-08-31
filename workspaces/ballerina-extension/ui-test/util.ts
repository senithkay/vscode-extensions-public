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
    ActivityBar,
    BottomBarPanel,
} from "vscode-extension-tester";
import { DEFAULT_TIME_OUT, VSCODE_ZOOM_TIME } from "./constants";
import { fail } from "assert";

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

export async function waitForMultipleElementsLocated(
    driver: WebDriver,
    locators: By[],
    timeout: number = DEFAULT_TIME_OUT
) {
    const promises = locators.map(locator =>
        driver.wait(until.elementLocated(locator), timeout)
    );
    await Promise.all(promises);
}

export async function waitForElementToDisappear(
    driver: WebDriver,
    elementLocator: By,
    timeout: number = DEFAULT_TIME_OUT
) {
    return await driver.wait(until.stalenessOf(driver.findElement(elementLocator)), timeout);
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

export async function getLabelElement(driver: WebDriver, targetSubstring: string) {
    return await driver.findElement(By.xpath(`//*[contains(text(), "${targetSubstring}")]`));
}

export function waitForWebview(name: string) {
    return waitUntil(By.xpath("//div[@title='" + name + "']"));
}

export async function verifyTerminalText(text: string) {
    const terminal = await new BottomBarPanel().openTerminalView();

    await waitUntilTextContains(terminal, text, 60000).catch((e) => {
        fail(e);
    });
}

export async function waitUntilElementIsEnabled(locator: By, timeout: number = DEFAULT_TIME_OUT): Promise<WebElement> {
    const maxTimeout = timeout;
    const driver = VSBrowser.instance.driver;
    let element: WebElement;
    let elementIdentifier;
    return new Promise(async (resolve, reject) => {
        const startTime = Date.now();
        const checkElementEnabled = async () => {
            try {
                if (!elementIdentifier) {
                    // Initial attempt or re-locate if stale
                    element = await driver.findElement(locator);
                    elementIdentifier = await element.getAttribute('xpath');
                } else {
                    element = await driver.findElement(By.xpath(elementIdentifier));
                }
                await driver.wait(until.elementIsEnabled(element), maxTimeout - (Date.now() - startTime));
                resolve(element);
            } catch (error) {
                if (Date.now() - startTime < maxTimeout) {
                    setTimeout(checkElementEnabled, 1000);
                } else {
                    reject(new Error('Element not found or not enabled within the specified timeout'));
                }
            }
        };
        await checkElementEnabled();
    });
}

export async function waitForBallerina() {
    const elementText = 'Detecting';
    const xpath = By.xpath(`//*[contains(text(), '${elementText}')]`);
    const element = await waitUntil(xpath, 30000);
    await VSBrowser.instance.driver.wait(until.elementTextContains(element, "Swan"));
}

export async function workbenchZoomOut(workbench, times) {
    for (let i = 1; i <= times; i++) {
        await workbench.executeCommand("View: Zoom Out");
        await wait(VSCODE_ZOOM_TIME); // This is a constant wait to apply zoom effect into the vscode
    }
}
