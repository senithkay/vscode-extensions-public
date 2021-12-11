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

import { Uri } from 'vscode';
import { getLibraryWebViewContent, WebViewOptions, getComposerWebViewOptions, isWindows } from '../utils';
import { sep } from "path";

export function render(filePath: Uri, startLine: number, startColumn: number): string {
    return renderDiagram(filePath, startLine, startColumn);
}

function renderDiagram(filePath: Uri, startLine: number, startColumn: number): string {

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

    let ballerinaFilePath = filePath.fsPath;
    if (isWindows()) {
        ballerinaFilePath = '/' + ballerinaFilePath.split(sep).join("/");
    }

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
            function updateFileContent(url, content) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'updateFileContent',
                        [url, content],
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
            function getPFSession() {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'getPFSession',
                        [],
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
            function handlePerfErrors(response) {
                return new Promise((resolve, _reject) => {
                    webViewRPCHandler.invokeRemoteMethod(
                        'handlePerfErrors',
                        [response],
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
            function drawDiagram({
                filePath,
                startLine,
                startColumn,
                lastUpdatedAt
            }) {
                try {
                    const options = {
                        target: document.getElementById("diagram"),
                        editorProps: {
                            langClient: getLangClient(),
                            filePath,
                            startLine,
                            startColumn,
                            getFileContent,
                            updateFileContent,
                            gotoSource,
                            getPFSession,
                            showPerformanceGraph,
                            handlePerfErrors,
                            showMessage,
                            lastUpdatedAt,
                            resolveMissingDependency,
                            resolveMissingDependencyByCodeAction,
                            runCommand
                        }
                    };
                    BLCEditor.renderDiagramEditor(options);
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
            webViewRPCHandler.addMethod("updateDiagram", (args) => {
                drawDiagram({
                    filePath: args[0].filePath,
                    startLine: args[0].startLine,
                    startColumn: args[0].startColumn,
                    lastUpdatedAt: (new Date()).toISOString()
                });
                return Promise.resolve({});
            });
            webViewRPCHandler.addMethod("updatePerformanceLabels", (args) => {
                BLCEditor.updatePerformanceLabels(args);
                return Promise.resolve({});
            });
            drawDiagram({
                filePath: ${JSON.stringify(ballerinaFilePath)},
                startLine: ${startLine},
                startColumn: ${startColumn},
                lastUpdatedAt: (new Date()).toISOString()
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
        ...getComposerWebViewOptions("BLCEditor"),
        body, scripts, styles, bodyCss
    };

    return getLibraryWebViewContent(webViewOptions);
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
