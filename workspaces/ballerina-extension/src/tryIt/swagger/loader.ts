/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */


import { Webview } from 'vscode';
import { getLibraryWebViewContent, WebViewOptions } from '../../utils';

export function loader(webView: Webview): string {

    const body = `<div id="swagger-view" class="swagger-container"><div class="loader" /></div>`;
    const bodyCss = "swagger";
    const styles = `
        .loader {
            border: 3px solid #edf0ff;
            border-top: 3px solid #5463dc;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            animation: spin 1s linear infinite;
            margin: auto;
            margin-top: 38%;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    const scripts = ``;

    const webViewOptions: WebViewOptions = {
        body, scripts, styles, bodyCss
    };

    return getLibraryWebViewContent(webViewOptions, webView);
}
