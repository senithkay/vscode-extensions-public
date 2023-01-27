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
import { describe, it } from "mocha";
import { join } from "path";
import { EditorView, VSBrowser, Workbench } from 'vscode-extension-tester';
import { ARCHITECTURE_VIEW_COMMAND, ARCHITECTURE_WEBVIEW_TITLE, TEST_DATA_ROOT, wait } from "./resources";

const TEST_PROJECT_NAME = "FooProject2";
const WORKSPACE_FILE_PATH = join(TEST_PROJECT_NAME, `${TEST_PROJECT_NAME}.code-workspace`);

describe("Sample UI test", () => {
    before(async () => {
        await VSBrowser.instance.waitForWorkbench();
    });

    it("Generate Architecture View", async () => {
        const workbench = new Workbench();
        VSBrowser.instance.openResources(join(TEST_DATA_ROOT, WORKSPACE_FILE_PATH));
        await wait(2500);

        const editor = new EditorView();
        await editor.closeAllEditors();

        await workbench.executeCommand(ARCHITECTURE_VIEW_COMMAND);
        await wait(2500);
        const viewTiles = await editor.getOpenEditorTitles();
        assert.ok(viewTiles.includes(ARCHITECTURE_WEBVIEW_TITLE));
    });
});
