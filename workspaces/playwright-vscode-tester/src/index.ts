import { CodeUtil, ReleaseQuality } from "./codeUtil";
import { BrowserLaunchOptions, CypressBrowser } from "./types";

export async function getCypressBrowser(folder: string, version: string, quality: ReleaseQuality): Promise<CypressBrowser> {
    const codeUtil = new CodeUtil(folder, quality);
    await codeUtil.downloadVSCode(version);
    const browser = await codeUtil.getCypressBrowser();
    return browser;
}

export async function getCypressBrowserOptions(folder: string, version: string, quality: ReleaseQuality): Promise<BrowserLaunchOptions> {
    const codeUtil = new CodeUtil(folder, quality);
    const options = await codeUtil.getCypressBrowserOptions({ vscodeVersion: version, resources: [] });
    return options;
}

export { ReleaseQuality } from './codeUtil';