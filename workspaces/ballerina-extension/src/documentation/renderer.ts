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


import { Webview } from 'vscode';
import {getComposerWebViewOptions, getLibraryWebViewContent, WebViewOptions} from '../utils';


export function render(url: string, webView: Webview): string {

    const body = `
        <div id="doc-panel" style="overflow: hidden; height:100%; width: 100%">
            <div class="overlay" id="loader">
                <div class="overlay__inner">
                    <div class="overlay__content"><span class="spinner"></span></div>
                </div>
            </div>
            <iframe
                src= ${url} 
                width="100%" 
                height="100%"
                position= "absolute"
                onload= "onLoad()"
                id="iframe-id"
            ></iframe>
            
        </div>
    `;
    const styles = `
        .overlay {
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            position: fixed;
            background: white;
        }
        
        .overlay__inner {
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            position: absolute;
        }
        
        .overlay__content {
            left: 50%;
            position: absolute;
            top: 50%;
            transform: translate(-50%, -50%);
        }
        
        .spinner {
            width: 25px;
            height: 25px;
            display: inline-block;
            border-width: 2px;
            border-color: rgba(255, 255, 255, 0.05);
            border-top-color: #5667D5;
            animation: spin 1s infinite linear;
            border-radius: 100%;
            border-style: solid;
        }
        
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
    `;
    const scripts = `
        function onLoad() {
            document.getElementById("iframe-id").contentWindow.postMessage("choreo-emedding", "*");
            document.getElementById("loader").style.display = "none";
        }
     `;

    const webViewOptions: WebViewOptions = {
        ...getComposerWebViewOptions("DocPanel", webView),
        body, scripts, styles
    };

    return getLibraryWebViewContent(webViewOptions, webView);
}
