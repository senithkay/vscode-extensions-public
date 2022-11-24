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

import { commands, ExtensionContext, ViewColumn, WebviewPanel, window, workspace } from "vscode";
import { decimal } from "vscode-languageclient";
import { existsSync } from "fs";
import { join } from "path";
import { debounce } from "lodash";
import { BallerinaExtension } from "../core/extension";
import { ExtendedLangClient } from "../core/extended-language-client";
import { getCommonWebViewOptions } from "../utils/webview-utils";
import { render } from "./renderer";
import { ComponentModel, ERROR_MESSAGE, INCOMPATIBLE_VERSIONS_MESSAGE, USER_TIP } from "./resources";
import { WebViewMethod, WebViewRPCHandler } from "../utils";
import { createTerminal, runTerminalCommand } from "../project";
import { getCurrenDirectoryPath } from "../utils/project-utils";
import { randomUUID } from "crypto";

let context: ExtensionContext;
let langClient: ExtendedLangClient;
let designDiagramWebview: WebviewPanel | undefined;

export function activate(ballerinaExtInstance: BallerinaExtension) {
    context = <ExtensionContext>ballerinaExtInstance.context;
    langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
    const designDiagramRenderer = commands.registerCommand("ballerina.view.ProjectDesigns", () => {
        ballerinaExtInstance.onReady()
            .then(() => {
                if (isCompatible(ballerinaExtInstance)) {
                    createTerminal(getCurrenDirectoryPath())
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

        designDiagramWebview.onDidDispose(() => {
            designDiagramWebview = undefined;
        });

        const remoteMethods: WebViewMethod[] = [
            {
                methodName: "fetchProjectResources",
                handler: (): Promise<Map<string, ComponentModel>> => {
                    return getProjectResources();
                }
            },
            {
                methodName: "createService",
                handler: async (args: any[]): Promise<boolean | undefined> => {
                    const packageName: string = args[0];
                    const org: string = args[1];
                    const version: string = args[2];
                    createService (packageName, org, version);
                    return Promise.resolve(true);
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

function createService(packageName: string, orgName?: string, version?: string) {
    runTerminalCommand(`bal new ${packageName} -t service`);
    runTerminalCommand(`echo created bal module in \"$PWD\"`);
    // Navigate to new package root
    runTerminalCommand(`cd ${packageName}`);
    // Change toml conf
    runTerminalCommand(`sed -i '' -e 's/org = \"[a-z,A-Z,0-9,_]\\{1,\\}\"/org = "${orgName}"/g' Ballerina.toml`);
    runTerminalCommand(`sed -i '' -e 's/version = \"[0-9].[0-9].[0-9]\"/org = "${version}"/g' Ballerina.toml`);
    // Add Display annotation
    runTerminalCommand(`sed -i '' -e 's/service \\/ on new http:Listener(9090) {/@display {\\n\\tlabel: \"GreetingService\",\\n\\tid: \"GreetingService-${randomUUID()}\"\\n}\\nservice \\/ on new http:Listener(9090) {/g' service.bal`);
    runTerminalCommand(`cd ../`);
}
