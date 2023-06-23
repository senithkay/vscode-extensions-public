/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import { join } from 'path';
import { By, VSBrowser, WebView } from 'vscode-extension-tester';
import { DIAGRAM_LOADING_TIME } from './constants';
import { getDiagramExplorer, wait } from './util';

describe('VSCode Webview UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data');

    before(async () => {
        await VSBrowser.instance.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/hello_world.bal`);
        await wait(2000);
    });

    // it('Test Diagram', async () => {
    //     const diagramExplorer = await getDiagramExplorer();
    //
    //     // test diagram explorer tree view
    //     const rootFolder = (await diagramExplorer.getVisibleItems())[0];
    //     await rootFolder.expand();
    //     (await rootFolder.findChildItem("hello_world.bal"))?.click();
    //     await wait(DIAGRAM_LOADING_TIME)
    //     const webview = new WebView();
    //     await webview.switchToFrame();
    //     const element = await webview.findWebElement(By.id("canvas-overlay"));
    //     expect(element).is.not.undefined;
    //     await webview.switchBack();
    // });
});
