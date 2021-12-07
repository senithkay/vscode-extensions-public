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


import {getComposerWebViewOptions, getLibraryWebViewContent, WebViewOptions} from '../utils';


export function render(url: string): string {

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
        ...getComposerWebViewOptions("DocPanel"),
        body, scripts, styles
    };

    return getLibraryWebViewContent(webViewOptions);
}
