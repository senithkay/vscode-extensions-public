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
import { GetComponentModelResponse } from "@wso2-enterprise/ballerina-languageclient";
import { BallerinaExtension, ExtendedLangClient } from "../core";
import { getCommonWebViewOptions, WebViewMethod, WebViewRPCHandler } from "../utils";
import { render } from "./renderer";
import { ERROR_MESSAGE, INCOMPATIBLE_VERSIONS_MESSAGE, USER_TIP, BallerinaVersion, GLOBAL_STATE_FLAG } from "./resources";
import {
    getComponentModel, EditLayerRPC, checkIsChoreoProject, deleteProjectComponent, getActiveChoreoProject, showChoreoProjectOverview
} from "./utils";
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
        if (isCompatible(2201.2, 2)) {
            await viewProjectDesignDiagrams(selectedNodeId);
        } else {
            window.showErrorMessage(INCOMPATIBLE_VERSIONS_MESSAGE);
            return;
        }
    });

    commands.registerCommand(PALETTE_COMMANDS.REFRESH_SHOW_ARCHITECTURE_VIEW, async () => {
        if (designDiagramWebview) {
            designDiagramWebview.webview.postMessage({ command: "refresh" });
        }
    });

    extInstance.context.subscriptions.push(designDiagramRenderer);

    if (extInstance.context.globalState.get(GLOBAL_STATE_FLAG) === true && workspace.workspaceFile) {
        commands.executeCommand(PALETTE_COMMANDS.SHOW_ARCHITECTURE_VIEW);
        extInstance.context.globalState.update(GLOBAL_STATE_FLAG, false);
    }
}

export function getLangClient(): ExtendedLangClient {
    return langClient;
}

async function viewProjectDesignDiagrams(selectedNodeId: string) {
    await setupWebviewPanel();

    if (designDiagramWebview) {
        const html = render(designDiagramWebview.webview, isChoreoProject, selectedNodeId);
        if (html) {
            designDiagramWebview.webview.html = html;
        }
        if (workspace.workspaceFolders?.length === 1 && !isChoreoProject) {
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

        let shouldUpdateDiagram: boolean = false;
        const handleDocumentChanges = () => {
            if (designDiagramWebview && !designDiagramWebview.active) {
                shouldUpdateDiagram = true;
            }
        };

        const refreshDiagram = debounce(() => {
            if (designDiagramWebview) {
                designDiagramWebview.webview.postMessage({ command: "refresh" });
            }
        }, 500);

        designDiagramWebview.onDidChangeViewState(() => {
            if (designDiagramWebview && designDiagramWebview.active && shouldUpdateDiagram) {
                refreshDiagram();
                shouldUpdateDiagram = false;
            }
        });

        workspace.onDidChangeTextDocument(handleDocumentChanges);
        workspace.onDidChangeWorkspaceFolders(refreshDiagram);

        const remoteMethods: WebViewMethod[] = [
            {
                methodName: "getComponentModel",
                handler: (): Promise<GetComponentModelResponse> => {
                    return getComponentModel(langClient, isChoreoProject);
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
            },
            {
                methodName: "deleteComponent",
                handler: async (args: any[]): Promise<void> => {
                    if (isChoreoProject && !activeChoreoProject) {
                        activeChoreoProject = await getActiveChoreoProject();
                    }
                    return deleteProjectComponent(isChoreoProject ? activeChoreoProject.id : undefined, args[0], args[1]);
                }
            }
        ];
        WebViewRPCHandler.create(designDiagramWebview, langClient, remoteMethods);

        isChoreoProject = await checkIsChoreoProject();
        EditLayerRPC.create(designDiagramWebview, langClient, extInstance.context, isChoreoProject);

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

export function disposeDiagramWebview() {
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
