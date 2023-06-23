/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { commands, ViewColumn, Webview, WebviewPanel, window, workspace } from "vscode";
import { decimal } from "vscode-languageclient";
import { debounce } from "lodash";
import { Project } from "@wso2-enterprise/choreo-core";
import { render, WebViewOptions } from "./renderer";
import { ERROR_MESSAGE, INCOMPATIBLE_VERSIONS_MESSAGE, USER_TIP, BallerinaVersion, GLOBAL_STATE_FLAG } from "./resources";
import {
    EditLayerRPC, checkIsChoreoProject} from "./utils";
import { PALETTE_COMMANDS } from "./commands";

let extInstance: any;
let langClient: any;
let designDiagramWebview: WebviewPanel | undefined;
let balVersion: BallerinaVersion;
let isChoreoProject: boolean;
let activeChoreoProject: Project | undefined;
let getWebViewOptions: any
let getWebViewContent: any;

export interface STResponse {
    syntaxTree: any;
    parseSuccess: boolean;
    source: string;
}

export function activate(ballerinaExtInstance: any, getWebViewOptionsFunction: any, getWebViewContentFunction: (componentName: string, webView: Webview, options: WebViewOptions) => any) {
    extInstance = ballerinaExtInstance;
    langClient = extInstance.langClient;
    getWebViewOptions = getWebViewOptionsFunction;
    getWebViewContent = getWebViewContentFunction;

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

export function getLangClient() {
    return langClient;
}

async function viewProjectDesignDiagrams(selectedNodeId: string) {
    await setupWebviewPanel();

    if (designDiagramWebview) {
        const html = render(designDiagramWebview.webview, isChoreoProject, selectedNodeId, getWebViewContent);
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
            getWebViewOptions()
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

        isChoreoProject = await checkIsChoreoProject();
        EditLayerRPC.create(designDiagramWebview, langClient, extInstance.context, isChoreoProject, activeChoreoProject);

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

