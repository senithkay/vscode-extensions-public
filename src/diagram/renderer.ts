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

import { Uri, Webview, workspace } from 'vscode';
import { getLibraryWebViewContent, WebViewOptions, getComposerWebViewOptions } from '../utils';
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { DiagramFocus } from './model';

export function render(
    filePath: Uri, startLine: number, startColumn: number, experimental: boolean,
    openInDiagram: NodePosition, webView: Webview, diagramFocus?: DiagramFocus): string {

    return renderDiagram(filePath, startLine, startColumn, experimental, openInDiagram, webView, diagramFocus);
}

function renderDiagram(
    filePath: Uri, startLine: number, startColumn: number, experimental: boolean,
    openInDiagram: NodePosition, webView: Webview, diagramFocus?: DiagramFocus): string {
    console.log('workspace name', workspace.name);
    const body = `
        <div class="ballerina-editor design-view-container" id="diagram"><div class="loader" /></div>
    `;

    const bodyCss = "diagram";

    const styles = `
        body {
            background: #f1f1f1;
        }
        .overlay {
            display: none;
        }
        .drop-zone.rect {
            fill-opacity: 0;
        }
        #diagram {
            height: 100%;
            display: inline-block;
            width: 100%;
            background-color: #f8f9fb;
        }
        #errors {
            display: table;
            width: 100%;
            height: 100%;
        }
        #errors span { 
            display: table-cell;
            vertical-align: middle;
            text-align: center;
        }
        #warning {
            position: absolute;
            top: 15px;
            position: absolute;
            overflow: hidden;
            height: 25px;
            vertical-align: bottom;
            text-align: center;
            color: rgb(255, 90, 30);
            width: 100%;
        }
        #warning p {
            line-height: 25px;
        }
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

    let ballerinaFilePath = diagramFocus?.fileUri;

    const scripts = `
        function loadedScript() {
            window.langclient = getLangClient();
            function getFileContent(url) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'getFileContent',
                        [url],
                        (resp) => {
                            resolve(resp);
                        }
                    );
                })
            }
            function updateFileContent(url, content, skipForceSave) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'updateFileContent',
                        [url, content, skipForceSave],
                        (resp) => {
                            resolve(resp);
                        }
                    );
                })
            }
            function gotoSource(filePath, position) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'gotoSource',
                        [filePath, position],
                        (response) => {
                            resolve(response);
                        }
                    );
                })
            }
            function showPerformanceGraph(file, data) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'showPerformanceGraph',
                        [file, data],
                        (response) => {
                            resolve(response);
                        }
                    );
                })
            }
            function getPerfDataFromChoreo(data, analyzeType) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'getPerfDataFromChoreo',
                        [data, analyzeType],
                        (response) => {
                            resolve(response);
                        }
                    );
                })
            }
            function resolveMissingDependency(filePath, fileContent) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'resolveMissingDependency',
                        [filePath, fileContent],
                        (response) => {
                            resolve(response);
                        }
                    );
                });
            }
            function resolveMissingDependencyByCodeAction(filePath, fileContent, diagnostic) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'resolveMissingDependencyByCodeAction',
                        [filePath, fileContent, diagnostic],
                        (response) => {
                            resolve(response);
                        }
                    );
                });
            }
            function showMessage(message, type, isIgnorable, filePath, fileContent) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'showMessage',
                        [message, type, isIgnorable, filePath, fileContent],
                        (response) => {
                            resolve(response);
                        }
                    );
                })
            }
            function runCommand(command, args) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'runCommand',
                        [command, args],
                        (response) => {
                            resolve(response);
                        }
                    );
                })
            }
            function runBackgroundTerminalCommand(command, args) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'runBackgroundTerminalCommand',
                        [command, args],
                        (response) => {
                            resolve(response);
                        }
                    );
                })
            }
            function openExternalUrl(command, args) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'openExternalUrl',
                        [command, args],
                        (response) => {
                            resolve(response);
                        }
                    );
                })
            }
            function sendTelemetryEvent(args) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'sendTelemetryEvent',
                        [args],
                        (response) => {
                            resolve(response);
                        }
                    );
                })
            }
            function getEnv(env) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'getEnv',
                        [env],
                        (response) => {
                            resolve(response);
                        }
                    );
                })
            }
            function drawDiagram({
                filePath,
                startLine,
                startColumn,
                lastUpdatedAt,
                experimentalEnabled,
                openInDiagram,
                projectPaths,
                diagramFocus,
                workspaceName
            }) {
                try {
                    const options = {
                        target: document.getElementById("diagram"),
                        editorProps: {
                            langClientPromise: Promise.resolve(getLangClient()),
                            filePath,
                            projectPaths,
                            startLine,
                            startColumn,
                            getFileContent,
                            updateFileContent,
                            gotoSource,
                            showPerformanceGraph,
                            getPerfDataFromChoreo,
                            showMessage,
                            lastUpdatedAt,
                            resolveMissingDependency,
                            resolveMissingDependencyByCodeAction,
                            runCommand,
                            runBackgroundTerminalCommand,
                            openExternalUrl,
                            sendTelemetryEvent,
                            getLibrariesList,
                            getLibrariesData,
                            getLibraryData,
                            getSentryConfig,
                            getBallerinaVersion,
                            getEnv,                           
                            experimentalEnabled,
                            openInDiagram,
                            diagramFocus,
                            workspaceName
                        }
                    };

                    BLCEditor.renderOverviewDiagram(options);
                } catch(e) {
                    if (e.message === 'ballerinaComposer is not defined') {
                        drawLoading();
                        return;
                    }
                    console.log(e.stack);
                    drawError('Oops. Something went wrong. ' + e.message);
                }
            }
            function drawError(message) {
                document.getElementById("diagram").innerHTML = \`
                <div id="errors">
                    <span>\$\{message\}</span>
                </div>
                \`;
            }
            function drawLoading() {
                document.getElementById("diagram").innerHTML = \`
                <div class="loader"></div>
                \`;
            }
            function getLibrariesList(kind) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'getLibrariesList',
                        [kind],
                        (resp) => {
                            resolve(resp);
                        }
                    );
                })
            }
            function getLibrariesData() {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'getLibrariesData',
                        [],
                        (resp) => {
                            resolve(resp);
                        }
                    );
                })
            }
            function getSentryConfig() {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'getSentryConfig',
                        [],
                        (resp) => {
                            resolve(resp);
                        }
                    );
                })
            }
            function getBallerinaVersion() {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'getBallerinaVersion',
                        [],
                        (resp) => {
                            resolve(resp);
                        }
                    );
                })
            }
            function getLibraryData(orgName, moduleName, version) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'getLibraryData',
                        [orgName, moduleName, version],
                        (resp) => {
                            resolve(resp);
                        }
                    );
                })
            }
            webViewRPCHandler.addMethod("updateDiagram", (args) => {
                drawDiagram({
                    filePath: args[0].filePath,
                    startLine: args[0].startLine,
                    startColumn: args[0].startColumn,
                    lastUpdatedAt: (new Date()).toISOString(),
                    experimentalEnabled: ${experimental},
                    openInDiagram: args[0].openInDiagram,
                    projectPaths: ${JSON.stringify(workspace.workspaceFolders)},
                    diagramFocus: args[0].filePath && args[0].openInDiagram ? {
                        filePath: args[0].filePath,
                        position: args[0].openInDiagram
                    }: undefined,
                    workspaceName: ${JSON.stringify(workspace.name)}
                });
                return Promise.resolve({});
            });
            webViewRPCHandler.addMethod("updatePerfPath", (args) => {
                BLCEditor.updatePerfPath(args);
                return Promise.resolve({});
            });
            drawDiagram({
                filePath: ${JSON.stringify(ballerinaFilePath)},
                startLine: ${startLine},
                startColumn: ${startColumn},
                lastUpdatedAt: (new Date()).toISOString(),
                experimentalEnabled: ${experimental},
                openInDiagram: ${JSON.stringify(openInDiagram)},
                projectPaths: ${JSON.stringify(workspace.workspaceFolders)},
                diagramFocus: ${
                    diagramFocus ?
                        `{
                            filePath: ${JSON.stringify(ballerinaFilePath)},
                            position: ${JSON.stringify(openInDiagram)}
                        }`
                        : `undefined`
                },
                workspaceName: ${JSON.stringify(workspace.name)}
            });

            window.addEventListener('focus', event => {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'focusDiagram',
                        [],
                        (response) => {
                                resolve(response);
                        }
                    );
                });
            });
        }
    `;

    const webViewOptions: WebViewOptions = {
        ...getComposerWebViewOptions("BLCEditor", webView),
        body, scripts, styles, bodyCss
    };

    return getLibraryWebViewContent(webViewOptions, webView);
}

export function renderError() {
    return `
    <!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
    <div>
        Could not connect to the parser service. Please try again after restarting vscode.
        <a href="command:workbench.action.reloadWindow">Restart</a>
    </div>
    </body>
    </html>
    `;
}
