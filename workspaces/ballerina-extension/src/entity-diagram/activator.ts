/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import { ViewColumn, WebviewPanel, commands, window } from "vscode";
import { GetPersistERModelResponse } from "@wso2-enterprise/ballerina-languageclient";
import { PALETTE_COMMANDS } from "../project/cmds/cmd-runner";
import { BallerinaExtension, ExtendedLangClient } from "../core";
import { WebViewMethod, WebViewRPCHandler, getCommonWebViewOptions } from "../utils";
import { render } from "./renderer";

const COMPATIBILITY_MESSAGE = "Ballerina versions are not compatible. Update to 2201.6.0 or higher to use the feature.";

let diagramWebview: WebviewPanel | undefined;

export function activate(ballerinaExtInstance: BallerinaExtension) {
    const langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
    const designDiagramRenderer = commands.registerCommand(PALETTE_COMMANDS.SHOW_ENTITY_DIAGRAM, () => {
        if (isCompatible(ballerinaExtInstance.ballerinaVersion)) {
            showERDiagram(langClient);
        } else {
            window.showErrorMessage(COMPATIBILITY_MESSAGE);
        }
    });
    ballerinaExtInstance.context.subscriptions.push(designDiagramRenderer);
}

function showERDiagram(langClient: ExtendedLangClient) {
    if (!diagramWebview) {
        setupWebviewPanel(langClient);
    }

    if (diagramWebview) {
        const html = render(diagramWebview.webview);
        if (html) {
            diagramWebview.webview.html = html;
            return;
        }
    }
    window.showErrorMessage("Error: Failed to generate the ER diagram.");
}

function setupWebviewPanel(langClient: ExtendedLangClient) {
    diagramWebview = window.createWebviewPanel(
        "persistERDiagram",
        "Entity Relationship Diagram",
        { viewColumn: ViewColumn.Beside, preserveFocus: false },
        getCommonWebViewOptions()
    );

    const remoteMethods: WebViewMethod[] = [
        {
            methodName: "getPersistERModel",
            handler: (): Promise<GetPersistERModelResponse> => {
                return langClient.getPersistERModel({
                    documentUri: window.activeTextEditor?.document.uri.fsPath
                });
            }
        }
    ];

    WebViewRPCHandler.create(diagramWebview, langClient, remoteMethods)

    diagramWebview.onDidDispose(() => {
        diagramWebview = undefined;
    });
}

function isCompatible(ballerinaVersion: string) {
    return parseFloat(ballerinaVersion) >= 2201.6;
}
