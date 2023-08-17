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
    BottomBarPanel, WebView, Key,
} from "vscode-extension-tester";
import { DEFAULT_TIME_OUT } from "./constants";
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

export function getElementByXPathUsingTestID(
    testID: string
) {
    return By.xpath("//*[@data-testid='" + testID + "']");
}

export function getListElementByXPathUsingText(
    text: string
) {
    return By.xpath("//li[text()='" + text + "']");
}

export function getInputElementByXPathUsingValue(
    value: string
) {
    return By.xpath("//input[@value='" + value + "']");
}

export function getElementByXPathUsingTitle(
    title: string
) {
    return By.xpath("//*[@title='" + title + "']");
}

export function getElementByCssUsingId(
    id: string
) {
    return By.css(`[data-testid='${id}']`);
}

export async function waitForElementToAppear(
    testId: string,
) {
    waitUntil(getElementByXPathUsingTestID(testId));
}

export async function clickListItem(webview: WebView, className: string, text: string) {
    const options = await webview.findWebElement(By.xpath(`//li[contains(@class, '${className}') and contains(text(), '${text}')]`));
    await waitUntilVisible(options);
    await options.click();
}

export async function openNodeMenu(webview: WebView, nodeTestId: string, menuTestId: string) {
    const options = await webview.findWebElement(By.xpath(`//div[contains(@data-testid, '${nodeTestId}')]/*[contains(@data-testid, '${menuTestId}')]`));
    await waitUntilVisible(options);
    await options.click();
}

export async function clickWebElement(webview: WebView, locator: Locator) {
    const element = await webview.findWebElement(locator);
    await element.click();
}

export async function selectItemFromAutocomplete(webview: WebView, currentSelection: string, valueToSelect: string, clearInput: boolean = false) {
    const nodeFilter = await webview.findWebElement(getInputElementByXPathUsingValue(currentSelection));
    await nodeFilter.click();
    if (clearInput) {
        await clickWebElement(webview, getElementByXPathUsingTitle("Clear"));
        await nodeFilter.sendKeys(valueToSelect, Key.DOWN, Key.ENTER);
    } else {
        await nodeFilter.sendKeys(valueToSelect, Key.DOWN, Key.ENTER);
    }
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

export function waitForWebview(name: string) {
    return waitUntil(By.xpath("//div[@title='" + name + "']"));
}

export async function verifyTerminalText(text: string) {
    const terminal = await new BottomBarPanel().openTerminalView();

    await waitUntilTextContains(terminal, text, 60000).catch((e) => {
        fail(e);
    });
}

export function waitUntilVisible(element: WebElement, timeout: number = DEFAULT_TIME_OUT) {
    return VSBrowser.instance.driver.wait(until.elementIsVisible(element), timeout);
}
