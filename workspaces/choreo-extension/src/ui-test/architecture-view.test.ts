/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import assert = require("assert");
import { expect } from "chai";
import { describe, it } from "mocha";
import { join } from "path";
import { By, EditorView, VSBrowser, WebView, Workbench } from 'vscode-extension-tester';
import { ARCHITECTURE_VIEW_COMMAND, ARCHITECTURE_WEBVIEW_TITLE, ADD_CHOREO_COMPONENT_WEBVIEW_TITLE, TEST_DATA_ROOT, wait } from "./resources";

const TEST_PROJECT_NAME = "FooProject2";
const WORKSPACE_FILE_PATH = join(TEST_PROJECT_NAME, `${TEST_PROJECT_NAME}.code-workspace`);

describe("Architecture view tests", () => {
    let editor: EditorView;
    let diagramWebview: WebView;
    let workbench: Workbench;

    before(async () => {
        await VSBrowser.instance.waitForWorkbench();

        // Loading Choreo project workspace
        workbench = new Workbench();
        VSBrowser.instance.openResources(join(TEST_DATA_ROOT, WORKSPACE_FILE_PATH));
        await wait(6000);

        editor = new EditorView();
        await editor.closeAllEditors();
        await wait(2000);
    });

    it("Generate Architecture View", async () => {
        await workbench.executeCommand(ARCHITECTURE_VIEW_COMMAND);
        await wait(4000);

        // Verify the opening of the Architecture Webview
        const viewTiles = await editor.getOpenEditorTitles();
        assert.ok(viewTiles.includes(ARCHITECTURE_WEBVIEW_TITLE));
    });

    it("Verify No Components Prompt Screen", async () => {
        diagramWebview = new WebView();
        await diagramWebview.switchToFrame();

        // Assert the presence of the webview container
        const diagramContainer = await diagramWebview.findWebElement(By.id("webview-container"));
        expect(diagramContainer).is.not.undefined;

        // Assert the presence of the no-components prompt screen
        const noComponentsPrompt = await diagramWebview.findWebElement(By.id("no-components-prompt-screen"));
        expect(noComponentsPrompt).is.not.undefined;
    });

    it("Try Add Component Button", async () => {
        await diagramWebview.switchToFrame();

        // Assert the presence of the add component button
        const addComponentBtn = await diagramWebview.findWebElement(By.id("add-component-btn"));
        expect(addComponentBtn).is.not.undefined;

        // Click to add component. Should open up Choreo webview since it is a Choreo project
        await addComponentBtn.click();
        await wait(5000);
        await diagramWebview.switchBack();
    });

    it("Verify Choreo Component Creation Webview", async () => {
        const viewTiles = await editor.getOpenEditorTitles();
        assert(viewTiles.includes(ADD_CHOREO_COMPONENT_WEBVIEW_TITLE));
    });
});
