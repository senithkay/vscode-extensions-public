import { test, expect, ElectronApplication, Page } from '@playwright/test';
import { startVSCode } from "@wso2-enterprise/playwright-vscode-tester";
import * as path from 'path';
import { ChoreoActivity } from './components/ActivityBar';
import { OpenExternalURLDialog } from './components/OpenExternalURLDialog';

const resourcesFolder = path.join(__dirname, '..', '..', '..', 'test-resources');
const vscodeVersion = '1.81.1';

let vscode: ElectronApplication | undefined;
let page: Page;

test.beforeAll(async () => {
  vscode = await startVSCode(resourcesFolder, vscodeVersion);
  page = await vscode.firstWindow();
});

test('Check Sign In Redirect', async () => {
  const activity = new ChoreoActivity(page);
  await activity.activate();
  await activity.signIn();
  const openExternalURLDialog = new OpenExternalURLDialog(page);
  await openExternalURLDialog.cancel();
  
});

test.afterAll(async () => {
  await vscode?.close();

});
