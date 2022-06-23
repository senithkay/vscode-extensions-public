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

import { Uri, ExtensionContext, WebviewOptions, WebviewPanelOptions, WebviewPanel } from "vscode";
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
    webViewPanel?: WebviewPanel;
    extensionUri?: Uri;
}

export function getLibraryWebViewContent(options: WebViewOptions) {
    const {
        jsFiles,
        cssFiles,
        body,
        scripts,
        styles,
        bodyCss,
        webViewPanel,
        extensionUri
    } = options;
    const externalScripts = jsFiles
        ? jsFiles.map(jsFile =>
            '<script charset="UTF-8" onload="loadedScript();" src="' + jsFile + '"></script>').join('\n')
        : '';
    const externalStyles = cssFiles
        ? cssFiles.map(cssFile =>
            '<link rel="stylesheet" type="text/css" href="' + cssFile + '" />').join('\n')
        : '';
    let codicons;
    if (webViewPanel && extensionUri) {
        const codiconsUri = webViewPanel.webview.asWebviewUri(
            Uri.joinPath(extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));
        codicons = `<link href="${codiconsUri}" rel="stylesheet" />`;
    }

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

    const vwoScript = isCodeServer ? `<!-- Start VWO Async SmartCode -->
    <script type='text/javascript'>
    window._vwo_code = window._vwo_code || (function(){
    var account_id=547899,
    settings_tolerance=2000,
    library_tolerance=2500,
    use_existing_jquery=false,
    is_spa=1,
    hide_element='body',
    
    /* DO NOT EDIT BELOW THIS LINE */
    f=false,d=document,code={use_existing_jquery:function(){return use_existing_jquery;},library_tolerance:function(){return library_tolerance;},finish:function(){if(!f){f=true;var a=d.getElementById('_vis_opt_path_hides');if(a)a.parentNode.removeChild(a);}},finished:function(){return f;},load:function(a){var b=d.createElement('script');b.src=a;b.type='text/javascript';b.innerText;b.onerror=function(){_vwo_code.finish();};d.getElementsByTagName('head')[0].appendChild(b);},init:function(){
    window.settings_timer=setTimeout(function () {_vwo_code.finish() },settings_tolerance);var a=d.createElement('style'),b=hide_element?hide_element+'{opacity:0 !important;filter:alpha(opacity=0) !important;background:none !important;}':'',h=d.getElementsByTagName('head')[0];a.setAttribute('id','_vis_opt_path_hides');a.setAttribute('type','text/css');if(a.styleSheet)a.styleSheet.cssText=b;else a.appendChild(d.createTextNode(b));h.appendChild(a);this.load('https://dev.visualwebsiteoptimizer.com/j.php?a='+account_id+'&u='+encodeURIComponent(d.URL)+'&f='+(+is_spa)+'&r='+Math.random());return settings_timer; }};window._vwo_settings_timer = code.init(); return code; }());
    </script>
    <!-- End VWO Async SmartCode -->` : '';

    const sentryScript = isCodeServer ?
        `<script>
        window.SENTRY_SDK = {
        url: "https://cdn.ravenjs.com/3.26.4/raven.min.js",
        dsn: "https://42f7b8a64c79469f8dd38f75c176681e@o350818.ingest.sentry.io/6250789",
        options: {
            release: "3.12.0",
            environment: "${process.env.VSCODE_CHOREO_SENTRY_ENV}"
        },
        };
        (function(a, b, g, e, h) {
        var k = a.SENTRY_SDK,
            f = function(a) {
            f.data.push(a);
            };
        f.data = [];
        var l = a[e];
        a[e] = function(c, b, e, d, h) {
            f({ e: [].slice.call(arguments) });
            l && l.apply(a, arguments);
        };
        var m = a[h];
        a[h] = function(c) {
            f({ p: c.reason });
            m && m.apply(a, arguments);
        };
        var n = b.getElementsByTagName(g)[0];
        b = b.createElement(g);
        b.src = k.url;
        b.crossorigin = "anonymous";
        b.addEventListener("load", function() {
            try {
            a[e] = l;
            a[h] = m;
            var c = f.data,
                b = a.Raven;
            b.config(k.dsn, k.options).install();
            var g = a[e];
            if (c.length)
                for (var d = 0; d < c.length; d++)
                c[d].e
                    ? g.apply(b.TraceKit, c[d].e)
                    : c[d].p && b.captureException(c[d].p);
            } catch (p) {
            console.log(p);
            }
        });
        n.parentNode.insertBefore(b, n);
        })(window, document, "script", "onerror", "onunhandledrejection");
    </script>` : '';

    const hotJarConfig = (isCodeServer && process.env.VSCODE_HOTJAR_ID) ?
    ` <script>
        (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:"${process.env.VSCODE_HOTJAR_ID}",hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        window.hj('identify', "${process?.env?.VSCODE_CHOREO_USER_IDP_ID}", { 
            isWSO2User: "${process?.env?.VSCODE_CHOREO_USER_EMAIL?.endsWith('@wso2.com')}",
            AnonymousUser: "${process?.env?.VSCODE_CHOREO_USER_EMAIL?.endsWith('@choreo.dev')}",
            origin: "low-code"
        });
    </script>` : '';

    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                ${externalStyles}
                ${codicons}
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
                        overflow: hidden !important;
                    }
                    ${styles}
                </style>
                ${hotJarConfig}
                ${whatFix}
                ${vwoScript}
                ${sentryScript}
            </head>
            
            <body class="${bodyCss}">
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

export function getComposerPath(): string {
    return process.env.COMPOSER_DEBUG === "true"
        ? process.env.COMPOSER_DEV_HOST as string
        : getComposerURI();
}

function getComposerCSSFiles(): string[] {
    const isCodeServer = ballerinaExtInstance.getCodeServerContext().codeServerEnv;
    return [
        isCodeServer ? (`${RESOURCES_CDN}/jslibs/themes/ballerina-default.min.css`) : join(getComposerPath(), 'themes', 'ballerina-default.min.css')
    ];
}

function getComposerJSFiles(componentName: string): string[] {
    const isCodeServer = ballerinaExtInstance.getCodeServerContext().codeServerEnv;
    return [
        isCodeServer ? (`${RESOURCES_CDN}/jslibs/${componentName}.js`) : join(getComposerPath(), componentName + '.js'),
        process.env.COMPOSER_DEBUG === "true" ? 'http://localhost:8097' : '' // For React Dev Tools
    ];
}

export function getComposerWebViewOptions(componentName: string): Partial<WebViewOptions> {
    return {
        cssFiles: getComposerCSSFiles(),
        jsFiles: getComposerJSFiles(componentName)
    };
}
