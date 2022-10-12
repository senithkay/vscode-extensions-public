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

import { Uri, ExtensionContext, WebviewOptions, WebviewPanelOptions } from "vscode";
import { join, sep } from "path";
import { ballerinaExtInstance } from "../core";

export const RESOURCES_CDN = `https://choreo-shared-codeserver-cdne.azureedge.net/ballerina-low-code-resources@${process.env.BALLERINA_LOW_CODE_RESOURCES_VERSION}`;

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

function getVSCodeResourceURI(filePath: string): string {
    return `vscode-resource:${filePath}`;
}

export interface WebViewOptions {
    jsFiles?: string[];
    cssFiles?: string[];
    body: string;
    scripts: string;
    styles: string;
    bodyCss?: string;
}

export function getLibraryWebViewContent(options: WebViewOptions) {
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
    const fontDir = join(getComposerURI(), 'font');

    // in windows fontdir path contains \ as separator. css does not like this.
    const fontDirWithSeparatorReplaced = fontDir.split(sep).join("/");

    const isCodeServer = ballerinaExtInstance.getCodeServerContext().codeServerEnv;
    const resourceRoot = isCodeServer ? RESOURCES_CDN : getVSCodeResourceURI(getWebViewResourceRoot());
    const whatFixUrl = process.env.BALLERINA_DEV_CENTRAL || process.env.BALLERINA_STAGE_CENTRAL ?
        'https://whatfix.com/c9fb1d90-71f0-11ec-a69b-2a8342861064/embed/embed.nocache.js' :
        'https://cdn.whatfix.com/prod/c9fb1d90-71f0-11ec-a69b-2a8342861064/embed/embed.nocache.js';
    const whatFix = isCodeServer ?
        `<script language='javascript' async='true' type='text/javascript' src='${whatFixUrl}'></script>` : '';

    // const sentryScript = isCodeServer ?
    //     `<script>
    //     window.SENTRY_SDK = {
    //     url: "https://cdn.ravenjs.com/3.26.4/raven.min.js",
    //     dsn: "https://42f7b8a64c79469f8dd38f75c176681e@o350818.ingest.sentry.io/6250789",
    //     options: {
    //         release: "3.12.0",
    //         environment: "${process.env.VSCODE_CHOREO_SENTRY_ENV}"
    //     },
    //     };
    //     (function(a, b, g, e, h) {
    //     var k = a.SENTRY_SDK,
    //         f = function(a) {
    //         f.data.push(a);
    //         };
    //     f.data = [];
    //     var l = a[e];
    //     a[e] = function(c, b, e, d, h) {
    //         f({ e: [].slice.call(arguments) });
    //         l && l.apply(a, arguments);
    //     };
    //     var m = a[h];
    //     a[h] = function(c) {
    //         f({ p: c.reason });
    //         m && m.apply(a, arguments);
    //     };
    //     var n = b.getElementsByTagName(g)[0];
    //     b = b.createElement(g);
    //     b.src = k.url;
    //     b.crossorigin = "anonymous";
    //     b.addEventListener("load", function() {
    //         try {
    //         a[e] = l;
    //         a[h] = m;
    //         var c = f.data,
    //             b = a.Raven;
    //         b.config(k.dsn, k.options).install();
    //         var g = a[e];
    //         if (c.length)
    //             for (var d = 0; d < c.length; d++)
    //             c[d].e
    //                 ? g.apply(b.TraceKit, c[d].e)
    //                 : c[d].p && b.captureException(c[d].p);
    //         } catch (p) {
    //         console.log(p);
    //         }
    //     });
    //     n.parentNode.insertBefore(b, n);
    //     })(window, document, "script", "onerror", "onunhandledrejection");
    // </script>` : '';

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
                ${whatFix}
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

function getComposerURI(): string {
    return getVSCodeResourceURI(join((ballerinaExtInstance.context as ExtensionContext).extensionPath, 'resources',
        'jslibs'));
}

export function getComposerPath(disableComDebug: boolean): string {
    return (process.env.COMPOSER_DEBUG === "true" && !disableComDebug)
        ? process.env.COMPOSER_DEV_HOST as string
        : getComposerURI();
}

function getComposerJSFiles(componentName: string, disableComDebug: boolean): string[] {
    const isCodeServer = ballerinaExtInstance.getCodeServerContext().codeServerEnv;
    return [
        isCodeServer ? (`${RESOURCES_CDN}/jslibs/${componentName}.js`) : join(getComposerPath(disableComDebug), componentName + '.js'),
        process.env.COMPOSER_DEBUG === "true" ? 'http://localhost:8097' : '' // For React Dev Tools
    ];
}

export function getComposerWebViewOptions(componentName: string, disableComDebug: boolean = false): Partial<WebViewOptions> {
    return {
        cssFiles: [],
        jsFiles: getComposerJSFiles(componentName, disableComDebug)
    };
}
