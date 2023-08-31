/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { VSBrowser, BottomBarPanel, EditorView, ActivityBar, DebugView, DebugToolbar } from "vscode-extension-tester";
import { wait, waitUntilTextContains } from "./util";
import { join } from "path";
import { expect } from "chai";
import { ExtendedEditorView } from "./utils/ExtendedEditorView";
import { fail } from "assert";
import { PROJECT_RUN_TIME } from "./constants";

const expectedOut = "Listening for transport dt_socket at address: 501";

describe('Debugger UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data', 'helloServicePackage');

    beforeEach(async () => {
        await VSBrowser.instance.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/hello_service.bal`);
        await VSBrowser.instance.waitForWorkbench();
    });

    it('Test Debug Codelense', async () => {
        const editorView = new ExtendedEditorView(new EditorView());
        const lens = await editorView.getAction("Debug");
        expect(lens).is.not.undefined;
        await lens.click();

        await verifyDebugOutput();
    });

    it('Test run & debug', async () => {
        await new EditorView().closeAllEditors();
        const btn = await new ActivityBar().getViewControl('Run');
        const debugView = (await btn.openView()) as DebugView;

        await debugView.start();

        await verifyDebugOutput();
    });
});

async function verifyDebugOutput() {
    await wait(PROJECT_RUN_TIME);
    const terminal = await new BottomBarPanel().openTerminalView();

    await waitUntilTextContains(terminal, expectedOut, 30000).catch((e) => {
        fail(e);
    }).finally(async () => {
        const bar = await DebugToolbar.create();
        await bar.stop();
        await terminal.executeCommand('clear');
    });
}

