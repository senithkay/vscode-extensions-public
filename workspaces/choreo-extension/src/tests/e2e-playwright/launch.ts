import { _electron } from 'playwright';
import { getCypressBrowser, getCypressBrowserOptions, ReleaseQuality } from "@wso2-enterprise/playwright-vscode-tester";

import path = require('path');

const resourcesFolder = path.join(__dirname, '..', '..', '..', 'test-resources');
const vscodeVersion = '1.81.1';

export const startVSCode = async () => {
    const browser = await getCypressBrowser(resourcesFolder, vscodeVersion, ReleaseQuality.Stable);
    const browserOptions = await getCypressBrowserOptions(resourcesFolder, vscodeVersion, ReleaseQuality.Stable);

    const args = [...browserOptions.args];

    // run in headless mode if running in CI
    if (process.env.CI) {
        args.push('--headless');
        args.push('--disable-gpu');
    }

    const vscode = await _electron.launch({
        executablePath: browser.path,
        args,
        env: browserOptions.env,
        recordVideo: {
            dir: path.join(resourcesFolder, 'videos'),
            size: {
                width: 1280,
                height: 720,
            },
        },
    });

    // Get the first window that the app opens, wait if necessary.
    const window = await vscode.firstWindow();

    // Direct Electron console to Node terminal.
    // window.on('console', console.log);

    // wait for the window to be ready
    await window.waitForEvent('domcontentloaded');
    // wait for .workbench to be ready
    await window.locator('.monaco-workbench').waitFor({ state: 'visible' });
    return vscode;
};
