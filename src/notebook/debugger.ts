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

import { debug, DebugAdapterTracker, DebugAdapterTrackerFactory, DebugConfiguration, DebugSession, NotebookCell, ProviderResult, Uri, window, workspace, WorkspaceFolder } from "vscode";
import fileUriToPath from "file-uri-to-path";
import { mkdtempSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { basename, join } from "path";
import { BallerinaExtension, LANGUAGE } from "../core";
import { DEBUG_REQUEST } from "../debugger";
import { DebugProtocol } from "vscode-debugprotocol";

let tmpDirectory: string;
let pathToCell: Map<string, NotebookCell> = new Map();

export class NotebookDebuggerController {

    constructor(private extensionInstance: BallerinaExtension) { }

    async startDebugging(): Promise<boolean> {
        let activeTextEditorUri = window.activeTextEditor!.document.uri;
        if (activeTextEditorUri.scheme === 'vscode-notebook-cell') {
            const uri = `${getTempDir()}/notebook_cell_${activeTextEditorUri.fragment}.bal`;
            activeTextEditorUri = Uri.parse(uri);
        } else {
            return Promise.reject();
        }
        const workspaceFolder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(activeTextEditorUri);
        const debugConfig: DebugConfiguration = await this.constructDebugConfig(activeTextEditorUri);
        return debug.startDebugging(workspaceFolder, debugConfig);
    }

    async constructDebugConfig(uri: Uri): Promise<DebugConfiguration> {
        const debugConfig: DebugConfiguration = {
            type: LANGUAGE.BALLERINA,
            name: "Ballerina Notebook Debug",
            request: DEBUG_REQUEST.LAUNCH,
            script: fileUriToPath(uri.toString()),
            networkLogs: false,
            debugServer: 4711,
            'ballerina.home': this.extensionInstance.getBallerinaHome(),
            'ballerina.command': this.extensionInstance.getBallerinaCmd(),
            debugTests: false,
            tests: [],
            configEnv: undefined,
            capabilities: { supportsReadOnlyEditors: true }
        };
        return debugConfig;
    }
}

export class BallerinaDebugAdapterTrackerFactory implements DebugAdapterTrackerFactory {
    createDebugAdapterTracker(session: DebugSession): ProviderResult<DebugAdapterTracker> {
        return {
            onWillReceiveMessage: (message: DebugProtocol.ProtocolMessage) => {
                // VS Code -> Debug Adapter
                visitSources(message, source => {
                    if (source?.name?.endsWith(".balnotebook") && source?.path?.startsWith("vscode-notebook-cell")) {
                        const cellPath = `${getTempDir()}/notebook_cell_${source.path.split(".balnotebook#")[1]}.bal`;
                        if (cellPath) {
                            source.path = cellPath;
                        }
                    }
                });
            },
            onDidSendMessage: (message: DebugProtocol.ProtocolMessage) => {
                // Debug Adapter -> VS Code
                visitSources(message, source => {
                    if (source?.path) {
                        let cell = getCellForCellPath(source.path);
                        if (cell) {
                            source.path = cell.document.uri.toString();
                            source.name = basename(cell.document.uri.fsPath);
                            // append cell index to name
                            const cellIndex = cell.index;
                            if (cellIndex >= 0) {
                                source.name += `, Cell ${cellIndex + 1}`;
                            }
                        }
                    }
                });
            }
        }
    }

}

export function getTempDir(): string {
    if (!tmpDirectory) {
        tmpDirectory = mkdtempSync(join(tmpdir(), 'ballerina-notebook-'));
    }
    return tmpDirectory;
}

export function dumpCell(cell: NotebookCell): string | undefined {
    try {
        const cellPath = `${getTempDir()}/notebook_cell_${cell.document.uri.fragment}.bal`;
        pathToCell.set(cellPath, cell);

        let data = "public function main() {" + cell.document.getText();
        data += `\n}\n//@ sourceURL=${cellPath}`;
        writeFileSync(cellPath, data);

        return cellPath;
    } catch (e) { }
    return undefined;
}

export function getCellForCellPath(path: string): NotebookCell | undefined {
    return pathToCell.get(path.replaceAll("file://", ""));
}

export function getCellContent(cellPath: string): string {
    return "public function main() {" + pathToCell.get(cellPath)?.document.getText()
        + `\n}\n//@ sourceURL=${cellPath}` ?? "";
}

function visitSources(msg: DebugProtocol.ProtocolMessage, visitor: (source: DebugProtocol.Source) => void): void {

    const visit = (source: DebugProtocol.Source | undefined) => {
        if (source) {
            visitor(source);
        }
    }
    
    switch (msg.type) {
        case 'event':
            const event = <DebugProtocol.Event>msg;
            switch (event.event) {
                case 'output':
                    visit((<DebugProtocol.OutputEvent>event).body.source);
                    break;
                case 'loadedSource':
                    visit((<DebugProtocol.LoadedSourceEvent>event).body.source);
                    break;
                case 'breakpoint':
                    visit((<DebugProtocol.BreakpointEvent>event).body.breakpoint.source);
                    break;
                default:
                    break;
            }
            break;
        case 'request':
            const request = <DebugProtocol.Request>msg;
            switch (request.command) {
                case 'setBreakpoints':
                    visit((<DebugProtocol.SetBreakpointsArguments>request.arguments).source);
                    break;
                case 'breakpointLocations':
                    visit((<DebugProtocol.BreakpointLocationsArguments>request.arguments).source);
                    break;
                case 'source':
                    visit((<DebugProtocol.SourceArguments>request.arguments).source);
                    break;
                case 'gotoTargets':
                    visit((<DebugProtocol.GotoTargetsArguments>request.arguments).source);
                    break;
                case 'launchVSCode':
                    //request.arguments.args.forEach(arg => fixSourcePath(arg));
                    break;
                default:
                    break;
            }
            break;
        case 'response':
            const response = <DebugProtocol.Response>msg;
            if (response.success && response.body) {
                switch (response.command) {
                    case 'stackTrace':
                        (<DebugProtocol.StackTraceResponse>response).body.stackFrames.forEach(frame => visit(frame.source));
                        break;
                    case 'loadedSources':
                        (<DebugProtocol.LoadedSourcesResponse>response).body.sources.forEach(source => visit(source));
                        break;
                    case 'scopes':
                        (<DebugProtocol.ScopesResponse>response).body.scopes.forEach(scope => visit(scope.source));
                        break;
                    case 'setFunctionBreakpoints':
                        (<DebugProtocol.SetFunctionBreakpointsResponse>response).body.breakpoints.forEach(bp => visit(bp.source));
                        break;
                    case 'setBreakpoints':
                        (<DebugProtocol.SetBreakpointsResponse>response).body.breakpoints.forEach(bp => visit(bp.source));
                        break;
                    default:
                        break;
                }
            }
            break;
    }
}
