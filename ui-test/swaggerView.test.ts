/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { WebView, VSBrowser, By, EditorView, Key } from 'vscode-extension-tester';
import { join } from 'path';
import { before, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { wait, getDiagramExplorer } from './util';
import { DIAGRAM_LOADING_TIME, PROJECT_RUN_TIME } from './constants';

describe('Swagger view UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data', 'helloServicePackage');
    let editorView, rootFolder, webview;

    before(async () => {
        await VSBrowser.instance.openResources(PROJECT_ROOT);
        await wait(2000);
        editorView = new EditorView();
        await editorView.closeAllEditors();
        const diagramExplorer = await getDiagramExplorer();

        rootFolder = (await diagramExplorer.getVisibleItems())[0];
    });

    beforeEach(async () => {
        if (webview) await webview.switchBack();
        if (editorView) await editorView.closeAllEditors();
        await wait(1000);
    });

    it('Test tryit button', async () => {
        await rootFolder.expand();

        // Open low code diagram
        (await rootFolder.findChildItem("hello_service.bal"))?.click();
        await wait(DIAGRAM_LOADING_TIME)

        // switch to low code window
        webview = new WebView();
        await webview.switchToFrame();

        // run project
        const runButton = (await webview.findWebElements(By.className("action-button")))[0];
        expect(runButton).is.not.undefined;
        await runButton.click();
        await wait(PROJECT_RUN_TIME)

        // open swagger view
        const tryItButton = (await webview.findWebElements(By.className("action-button")))[1];
        expect(tryItButton).is.not.undefined;
        await tryItButton.click();
        await webview.switchBack();
        await wait(5000);

        // switch to swagger window
        const swaggerWebView = await new EditorView().openEditor('Swagger', 1) as WebView;
        swaggerWebView.switchToFrame();
        await wait(2000);

        // expand get
        const getTab = await swaggerWebView.findWebElement(By.className("operation-tag-content"));
        expect(getTab).is.not.undefined;
        await getTab.click();
        await wait(2000);

        // click try it
        const tryIt = await swaggerWebView.findWebElement(By.className("try-out__btn"));
        expect(tryIt).is.not.undefined;
        await tryIt.click();
        await wait(2000);

        // clear request body
        const reqBody = await swaggerWebView.findWebElement(By.className("body-param__text"));
        expect(reqBody).is.not.undefined;
        await reqBody.sendKeys((process.platform === "darwin" ? Key.COMMAND : Key.CONTROL), "a", Key.DELETE, Key.END);

        // cilck execute
        const execute = await swaggerWebView.findWebElement(By.className("btn execute opblock-control__btn"));
        expect(execute).is.not.undefined;
        await execute.click();
        await wait(2000);

        // scroll down
        await reqBody.sendKeys(Key.PAGE_DOWN, Key.PAGE_DOWN);
        await wait(500);

        // check response
        const codeBlock = await swaggerWebView.findWebElement(By.className("highlight-code"));
        expect(execute).is.not.undefined;
        const reponseBox = await codeBlock.findElement(By.css("code"));
        const reponse = await reponseBox.findElement(By.css("span"));
        expect(await reponse.getText()).is.equal('"Hello, World!"');
    });

    it('Test swagger view headers', async () => {
        // Open low code diagram
        (await rootFolder.findChildItem("deltaLine.bal"))?.click();
        await wait(DIAGRAM_LOADING_TIME)

        // switch to low code window
        const webview2 = new WebView();
        await webview2.switchToFrame();

        // run project
        const runButton = (await webview2.findWebElements(By.className("action-button")))[0];
        expect(runButton).is.not.undefined;
        await runButton.click();
        await wait(PROJECT_RUN_TIME)

        // open swagger view
        const tryItButton = (await webview2.findWebElements(By.className("action-button")))[1];
        expect(tryItButton).is.not.undefined;
        await tryItButton.click();
        await webview2.switchBack();
        await wait(5000);

        // switch to swagger window
        const swaggerWebView = await new EditorView().openEditor('Swagger', 1) as WebView;
        swaggerWebView.switchToFrame();
        await wait(2000);

        // expand get
        const getTab = await swaggerWebView.findWebElement(By.className("operation-tag-content"));
        expect(getTab).is.not.undefined;
        await getTab.click();
        await wait(2000);

        // click try it
        const tryIt = await swaggerWebView.findWebElement(By.className("try-out__btn"));
        expect(tryIt).is.not.undefined;
        await tryIt.click();
        await wait(2000);

        // cilck execute
        const execute = await swaggerWebView.findWebElement(By.className("btn execute opblock-control__btn"));
        expect(execute).is.not.undefined;
        await execute.click();
        await wait(2000);

        // scroll down
        const reqBody = await swaggerWebView.findWebElement(By.className("body-param__text"));
        await reqBody.sendKeys(Key.PAGE_DOWN, Key.PAGE_DOWN);
        await wait(500);

        // check response
        const codeBlock = await swaggerWebView.findWebElement(By.className("highlight-code"));
        expect(execute).is.not.undefined;
        const reponseBox = await codeBlock.findElement(By.css("code"));
        expect(await reponseBox.getText()).is.equal('{\n  "ticketId": "T120",\n  "seat": "A10",\n  "price": 68\n}');
    });
});
