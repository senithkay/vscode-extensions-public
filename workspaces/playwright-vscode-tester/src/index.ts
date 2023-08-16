import { CodeUtil, ReleaseQuality } from "./codeUtil";
import { BrowserLaunchOptions, Browser } from "./types";

export async function getBrowser(folder: string, version: string, quality: ReleaseQuality): Promise<Browser> {
    const codeUtil = new CodeUtil(folder, quality);
    await codeUtil.downloadVSCode(version);
    const browser = await codeUtil.getBrowser();
    return browser;
}

export async function getBrowserLaunchOptions(folder: string, version: string, quality: ReleaseQuality): Promise<BrowserLaunchOptions> {
    const codeUtil = new CodeUtil(folder, quality);
    const options = await codeUtil.getCypressBrowserOptions({ vscodeVersion: version, resources: []});
    return options;
}
