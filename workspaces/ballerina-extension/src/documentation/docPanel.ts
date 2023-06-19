/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
