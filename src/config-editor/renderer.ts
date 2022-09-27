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

import { getLibraryWebViewContent, WebViewOptions, getComposerWebViewOptions } from '../utils';

export function render(data: any, existingData: any, primaryButton: string): string {

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

                window.configEditor.renderConfigEditor(${JSON.stringify(data)}, ${JSON.stringify(existingData)}, "Cancel", "${primaryButton}", onClickDefaultButton, onClickPrimaryButton);
            }
        `;

    const webViewOptions: WebViewOptions = {
        ...getComposerWebViewOptions("ConfigEditor"),
        body, scripts, styles, bodyCss
    };

    return getLibraryWebViewContent(webViewOptions);
}
