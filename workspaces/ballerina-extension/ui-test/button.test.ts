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
import { EditorView, VSBrowser } from 'vscode-extension-tester';
import { getDiagramExplorer, wait } from './util';
import { ExtendedCustomViewItem } from './utils/ExtendedCustomViewItem';
import { ExtendedEditorView } from './utils/ExtendedEditorView';

describe('VSCode UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data');

    before(async () => {
        await VSBrowser.instance.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/hello_world.bal`);
        await wait(4000);
    });

    it('Test Title bar', async () => {
        const editorView = new ExtendedEditorView(new EditorView());
        expect(await editorView.getAction("Run")).is.not.undefined;
        expect(await editorView.getAction("Debug")).is.not.undefined;

        await wait(5000);
        expect(await editorView.getAction("Show Diagram")).is.not.undefined;
        (await editorView.getAction("Show Diagram"))!.click();

        expect(await editorView.getAction("Show Source")).is.not.undefined;

    });

    // it('Test Side bar', async () => {
    //     const diagramExplorer = await getDiagramExplorer();

    //     // test root buttons
    //     expect(diagramExplorer.getAction("Add Module")).is.not.undefined;
    //     expect(diagramExplorer.getAction("Refresh")).is.not.undefined;

    //     // test diagram explorer tree view
    //     const rootFolder = (await diagramExplorer.getVisibleItems())[0];
    //     expect(rootFolder).is.not.undefined;
    //     expect(await rootFolder.getLabel()).is.equal("data");

    //     const treeItem = new ExtendedCustomViewItem(rootFolder);       
        
    //     expect(await treeItem.getActionButton("New File")).is.not.undefined;
    //     expect(await treeItem.getActionButton("New Folder")).is.not.undefined;
    //     expect(await treeItem.getActionButton("Delete")).is.not.undefined;
    //     await rootFolder.expand();
    //     expect(await rootFolder.findChildItem("hello_world.bal")).is.not.undefined;

    // });
});
