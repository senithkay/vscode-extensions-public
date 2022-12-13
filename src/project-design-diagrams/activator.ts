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

import { commands, ExtensionContext, OpenDialogOptions, ProgressLocation, Position, Range, Selection, TextEditorRevealType, ViewColumn, WebviewPanel, window, workspace } from "vscode";
import { decimal } from "vscode-languageclient";
import { randomUUID } from "crypto";
import { existsSync, readFile, writeFile } from "fs";
import path, { join } from "path";
import { debounce } from "lodash";
import { BallerinaExtension, ExtendedLangClient } from "../core";
import { getCommonWebViewOptions } from "../utils/webview-utils";
import { render } from "./renderer";
import { AddComponentDetails, ComponentModel, Location, ERROR_MESSAGE, INCOMPATIBLE_VERSIONS_MESSAGE, Service, USER_TIP } from "./resources";
import { WebViewMethod, WebViewRPCHandler } from "../utils";
import { createTerminal } from "../project";
import { addToWorkspace, getCurrenDirectoryPath } from "../utils/project-utils";
import { runCommand } from "../testing/runner";
import { addConnector } from "./code-generator";

let context: ExtensionContext;
let langClient: ExtendedLangClient;
let designDiagramWebview: WebviewPanel | undefined;

export interface STResponse {
    syntaxTree: any;
    parseSuccess: boolean;
    source: string;
}

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
            injectDeploymentMetadata(new Map(Object.entries(response.componentModels)));
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
                handler: async (args: any[]): Promise<string> => {
                    return createService(args[0]);
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
            },
            {
                methodName: "addConnector",
                handler: async (args: any[]): Promise<boolean> => {
                    const sourceService: Service = args[0];
                    const targetService: Service = args[1];
                    return addConnector(langClient, sourceService, targetService);;
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

// For testing purposes
function injectDeploymentMetadata(components: Map<string, ComponentModel>) {
    components.forEach((component) => {
        const services: Map<string, Service> = new Map(Object.entries(component.services));
        services.forEach((service) => {
            service.deploymentMetadata = {
                gateways: {
                    internet: {
                        isExposed: Math.random() < 0.5
                    },
                    intranet: {
                        isExposed: Math.random() > 0.5
                    }
                }
            }
        })
    })
}

function createService(componentDetail: AddComponentDetails): Promise<string> {
    return new Promise((resolve) => {
        const { directory: parentDirPath, package: packageName, name, version, org: orgName } = componentDetail;
        let serviceId: string = "";

        window.withProgress({
            location: ProgressLocation.Window,
            title: "Creating service...",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: "Starting to create the service..." });
            // Run commands spawning a child process
            const res = await runCommand('pwd', parentDirPath, true);
            progress.report({ increment: 10, message: `Opened the workspace folder at ${res}` });
            // Create the package
            await runCommand(`bal new ${packageName} -t service`, parentDirPath);
            progress.report({ increment: 40, message: `Created the package ${packageName} in the workspace folder` });
            const newPkgRootPath = join(join(parentDirPath, packageName), 'Ballerina.toml');
            serviceId = `${name}-${randomUUID()}`;
            // Change toml conf
            readFile(newPkgRootPath, 'utf-8', function (err, contents) {
                if (err) {
                    progress.report({ increment: 50, message: `"Error while reading toml config " ${err}` });
                    return;
                }
                let replaced = contents.replace(/org = "[a-z,A-Z,0-9,_]+"/, `org = \"${orgName}\"`);
                replaced = replaced.replace(/version = "[0-9].[0-9].[0-9]"/, `version = "${version}"`);
                writeFile(newPkgRootPath, replaced, 'utf-8', function (err) {
                    progress.report({ increment: 50, message: `Configured toml file successfully` });
                });
            });
            progress.report({ increment: 60, message: `Configured version ${version} in package ${packageName}` });
            const newServicePath = join(join(parentDirPath, packageName), 'service.bal');
            // Add Display annotation
            readFile(newServicePath, 'utf-8', function (err, contents) {
                if (err) {
                    progress.report({ increment: 70, message: `"Error while reading service file " ${err}` });
                    return;
                }
                const replaced = contents.replace(/service \/ on new http:Listener\(9090\) \{/, `@display {\n\tlabel: "${name}",\n\tid: "${serviceId}"\n}\nservice \/ on new http:Listener(9090) {`);
                writeFile(newServicePath, replaced, 'utf-8', function (err) {
                    progress.report({ increment: 80, message: `Added service annotation successfully` });
                    return;
                });
            });
            addToWorkspace(join(parentDirPath, packageName));
            progress.report({ increment: 100, message: `Added the service to the current workspace` });
            return resolve(serviceId);
        });
    });
}
