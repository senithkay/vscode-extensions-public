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

import { Webview } from "vscode";
import { getComposerWebViewOptions, getLibraryWebViewContent, WebViewOptions } from "../utils/webview-utils";

export function render(webView: Webview, isChoreoProject: boolean, selectedNodeId: string) {
    const body = `<div class = "container" id = "webview-container" />`;
    const bodyCss = ``;
    const styles = `
        .container {
            background-color: white;
            height: 100%;
            overflow: hidden;
            width: 100%;
        }
    `;
    const scripts = `
        function loadedScript() {
            window.addEventListener('message', event => {
                let msg = event.data;
                switch(msg.command){
                    case 'refresh':
                        renderDiagrams();
                }
            });

            function getComponentModel() {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'getComponentModel',
                        [],
                        (response) => {
                            resolve(response);
                        }
                    );
                })
            }

            function enrichChoreoMetadata(model) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'enrichChoreoMetadata',
                        [model],
                        (response) => {
                            resolve(response);
                        }
                    );
                })
            }

            function showChoreoProjectOverview() {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'showChoreoProjectOverview',
                        [],
                        () => {
                            resolve();
                        }
                    );
                })
            }

            function renderDiagrams() {
                designDiagram.renderDesignDiagrams(
                    true,
                    ${isChoreoProject},
                    "${selectedNodeId}",
                    getComponentModel,
                    enrichChoreoMetadata,
                    showChoreoProjectOverview,
                    document.getElementById("webview-container")
                );
            }

            renderDiagrams();
        }
    `;

    const webViewOptions: WebViewOptions = {
        ...getComposerWebViewOptions("DesignDiagram", webView),
        body, scripts, styles, bodyCss
    };

    return getLibraryWebViewContent(webViewOptions, webView);
}
