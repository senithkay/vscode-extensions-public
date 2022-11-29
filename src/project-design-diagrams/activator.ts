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

import { commands, ExtensionContext, OpenDialogOptions, ProgressLocation, ViewColumn, WebviewPanel, window, workspace } from "vscode";
import { decimal } from "vscode-languageclient";
import { randomUUID } from "crypto";
import { existsSync } from "fs";
import path, { join } from "path";
import { debounce } from "lodash";
import { BallerinaExtension } from "../core/extension";
import { ExtendedLangClient } from "../core/extended-language-client";
import { getCommonWebViewOptions } from "../utils/webview-utils";
import { render } from "./renderer";
import { AddComponentDetails, ComponentModel, ERROR_MESSAGE, INCOMPATIBLE_VERSIONS_MESSAGE, USER_TIP } from "./resources";
import { WebViewMethod, WebViewRPCHandler } from "../utils";
import { createTerminal } from "../project";
import { addToWorkspace, getCurrenDirectoryPath } from "../utils/project-utils";
import { runCommand } from "../testing/runner";

let context: ExtensionContext;
let langClient: ExtendedLangClient;
let designDiagramWebview: WebviewPanel | undefined;

const directoryPickOptions: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: 'Select',
    canSelectFiles: false,
    canSelectFolders: true
};

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
                    createService (args[0]);
                    return Promise.resolve(true);
                }
            },
            {
                methodName: "pickDirectory",
                handler: async (): Promise<string | undefined> => {
                    return window.showOpenDialog(directoryPickOptions).then(fileUri => {
                        if (fileUri && fileUri[0]) {
                            return fileUri[0].fsPath;
                        }
                    });
                }
            },
            {
                methodName: "getProjectRoot",
                handler: async (): Promise<string | undefined> => {
                    const workspaceFolders = workspace.workspaceFolders;
                    if (workspaceFolders && workspaceFolders?.length > 0) {
                        let parentCandidate = path.parse(workspaceFolders[0].uri.fsPath).dir;
                        workspaceFolders.forEach((workspaceFolder) => {
                            const relative = path.relative(parentCandidate, workspaceFolder.uri.fsPath);
                            const isSubdir = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
                            if (!isSubdir) {
                                const parsedPath = path.parse(workspaceFolder.uri.fsPath);
                                if (parsedPath.dir !== parentCandidate) {
                                    parentCandidate = path.parse(parentCandidate).dir
                                }
                            }
                        });
                        return parentCandidate;
                    }
                    return undefined;
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

function createService(componentDetail: AddComponentDetails) {
    const { directory: parentDirPath, package: packageName, name, version, organization: orgName } = componentDetail;

    window.withProgress({
        location: ProgressLocation.Window,
        title: "Creating service...",
        cancellable: false
    }, async (progress) => {
        progress.report({ increment: 0, message: "Starting to create the service..."});
        // Run commands spawning a child process
        const res = await runCommand('pwd', parentDirPath);
        progress.report({ increment: 10, message: `Opened the workspace folder at ${res}` });
        // Create the package
        await runCommand(`bal new ${packageName} -t service`, parentDirPath);
        progress.report({ increment: 40, message: `Created the package ${packageName} in the workspace folder` });
        // Change toml conf
        await runCommand(`sed -i '' -e 's/org = \"[a-z,A-Z,0-9,_]\\{1,\\}\"/org = "${orgName}"/g' Ballerina.toml`,
            join(parentDirPath, packageName));
        progress.report({ increment: 50, message: `Configured organization ${orgName} in package ${packageName}` });
        await runCommand(`sed -i '' -e 's/org = \"[a-z,A-Z,0-9,_]\\{1,\\}\"/org = "${orgName}"/g' Ballerina.toml`,
            join(parentDirPath, packageName));
        progress.report({ increment: 50, message: `Configured organization ${orgName} in package ${packageName}` });
        await runCommand(`sed -i '' -e 's/version = \"[0-9].[0-9].[0-9]\"/org = "${version}"/g' Ballerina.toml`, join(parentDirPath, packageName));
        progress.report({ increment: 60, message: `Configured version ${version} in package ${packageName}` });
        // Add Display annotation
        await runCommand(`sed -i '' -e 's/service \\/ on new http:Listener(9090) {/@display {\\n\\tlabel: \"${name}\",\\n\\tid: \"${name}-${randomUUID()}\"\\n}\\nservice \\/ on new http:Listener(9090) {/g' service.bal`,
            join(parentDirPath, packageName));
        progress.report({ increment: 70, message: `Added service annotation to the service` });
        // Add the created service package to the current workspace
        addToWorkspace(join(parentDirPath, packageName));
        progress.report({ increment: 100, message: `Added the service to the current workspace` });
    });
}
