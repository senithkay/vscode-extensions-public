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
import { debounce } from "lodash";
import { BallerinaExtension, ExtendedLangClient } from "../core";
import { getCommonWebViewOptions } from "../utils/webview-utils";
import { render } from "./renderer";
import { Location, ERROR_MESSAGE, INCOMPATIBLE_VERSIONS_MESSAGE, USER_TIP } from "./resources";
import { ProjectDesignRPC } from "./utils";

let context: ExtensionContext;
let langClient: ExtendedLangClient;
let designDiagramWebview: WebviewPanel | undefined;

export interface STResponse {
    syntaxTree: any;
    parseSuccess: boolean;
    source: string;
}

export function activate(ballerinaExtInstance: BallerinaExtension) {
    context = <ExtensionContext>ballerinaExtInstance.context;
    langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
    const designDiagramRenderer = commands.registerCommand("ballerina.view.ProjectDesigns", () => {
        ballerinaExtInstance.onReady()
            .then(() => {
                if (isCompatible(ballerinaExtInstance)) {
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

        workspace.onDidChangeTextDocument(debounce(() => {
            if (designDiagramWebview) {
                designDiagramWebview.webview.postMessage({ command: "refresh" });
            }
        }, 500));

        ProjectDesignRPC.create(designDiagramWebview, langClient);

        designDiagramWebview.onDidDispose(() => {
            designDiagramWebview = undefined;
        });
    }
}

export function terminateActivation(message: string) {
    window.showErrorMessage(message);
    if (designDiagramWebview) {
        designDiagramWebview.dispose();
    }
}

function isCompatible(ballerinaExtInstance: BallerinaExtension): boolean {
    const balVersion: string = ballerinaExtInstance.ballerinaVersion;
    const majorVersion: decimal = parseFloat(balVersion);
    const patchVersion: number = parseInt(balVersion.substring(balVersion.lastIndexOf(".") + 1));

    if (majorVersion > 2201.2 || (majorVersion === 2201.2 && patchVersion >= 2)) {
        return true;
    } else {
        return false;
    }
}
