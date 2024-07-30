/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { test, ElectronApplication } from '@playwright/test';
import { ExtendedPage, startVSCode } from "@wso2-enterprise/playwright-vscode-tester";
import * as path from 'path';
import { Diagram } from './components/Diagram';

const resourcesFolder = path.join(__dirname, '..', '..', '..', 'test-resources');
const vscodeVersion = '1.81.1';

let vscode: ElectronApplication | undefined;
let page: ExtendedPage;

test.beforeAll(async () => {
  vscode = await startVSCode(resourcesFolder, vscodeVersion);
  page = new ExtendedPage(await vscode.firstWindow());
});

test('Check Mediator', async () => {
  await new Promise(resolve => setTimeout(resolve, 15000));

  await page.executePaletteCommand('Hello World');

  const diagram = new Diagram(page.page);
  const mediator = await diagram.getMediator("Mahinda");

  await mediator.waitFor({ state: "visible", timeout: 10000 });
});

test.afterAll(async () => {
  await vscode?.close();

});
