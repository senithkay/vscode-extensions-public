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

import { Uri, ExtensionContext, WebviewOptions, WebviewPanelOptions, Webview } from "vscode";
import { join, sep } from "path";
import { ballerinaExtInstance } from "../core";

export const RESOURCES_CDN = `https://choreo-shared-codeserver-cdne.azureedge.net/ballerina-low-code-resources@${process.env.BALLERINA_LOW_CODE_RESOURCES_VERSION}`;
const devMode = process.env.WEB_VIEW_WATCH_MODE === "true";

function getWebViewResourceRoot(): string {
    return join((ballerinaExtInstance.context as ExtensionContext).extensionPath,
        'resources');
}

function getNodeModulesRoot(): string {
    return join((ballerinaExtInstance.context as ExtensionContext).extensionPath,
        'node_modules');
}

export function getCommonWebViewOptions(): Partial<WebviewOptions & WebviewPanelOptions> {
    return {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
            Uri.file(join((ballerinaExtInstance.context as ExtensionContext).extensionPath, 'resources', 'jslibs')),
            Uri.file(getWebViewResourceRoot()),
            Uri.file(getNodeModulesRoot())
        ],
    };
}

function getVSCodeResourceURI(filePath: string, webView: Webview): string {
    return webView.asWebviewUri(Uri.file(filePath)).toString();
}

export interface WebViewOptions {
    jsFiles?: string[];
    cssFiles?: string[];
    body: string;
    scripts: string;
    styles: string;
    bodyCss?: string;
}

export function getLibraryWebViewContent(options: WebViewOptions, webView: Webview) {
    const {
        jsFiles,
        cssFiles,
        body,
        scripts,
        styles,
        bodyCss
    } = options;
    const externalScripts = jsFiles
        ? jsFiles.map(jsFile =>
            '<script charset="UTF-8" onload="loadedScript();" src="' + jsFile + '"></script>').join('\n')
        : '';
    const externalStyles = cssFiles
        ? cssFiles.map(cssFile =>
            '<link rel="stylesheet" type="text/css" href="' + cssFile + '" />').join('\n')
        : '';
    const fontDir = join(getComposerURI(webView), 'font');

    // in windows fontdir path contains \ as separator. css does not like this.
    const fontDirWithSeparatorReplaced = fontDir.split(sep).join("/");

    const isCodeServer = ballerinaExtInstance.getCodeServerContext().codeServerEnv;
    const resourceRoot = isCodeServer ? RESOURCES_CDN : getVSCodeResourceURI(getWebViewResourceRoot(), webView);

    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                ${externalStyles}
                <style>
                    /* use this class for loader that are shown until the module js is loaded */
                    .root-loader {
                        position: absolute;
                        color: rgba(150, 150, 150, 0.5);
                        left: calc(50% - 20px);
                        top: calc(50% - 20px);
                    }
                    @font-face {
                        font-family: "Droid Sans Mono";
                        src: url("${fontDirWithSeparatorReplaced}/DroidSansMono.ttf") format("truetype");
                        font-weight: normal;
                        font-style: normal;
                        font-stretch: normal;
                    }
                    .loader {
                        border: 4px solid #bec5f5;
                        border-top: 4px solid #5463dc;
                        border-radius: 50%;
                        width: 30px;
                        height: 30px;
                        animation: spin 1s linear infinite;
                        margin: auto;
                        margin-top: 20%;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    html {
                        overflow: scroll;
                    }
                    ${styles}
                </style>
            </head>
            
            <body class="${bodyCss}" style="background: #fff;">
                ${body}
                <script>
                    ${scripts}
                </script>
                <script charset="UTF-8" src="${resourceRoot}/jslibs/webviewCommons.js"></script>
                ${externalScripts}
            </body>
            </html>
        `;
}

function getComposerURI(webView: Webview): string {
    return getVSCodeResourceURI(join((ballerinaExtInstance.context as ExtensionContext).extensionPath, 'resources',
        'jslibs'), webView);
}

function getComposerCSSFiles(disableComDebug: boolean, devHost: string, webView: Webview): string[] {
    const filePath = join((ballerinaExtInstance.context as ExtensionContext).extensionPath, 'resources', 'jslibs', 'themes', 'ballerina-default.min.css');
    return [
        (devMode && !disableComDebug) ? join(devHost, 'themes', 'ballerina-default.min.css')
            : webView.asWebviewUri(Uri.file(filePath)).toString()
    ];
}

function getComposerJSFiles(componentName: string, disableComDebug: boolean, devHost: string, webView: Webview): string[] {
    const filePath = join((ballerinaExtInstance.context as ExtensionContext).extensionPath, 'resources', 'jslibs') + sep + componentName + '.js'; 
    return [
        (devMode && !disableComDebug) ? join(devHost, componentName + '.js')
            : webView.asWebviewUri(Uri.file(filePath)).toString(),
        devMode ? 'http://localhost:8097' : '' // For React Dev Tools
    ];
}

export function getComposerWebViewOptions(componentName: string, webView: Webview, { disableComDebug = false, devHost = process.env.COMPOSER_DEV_HOST as string } = {}): Partial<WebViewOptions> {
    return {
        cssFiles: getComposerCSSFiles(disableComDebug, devHost, webView),
        jsFiles: getComposerJSFiles(componentName, disableComDebug, devHost, webView)
    };
}
