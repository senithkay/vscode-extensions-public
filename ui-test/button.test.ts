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

import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import { join } from 'path';
import { EditorView, VSBrowser } from 'vscode-extension-tester';
import { getDiagramExplorer, wait } from './util';

describe('VSCode UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data');

    before(async () => {
        await VSBrowser.instance.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/hello_world.bal`);
        await wait(4000);
    });

    it('Test Title bar', async () => {
        const editorView = new EditorView();
        expect(await editorView.getAction("Run")).is.not.undefined;
        expect(await editorView.getAction("Debug")).is.not.undefined;

        await wait(5000);
        expect(await editorView.getAction("Show Diagram")).is.not.undefined;
        (await editorView.getAction("Show Diagram"))!.click();

        await wait(2000);
        expect(await editorView.getAction("Show Source", 1)).is.not.undefined;

    });

    it('Test Side bar', async () => {
        const diagramExplorer = await getDiagramExplorer();

        // test root buttons
        expect(diagramExplorer.getAction("Add Module")).is.not.undefined;
        expect(diagramExplorer.getAction("Refresh")).is.not.undefined;

        // test diagram explorer tree view
        const rootFolder = (await diagramExplorer.getVisibleItems())[0];
        expect(rootFolder).is.not.undefined;
        expect(await rootFolder.getLabel()).is.equal("data");
        expect(await rootFolder.getActionButton("New File")).is.not.undefined;
        expect(await rootFolder.getActionButton("New Folder")).is.not.undefined;
        expect(await rootFolder.getActionButton("Delete")).is.not.undefined;
        await rootFolder.expand();
        expect(await rootFolder.findChildItem("hello_world.bal")).is.not.undefined;

    });
});
