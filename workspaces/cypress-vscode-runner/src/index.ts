import { CodeUtil, ReleaseQuality } from "./codeUtil";
import { BrowserLaunchOptions, CypressBrowser } from "./types";

const codeUtil = new CodeUtil("test-resources", ReleaseQuality.Stable);

export async function getCypressBrowser(): Promise<CypressBrowser> {
    await codeUtil.downloadVSCode();
    const browser = await codeUtil.getCypressBrowser();
    return browser;
}

export async function getCypressBrowserOptions(): Promise<BrowserLaunchOptions> {
    const options = await codeUtil.getCypressBrowserOptions();
    return options;
}
