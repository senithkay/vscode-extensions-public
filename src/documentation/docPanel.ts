/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { ViewColumn, window, WebviewPanel } from "vscode";
import { getCommonWebViewOptions } from '../utils';
import {render} from "./renderer";

let docPanel: WebviewPanel | undefined;

export async function showDocumentationView(url: string): Promise<void> {
    if (docPanel) {
        docPanel.dispose();
    }

    // Create and show a new web view
    docPanel = window.createWebviewPanel(
        'ballerinaDocumentation',
        `Documentation`,
        { viewColumn: ViewColumn.Beside, preserveFocus: true },
        getCommonWebViewOptions()
    );


    if (docPanel) {
        const html = render(url, docPanel.webview);
        if (html) {
            docPanel.webview.html = html;
        }
    }

    docPanel.onDidDispose(() => {
        docPanel = undefined;
    });

}
