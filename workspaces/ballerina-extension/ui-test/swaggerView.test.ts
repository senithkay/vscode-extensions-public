/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { WebView, VSBrowser, By, EditorView } from 'vscode-extension-tester';
import { join } from 'path';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { wait, getDiagramExplorer, waitForWebview } from './util';
import { DIAGRAM_LOADING_TIME, PROJECT_RUN_TIME } from './constants';
import { Service } from './utils/Service';

describe('Swagger view UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data');

    before(async () => {
        await VSBrowser.instance.waitForWorkbench;
    });

    // it('Test tryit button', async () => {
    //     await wait(5000);
    //     VSBrowser.instance.openResources(join(PROJECT_ROOT, "helloServicePackage"));
    //     await wait(2000);
    //     const editorView = new EditorView();
    //     await editorView.closeAllEditors();
    //     const diagramExplorer = await getDiagramExplorer();

    //     const rootFolder = (await diagramExplorer.getVisibleItems())[0];
    //     await rootFolder.expand();

    //     // Open low code diagram
    //     (await rootFolder.findChildItem("hello_service.bal"))?.click();
    //     await wait(DIAGRAM_LOADING_TIME)

    //     // switch to low code window
    //     const webview = new WebView();
    //     await webview.switchToFrame();

    //     // run project
    //     const service = new Service(webview);
    //     (await (await (await (await service.getHeader()).getServiceOptions()).click()).getRun()).click();
    //     await wait(PROJECT_RUN_TIME);

    //     // open swagger view
    //     await (await service.getTryIt()).click();
    //     await webview.switchBack();

    //     // switch to swagger window
    //     await waitForWebview("Swagger");
    //     const swaggerWebView = await new EditorView().openEditor('Swagger', 1) as WebView;
    //     await swaggerWebView.switchToFrame();

    //     // expand get
    //     const operationTag = By.className("operation-tag-content");
    //     const getTab = await swaggerWebView.findWebElement(operationTag);
    //     expect(getTab).is.not.undefined;
    //     await getTab.click();
    //     await wait(2000);

    //     // click try it
    //     const tryIt = (await swaggerWebView.findWebElements(By.className("try-out__btn")))[0];
    //     expect(tryIt).is.not.undefined;
    //     await tryIt.click();
    //     await wait(2000);

    //     // cilck execute
    //     const execute = (await swaggerWebView.findWebElements(By.className("opblock-control__btn")))[0];
    //     expect(execute).is.not.undefined;
    //     await execute.click();
    //     await wait(2000);

    //     // check response
    //     const codeBlock = await swaggerWebView.findWebElement(By.className("highlight-code"));
    //     expect(execute).is.not.undefined;
    //     const reponseBox = await codeBlock.findElement(By.css("code"));
    //     const reponse = await reponseBox.findElement(By.css("span"));
    //     expect(await reponse.getText()).is.equal('"Hello, World!"');
    // });

    // it('Test swagger view headers', async () => {
    //     await wait(5000);
    //     VSBrowser.instance.openResources(join(PROJECT_ROOT, "swagger"));
    //     await wait(2000);
    //     const editorView = new EditorView();
    //     await editorView.closeAllEditors();
    //     const diagramExplorer = await getDiagramExplorer();

    //     const rootFolder = (await diagramExplorer.getVisibleItems())[0];
    //     await rootFolder.expand();

    //     // Open low code diagram
    //     (await rootFolder.findChildItem("deltaLine.bal"))?.click();
    //     await wait(DIAGRAM_LOADING_TIME)

    //     // switch to low code window
    //     const webview2 = new WebView();
    //     await webview2.switchToFrame();

    //     // run project
    //     const service = new Service(webview2);
    //     (await (await (await (await service.getHeader()).getServiceOptions()).click()).getRun()).click();
    //     await wait(PROJECT_RUN_TIME);

    //     // open swagger view
    //     await (await service.getTryIt()).click();
    //     await webview2.switchBack();
    //     await wait(5000);

    //     // switch to swagger window
    //     const swaggerWebView = await new EditorView().openEditor('Swagger', 1) as WebView;
    //     swaggerWebView.switchToFrame();
    //     await wait(2000);

    //     // expand get
    //     const getTab = await swaggerWebView.findWebElement(By.className("operation-tag-content"));
    //     expect(getTab).is.not.undefined;
    //     await getTab.click();
    //     await wait(2000);

    //     // click try it
    //     const tryIt = (await swaggerWebView.findWebElements(By.className("try-out__btn")))[0];
    //     expect(tryIt).is.not.undefined;
    //     await tryIt.click();
    //     await wait(2000);

    //     // cilck execute
    //     const execute = (await swaggerWebView.findWebElements(By.className("opblock-control__btn")))[0];
    //     expect(execute).is.not.undefined;
    //     await execute.click();
    //     await wait(2000);

    //     // check response
    //     const codeBlock = await swaggerWebView.findWebElement(By.className("highlight-code"));
    //     expect(execute).is.not.undefined;
    //     const reponseBox = await codeBlock.findElement(By.css("code"));
    //     expect(await reponseBox.getText()).is.equal('{\n  "ticketId": "T120",\n  "seat": "A10",\n  "price": 68\n}');
    // });
});
