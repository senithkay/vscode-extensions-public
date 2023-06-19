/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Webview } from 'vscode';
import { getLibraryWebViewContent, WebViewOptions, getComposerWebViewOptions } from '../utils';

export function render(data: any, existingData: any, primaryButton: string, webView: Webview): string {

    const body = `<div id="configEditor" class="config-editor-container"><div class="loader" /></div>`;
    const bodyCss = 'configEditor';
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
    const scripts = `
            function loadedScript() {
                function onClickDefaultButton() {
                    webViewRPCHandler.invokeRemoteMethod(
                        'onClickDefaultButton',
                        [],
                        () => {}
                    );
                }

                function onClickPrimaryButton(arg) {
                    webViewRPCHandler.invokeRemoteMethod(
                        'onClickPrimaryButton',
                        [arg],
                        () => {}
                    );
                }

                window.configEditor.renderConfigEditor(${JSON.stringify(data)}, ${JSON.stringify(existingData)}, "Cancel", "${primaryButton}", onClickDefaultButton, onClickPrimaryButton, true);
            }
        `;

    const webViewOptions: WebViewOptions = {
        ...getComposerWebViewOptions("ConfigEditor", webView),
        body, scripts, styles, bodyCss
    };

    return getLibraryWebViewContent(webViewOptions, webView);
}
