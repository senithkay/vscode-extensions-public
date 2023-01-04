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

import { commands, ExtensionContext, Position, Range, Selection, TextEditorRevealType, ViewColumn, WebviewPanel, window, workspace } from "vscode";
import { decimal } from "vscode-languageclient";
import { existsSync } from "fs";
import { join } from "path";
import { debounce } from "lodash";
import { BallerinaExtension } from "../core/extension";
import { ExtendedLangClient } from "../core/extended-language-client";
import { getCommonWebViewOptions } from "../utils/webview-utils";
import { render } from "./renderer";
import { BallerinaVersion, ComponentModel, DIAGNOSTICS_WARNING, Location, ERROR_MESSAGE, INCOMPATIBLE_VERSIONS_MESSAGE, USER_TIP } from "./resources";
import { WebViewMethod, WebViewRPCHandler } from "../utils";

let extInstance: BallerinaExtension;
let langClient: ExtendedLangClient;
let designDiagramWebview: WebviewPanel | undefined;
let balVersion: BallerinaVersion;

export function activate(ballerinaExtInstance: BallerinaExtension) {
    extInstance = ballerinaExtInstance;
    langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
    let context: ExtensionContext = <ExtensionContext>ballerinaExtInstance.context;
    const designDiagramRenderer = commands.registerCommand("ballerina.view.ProjectDesigns", () => {
        ballerinaExtInstance.onReady()
            .then(() => {
                if (isCompatible(2201.2, 2)) {
                    viewProjectDesignDiagrams();
                } else {
                    window.showErrorMessage(INCOMPATIBLE_VERSIONS_MESSAGE);
                    return;
                }
            })
            .catch((error) => {
                console.log(`${ERROR_MESSAGE}: ${error}`);
                ballerinaExtInstance.showPluginActivationError();
            });
    });

    context.subscriptions.push(designDiagramRenderer);
}

function viewProjectDesignDiagrams() {
    setupWebviewPanel();

    if (designDiagramWebview) {
        const html = render(designDiagramWebview.webview);
        if (html) {
            designDiagramWebview.webview.html = html;
        }
        if (workspace.workspaceFolders && workspace.workspaceFolders.length === 1) {
            window.showInformationMessage(USER_TIP);
        }
    } else {
        terminateActivation(ERROR_MESSAGE);
    }
}

async function getProjectResources(): Promise<Map<string, ComponentModel>> {
    return new Promise((resolve, reject) => {
        let ballerinaFiles: string[] = [];
        let workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders !== undefined) {
            workspaceFolders.forEach(folder => {
                const isBalProject = existsSync(join(folder.uri.fsPath, "Ballerina.toml"));
                if (isBalProject) {
                    ballerinaFiles.push(join(folder.uri.fsPath, "Ballerina.toml"))
                }
            });
        } else {
            workspace.textDocuments.forEach(file => {
                ballerinaFiles.push(file.uri.fsPath);
            });
        }

        langClient.getPackageComponentModels({
            documentUris: ballerinaFiles
        }).then((response) => {
            const packageModels: Map<string, ComponentModel> = new Map(Object.entries(response.componentModels));
            for (let [_key, packageModel] of packageModels) {
                if (packageModel.hasCompilationErrors) {
                    window.showInformationMessage(DIAGNOSTICS_WARNING);
                    break;
                }
            }
            resolve(response.componentModels);
        }).catch((error) => {
            reject(error);
            terminateActivation(ERROR_MESSAGE);
        });
    });
}

function setupWebviewPanel() {
    if (designDiagramWebview) {
        designDiagramWebview.reveal();
    } else {
        designDiagramWebview = window.createWebviewPanel(
            "ballerinaProjectDesign",
            "Ballerina Project Design",
            { viewColumn: ViewColumn.One, preserveFocus: false },
            getCommonWebViewOptions()
        );

        workspace.onDidChangeTextDocument(debounce(() => {
            if (designDiagramWebview) {
                designDiagramWebview.webview.postMessage({ command: "refresh" });
            }
        }, 500))

        designDiagramWebview.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case "go2source": {
                    const location: Location = message.location;
                    if (location && existsSync(location.filePath)) {
                        workspace.openTextDocument(location.filePath).then((sourceFile) => {
                            window.showTextDocument(sourceFile, { preview: false }).then((textEditor) => {
                                const startPosition: Position = new Position(location.startPosition.line, location.startPosition.offset);
                                const endPosition: Position = new Position(location.endPosition.line, location.endPosition.offset);
                                const range: Range = new Range(startPosition, endPosition);
                                textEditor.revealRange(range, TextEditorRevealType.InCenter);
                                textEditor.selection = new Selection(range.start, range.start);
                            })
                        })
                    }
                    return;
                }
            }
        });

        designDiagramWebview.onDidDispose(() => {
            designDiagramWebview = undefined;
        });

        const remoteMethods: WebViewMethod[] = [
            {
                methodName: "fetchProjectResources",
                handler: (): Promise<Map<string, ComponentModel>> => {
                    return getProjectResources();
                }
            }
        ];

        WebViewRPCHandler.create(designDiagramWebview, langClient, remoteMethods);
    }
}

function terminateActivation(message: string) {
    window.showErrorMessage(message);
    if (designDiagramWebview) {
        designDiagramWebview.dispose();
    }
}

function isCompatible(majorVersion: decimal, patchVersion: number): boolean {
    if (!balVersion) {
        getVersion();
    }

    if (balVersion.majorVersion > majorVersion ||
        (balVersion.majorVersion === majorVersion && balVersion.patchVersion >= patchVersion)) {
        return true;
    } else {
        return false;
    }
}

function getVersion() {
    const version: string = extInstance.ballerinaVersion;

    balVersion = {
        majorVersion: parseFloat(version),
        patchVersion: parseInt(version.substring(version.lastIndexOf(".") + 1))
    }
}
