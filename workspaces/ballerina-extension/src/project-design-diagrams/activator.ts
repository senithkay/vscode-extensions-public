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

import { commands, ViewColumn, WebviewPanel, window, workspace } from "vscode";
import { decimal } from "vscode-languageclient";
import { debounce } from "lodash";
import { Project } from "@wso2-enterprise/choreo-core";
import { BallerinaExtension, ExtendedLangClient } from "../core";
import { getCommonWebViewOptions, WebViewMethod, WebViewRPCHandler } from "../utils";
import { render } from "./renderer";
import { ERROR_MESSAGE, INCOMPATIBLE_VERSIONS_MESSAGE, USER_TIP, BallerinaVersion, ComponentModel } from "./resources";
import { getComponentModel, EditLayerRPC, checkIsChoreoProject, getActiveChoreoProject, showChoreoProjectOverview } from "./utils";
import { PALETTE_COMMANDS } from "../project/activator";

let extInstance: BallerinaExtension;
let langClient: ExtendedLangClient;
let designDiagramWebview: WebviewPanel | undefined;
let balVersion: BallerinaVersion;
let isChoreoProject: boolean;
let activeChoreoProject: Project | undefined;

export interface STResponse {
    syntaxTree: any;
    parseSuccess: boolean;
    source: string;
}

export function activate(ballerinaExtInstance: BallerinaExtension) {
    extInstance = ballerinaExtInstance;
    langClient = <ExtendedLangClient>extInstance.langClient;
    const designDiagramRenderer = commands.registerCommand(PALETTE_COMMANDS.SHOW_ARCHITECTURE_VIEW, async (selectedNodeId = "") => {
        await viewProjectDesignDiagrams(selectedNodeId);
    });

    extInstance.context.subscriptions.push(designDiagramRenderer);
}

async function viewProjectDesignDiagrams(selectedNodeId: string) {
    await setupWebviewPanel();

    if (designDiagramWebview) {
        const html = render(designDiagramWebview.webview, isChoreoProject, selectedNodeId);
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

async function setupWebviewPanel() {
    if (designDiagramWebview) {
        designDiagramWebview.reveal();
    } else {
        designDiagramWebview = window.createWebviewPanel(
            "architectureView",
            "Architecture View",
            { viewColumn: ViewColumn.One, preserveFocus: false },
            getCommonWebViewOptions()
        );

        const refreshDiagram = debounce(() => {
            if (designDiagramWebview) {
                designDiagramWebview.webview.postMessage({ command: "refresh" });
            }
        }, 500);

        workspace.onDidChangeTextDocument(refreshDiagram);
        workspace.onDidChangeWorkspaceFolders(refreshDiagram);

        const remoteMethods: WebViewMethod[] = [
            {
                methodName: "getComponentModel",
                handler: (): Promise<Map<string, ComponentModel>> => {
                    return getComponentModel(langClient);
                }
            },
            {
                methodName: "showChoreoProjectOverview",
                handler: async (): Promise<void> => {
                    if (isChoreoProject && !activeChoreoProject) {
                        activeChoreoProject = await getActiveChoreoProject();
                    }
                    return showChoreoProjectOverview(activeChoreoProject);
                }
            }
        ];
        WebViewRPCHandler.create(designDiagramWebview, langClient, remoteMethods);

        isChoreoProject = await checkIsChoreoProject();
        EditLayerRPC.create(designDiagramWebview, langClient, isChoreoProject);

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
    };
}
