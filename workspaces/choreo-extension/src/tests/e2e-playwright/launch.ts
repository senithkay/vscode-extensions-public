    import { _electron } from 'playwright';
import { getCypressBrowser, getCypressBrowserOptions } from "@wso2-enterprise/cypress-vscode-runner";

import path = require('path');
import { ReleaseQuality } from '@wso2-enterprise/cypress-vscode-runner/out/codeUtil';
import { ChoreoActivity } from './components/ActivityBar';

const resourcesFolder = path.join(__dirname, '..', '..', '..', 'test-resources');
const vscodeVersion = '1.81.0';

export const startVSCode = async () => {
    const browser = await getCypressBrowser(resourcesFolder, vscodeVersion, ReleaseQuality.Stable);
    const browserOptions = await getCypressBrowserOptions(resourcesFolder, vscodeVersion, ReleaseQuality.Stable);

    const vscode = await _electron.launch({
        executablePath: browser.path,
        args: browserOptions.args,
        env: browserOptions.env,

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

const firstTest = async () => {
    const vscode = await startVSCode();
    const page = await vscode.firstWindow();

    const choreoActivity = new ChoreoActivity(page);
    await choreoActivity.activate();
};

// TODO use mocha for implementing tests
firstTest();
