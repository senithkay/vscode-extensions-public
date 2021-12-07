/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
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

    const html = render(url);

    if (docPanel && html) {
        docPanel.webview.html = html;
    }

    docPanel.onDidDispose(() => {
        docPanel = undefined;
    });

}
