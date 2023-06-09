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
import { By, EditorView, TextEditor, VSBrowser, WebDriver, WebView } from 'vscode-extension-tester';
import { DIAGRAM_LOADING_TIME } from './constants';
import { getDiagramExplorer, wait } from './util';
import { ExtendedEditorView } from './utils/ExtendedEditorView';

describe('VSCode Webview UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data');

    before(async () => {
        await VSBrowser.instance.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/configServicePackage/service.bal`);
        await wait(2000);
    });

    it('Test Config Generation', async () => {
        // await wait(10000);  // wait for code lenses to appear

        // Click on `Design` code lens to open up data mapper
        // const lens = await new TextEditor().getCodeLens('Run');
        // await lens?.click();

        const editorView = new ExtendedEditorView(new EditorView());
        expect(await editorView.getAction("Run")).is.not.undefined;
        (await editorView.getAction("Run"))!.click();
        await wait(10000);
    });
});
