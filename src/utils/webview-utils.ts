import { Uri, ExtensionContext, WebviewOptions, WebviewPanelOptions } from "vscode";
import { join, sep } from "path";
import { ballerinaExtInstance } from "../core";

export function getWebViewResourceRoot(): string {
    return join((ballerinaExtInstance.context as ExtensionContext).extensionPath,
        'resources');
}

export function getNodeModulesRoot(): string {
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

export function getVSCodeResourceURI(filePath: string): string {
    return process.platform === 'win32' ? 'vscode-resource:/' + filePath : 'vscode-resource:' + filePath;
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
    const resourceRoot = getVSCodeResourceURI(getWebViewResourceRoot());
    const nodeModulesRoot = getVSCodeResourceURI(getNodeModulesRoot());
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
                    ${styles}
                </style>
            </head>
            
            <body class="${bodyCss}">
                ${body}
                <script>
                    ${scripts}
                </script>
                <script charset="UTF-8" src="${nodeModulesRoot}/mousetrap/mousetrap.min.js"></script>
                <script charset="UTF-8" src="${resourceRoot}/utils/messaging.js"></script>
                <script charset="UTF-8" src="${resourceRoot}/utils/undo-redo.js"></script>
                ${externalScripts}
            </body>
            </html>
        `;
}

export function getComposerURI(): string {
    return getVSCodeResourceURI(join((ballerinaExtInstance.context as ExtensionContext).extensionPath, 'resources', 'jslibs'));
}

export function getComposerPath(): string {
    return process.env.COMPOSER_DEBUG === "true"
        ? process.env.COMPOSER_DEV_HOST as string
        : getComposerURI();
}

export function getComposerJSFiles(isAPIEditor: boolean = false): string[] {
    return [
        join(getComposerURI(), 'codepoints.js'),
        join(getComposerPath(), isAPIEditor ? 'apiEditor.js' : 'composer.js'),
        process.env.COMPOSER_DEBUG === "true" ? 'http://localhost:8097' : '' // For React Dev Tools
    ];
}

export function getComposerCSSFiles(): string[] {
    return [
        join(getComposerPath(), 'themes', 'ballerina-default.min.css'),
        join(getComposerURI(), 'font', 'font-ballerina.css')
    ];
}

export function getComposerWebViewOptions(): Partial<WebViewOptions> {
    return {
        jsFiles: getComposerJSFiles(),
        cssFiles: getComposerCSSFiles()
    };
}
