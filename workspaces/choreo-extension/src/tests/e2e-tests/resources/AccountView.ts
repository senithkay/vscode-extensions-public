/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import { Workbench, VSBrowser } from "vscode-extension-tester";
import { SIGN_IN_WITH_AUTH_CODE } from "./constants";
import { expect } from "chai";
import { chromium } from "playwright";
import { CommonUtils } from "./CommonUtils";

/** Provides functions to interact with the Account view iframe and authentication related features in the Choreo extension */
export class AccountView {
    /** Sign into choreo using test user credentials (if user is not already logged in) */
    static async signIntoChoreo() {
        console.log("Signing into Choreo");
        const driver = VSBrowser.instance.driver;
        try {
            await CommonUtils.switchToIFrame("Account");
            await CommonUtils.waitAndClickById("sign-in-btn");
            await driver.switchTo().defaultContent();
            await this.handleLoginPrompt();
            await CommonUtils.switchToIFrame("Account");
            await CommonUtils.waitUntilById("user-details", 20000);
            await driver.switchTo().defaultContent();
        } catch (err: any) {
            if (err.message.includes("sign-in-btn")) {
                console.log("Could not find the sign in button. User must be already logged in.", err);
            } else {
                throw err;
            }
        }
    }

    /**
     * Handle login prompt by performing the following
     * - Copy auth URL from login prompt, open test idp login page using.
     * - Open test idp login page using playwright.
     * - Login to test idp using test user credentials.
     * - Copy the auth code from browser when user is redirected back to Choreo.
     * - Use sign-in with Auth code to login the user.
     */
    private static async handleLoginPrompt() {
        await CommonUtils.clickPromptButton("Copy");
        const authUrl = await CommonUtils.getValueFromClipboard();
        const notifications = await new Workbench().getNotifications();
        await Promise.all(notifications.map((item) => item.dismiss()));
        const authUrlWithTestIdp = `${authUrl}&fidp=choreoe2etest`;

        console.log("Opening sign-in URL in new window");
        const browser = await chromium.launch({ headless: process.env.CI ? true : false });
        const page = await browser.newPage();
        await page.goto(authUrlWithTestIdp, { timeout: 120 * 1000 });
        await page.waitForSelector('button[type="submit"]', { timeout: 60 * 1000 });
        await page.waitForLoadState("networkidle", { timeout: 60 * 1000 });

        console.log("Entering test user credentials to login");
        await page.type("#usernameUserInput", process.env.TEST_IDP_USERNAME!);
        await page.type("#password", process.env.TEST_IDP_PASSWORD!);
        await page.click('button[type="submit"]');
        await page.click('button[id="onetrust-accept-btn-handler"]', { timeout: 60 * 1000 });
        const pageUrlStr = page.url();
        await browser.close();

        const pageUrl = new URL(pageUrlStr);
        const params = new URLSearchParams(pageUrl.search);
        const code = params.get("code");
        expect(code, "Auth code most not be null").not.null;

        if (code) {
            console.log("Using auth code to login");
            await new Workbench().executeCommand(SIGN_IN_WITH_AUTH_CODE);
            await CommonUtils.setQuickInputFieldValue({ inputValue: code, placeholder: "Code" });
            try {
                await CommonUtils.clickPromptButton("Use weaker encryption");
            } catch {
                // Ignore as Prompt to allow weaker encryption was not shown
            }
        }
    }
}
