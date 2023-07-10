/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { VSBrowser, BottomBarPanel, EditorView, ActivityBar, DebugView } from "vscode-extension-tester";
import { wait } from "./util";
import { join } from "path";
import { expect } from "chai";
import { ExtendedEditorView } from "./utils/ExtendedEditorView";
import { PROJECT_RUN_TIME } from "./constants";

describe('Debugger UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data', 'helloServicePackage');

    before(async () => {
        await VSBrowser.instance.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/hello_service.bal`);
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
    await wait(5000); // wait for terminal to appear
    const terminal = await new BottomBarPanel().openTerminalView();
    await wait(PROJECT_RUN_TIME);

    const text = await terminal.getText();
    expect(text).to.contain("Listening for transport dt_socket at address: 5010");
}

