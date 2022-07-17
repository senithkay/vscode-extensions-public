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

import { debug, DebugAdapterTracker, DebugAdapterTrackerFactory, DebugConfiguration, DebugSession, NotebookCell, NotebookCellKind, NotebookDocument, NotebookRange, ProviderResult, Uri, window, workspace, WorkspaceFolder } from "vscode";
import fileUriToPath from "file-uri-to-path";
import { mkdtempSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { basename, join } from "path";
import { DebugProtocol } from "vscode-debugprotocol";
import { BallerinaExtension, LANGUAGE } from "../core";
import { DEBUG_REQUEST } from "../debugger";
import { BAL_NOTEBOOK } from "./constants";
import { getSmallerMax } from "./utils";

let tmpDirectory: string;
let tmpFile: string;
let debugCellInfoHandler: DebugCellInfoHandler;

export class NotebookDebuggerController {

    constructor(private extensionInstance: BallerinaExtension) { }

    async startDebugging(): Promise<boolean> {
        let activeTextEditorUri = window.activeTextEditor!.document.uri;
        if (activeTextEditorUri.scheme === 'vscode-notebook-cell') {
            const balnotebook = workspace.notebookDocuments.find(nb => nb.uri.fsPath === activeTextEditorUri.fsPath);
            const sourceIndex = parseInt(activeTextEditorUri.fragment.replace("ch", ""));
            // const filename = activeTextEditorUri.fsPath;
            // tmpFile = `${filename.substring(0, filename.length - BAL_NOTEBOOK.length)}.bal`;
            const filename = basename(activeTextEditorUri.fsPath);
            tmpFile = `${getTempDir()}/${filename.substring(0, filename.length - BAL_NOTEBOOK.length)}.bal`;
            balnotebook && this.dumpNotebookCell(sourceIndex, balnotebook);
            activeTextEditorUri = Uri.parse(tmpFile);
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

    dumpNotebookCell(sourceIndex: number, balnotebook: NotebookDocument) {
        debugCellInfoHandler = new DebugCellInfoHandler(balnotebook.cellAt(sourceIndex))
        const cells = balnotebook.getCells(new NotebookRange(0, sourceIndex + 1));
        let contentToWrite = "";
        let nextLineToWrite = 0;
        // TODO: create content according to meta info
        cells.forEach(cell => {
            if (cell.kind === NotebookCellKind.Code && cell.executionSummary?.success) {
                contentToWrite += sourceIndex === cell.index
                    ? "public function main() {" + cell.document.getText() + "\n}"
                    : cell.document.getText() + "\n";
                debugCellInfoHandler.addLineToCell(nextLineToWrite, cell);
                nextLineToWrite += cell.document.lineCount;
            }
        });
        writeFileSync(tmpFile, contentToWrite);
    }
}

export class BallerinaDebugAdapterTrackerFactory implements DebugAdapterTrackerFactory {
    createDebugAdapterTracker(session: DebugSession): ProviderResult<DebugAdapterTracker> {
        return {

            onWillReceiveMessage: (message: DebugProtocol.ProtocolMessage) => {
                // VS Code -> Debug Adapter
                this.visitSources(message, (source, breakpoints) => {
                    if (source?.path?.startsWith("vscode-notebook-cell")) {
                        breakpoints && breakpoints.forEach(breakpoint => {
                            breakpoint.line += debugCellInfoHandler.getCellStartLine(source.path!);
                        });
                        source.path = tmpFile;
                    }
                });
            },

            onDidSendMessage: (message: DebugProtocol.ProtocolMessage) => {
                // Debug Adapter -> VS Code
                this.visitSources(message, (source, breakpoints) => {
                    breakpoints && breakpoints.forEach(breakpoint => {
                        const {cell, line} = debugCellInfoHandler.getCellForLine(breakpoint.line!);
                        if (cell) {
                            source.path = cell.document.uri.toString();
                            source.name = basename(cell.document.uri.fsPath);
                            // append cell index to name
                            const cellIndex = cell.index;
                            if (cellIndex >= 0) {
                                source.name += `, Cell ${cellIndex + 1}`;
                            }
                            breakpoint.line -= line;
                        }
                    });
                });
            }
        }
    }

    visitSources(msg: DebugProtocol.ProtocolMessage, visitor: (source: DebugProtocol.Source, breakPoints?: DebugProtocol.SourceBreakpoint[] | DebugProtocol.Breakpoint[]) => void): void {

        const visit = (source: DebugProtocol.Source | undefined, breakPoints?: DebugProtocol.SourceBreakpoint[] | DebugProtocol.Breakpoint[]) => {
            if (source) {
                breakPoints ? visitor(source, breakPoints) : visitor(source);
            }
        }

        switch (msg.type) {
            case 'event':
                const event = <DebugProtocol.Event>msg;
                switch (event.event) {
                    case 'output':
                        visit((<DebugProtocol.OutputEvent>event).body.source);
                        break;
                    case 'breakpoint':
                        const breakpointEvent = <DebugProtocol.BreakpointEvent>event;
                        visit(breakpointEvent.body.breakpoint.source, [breakpointEvent.body.breakpoint]);
                        break;
                    default:
                        break;
                }
                break;
            case 'request':
                const request = <DebugProtocol.Request>msg;
                switch (request.command) {
                    case 'setBreakpoints':
                        const setBreakpointsArguments = (<DebugProtocol.SetBreakpointsArguments>request.arguments)
                        visit(setBreakpointsArguments.source, setBreakpointsArguments.breakpoints);
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
                    default:
                        break;
                }
                break;
            case 'response':
                const response = <DebugProtocol.Response>msg;
                if (response.success && response.body) {
                    switch (response.command) {
                        case 'stackTrace':
                            (<DebugProtocol.StackTraceResponse>response).body.stackFrames.forEach(frame => visit(frame.source));//frame.line
                            break;
                        case 'setFunctionBreakpoints':
                            (<DebugProtocol.SetFunctionBreakpointsResponse>response).body.breakpoints.forEach(bp => visit(bp.source));
                            break;
                        case 'setBreakpoints':
                            (<DebugProtocol.SetBreakpointsResponse>response).body.breakpoints.forEach(bp => visit(bp.source, [bp]));
                            break;
                        default:
                            break;
                    }
                }
                break;
        }
    }
}

class DebugCellInfoHandler {
    private lineToCell: Map<number, NotebookCell>;

    constructor(private currentCell: NotebookCell) {
        this.lineToCell = new Map();
    }

    addLineToCell(lineNumber: number, cell: NotebookCell) {
        this.lineToCell.set(lineNumber, cell);
    }

    getDebugRanCell() {
        return this.currentCell;
    }

    getCellForLine(lineNumber: number) {
        const line = getSmallerMax(Array.from(this.lineToCell.keys()), lineNumber);
        return line ? { line, cell: this.lineToCell.get(line)! } : { line: lineNumber, cell: this.currentCell };
    }

    getCellStartLine(path: string) {
        for (const [line, cell] of this.lineToCell.entries()) {
            if (path === cell.document.uri.toString()) {
                return line;
            }
        }
        return 0;
    }
}

export function getTempDir(): string {
    if (!tmpDirectory) {
        tmpDirectory = mkdtempSync(join(tmpdir(), 'ballerina-notebook-'));
    }
    return tmpDirectory;
}

export function getTempFile(): string {
    return tmpFile;
}
