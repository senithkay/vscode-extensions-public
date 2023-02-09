/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { BallerinaExtension, ExecutorPosition, ExecutorPositionsResponse, ExtendedLangClient, LANGUAGE } from '../core';
import {
    CancellationToken, CodeLens, CodeLensProvider, commands, debug, DebugConfiguration, Event, EventEmitter,
    ProviderResult, Range, TextDocument, Uri, window, workspace, WorkspaceFolder
} from 'vscode';
import { BAL_TOML, clearTerminal, PALETTE_COMMANDS } from '../project';
import fileUriToPath from 'file-uri-to-path';
import {
    CMP_EXECUTOR_CODELENS, sendTelemetryEvent, TM_EVENT_SOURCE_DEBUG_CODELENS, TM_EVENT_TEST_DEBUG_CODELENS
} from '../telemetry';
import { DEBUG_CONFIG, DEBUG_REQUEST } from '../debugger';
import { openConfigEditor } from '../config-editor/configEditorPanel';
import { Position } from '../forecaster';
import { GetSyntaxTreeResponse } from '@wso2-enterprise/ballerina-low-code-edtior-commons';

export enum EXEC_POSITION_TYPE {
    SOURCE = 'source',
    TEST = 'test'
}

enum EXEC_TYPE {
    RUN = 'Run',
    DEBUG = 'Debug'
}

enum EXEC_ARG {
    TESTS = '--tests'
}

export const INTERNAL_DEBUG_COMMAND = "ballerina.internal.debug";

const SOURCE_DEBUG_COMMAND = "ballerina.source.debug";
const TEST_DEBUG_COMMAND = "ballerina.test.debug";
const FOCUS_DEBUG_CONSOLE_COMMAND = 'workbench.debug.action.focusRepl';

export class ExecutorCodeLensProvider implements CodeLensProvider {

    private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
    public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event;
    private activeTextEditorUri: Uri | undefined;

    private ballerinaExtension: BallerinaExtension;

    constructor(extensionInstance: BallerinaExtension) {
        this.ballerinaExtension = extensionInstance;

        workspace.onDidOpenTextDocument((document) => {
            if (document.languageId === LANGUAGE.BALLERINA || document.fileName.endsWith(BAL_TOML)) {
                this._onDidChangeCodeLenses.fire();
            }
        });

        workspace.onDidChangeTextDocument((activatedTextEditor) => {
            if (activatedTextEditor && activatedTextEditor.document.languageId === LANGUAGE.BALLERINA ||
                activatedTextEditor.document.fileName.endsWith(BAL_TOML)) {
                this._onDidChangeCodeLenses.fire();
            }
        });

        commands.registerCommand(INTERNAL_DEBUG_COMMAND, async (args: any) => {
            sendTelemetryEvent(this.ballerinaExtension, TM_EVENT_SOURCE_DEBUG_CODELENS, CMP_EXECUTOR_CODELENS);
            clearTerminal();
            commands.executeCommand(FOCUS_DEBUG_CONSOLE_COMMAND);
            startDebugging(this.activeTextEditorUri!, false, this.ballerinaExtension.getBallerinaCmd(),
                this.ballerinaExtension.getBallerinaHome(), args);
        });

        commands.registerCommand(SOURCE_DEBUG_COMMAND, async () => {
            this.activeTextEditorUri = window.activeTextEditor!.document.uri;
            if (!this.ballerinaExtension.isConfigurableEditorEnabled() &&
                !this.ballerinaExtension.getDocumentContext().isActiveDiagram()) {
                commands.executeCommand(INTERNAL_DEBUG_COMMAND);
                return;
            }
            openConfigEditor(this.ballerinaExtension, window.activeTextEditor!.document.uri.fsPath, true);
        });

        commands.registerCommand(TEST_DEBUG_COMMAND, async (...args: any[]) => {
            sendTelemetryEvent(this.ballerinaExtension, TM_EVENT_TEST_DEBUG_CODELENS, CMP_EXECUTOR_CODELENS);
            clearTerminal();
            commands.executeCommand(FOCUS_DEBUG_CONSOLE_COMMAND);
            startDebugging(window.activeTextEditor!.document.uri, true, this.ballerinaExtension.getBallerinaCmd(),
                this.ballerinaExtension.getBallerinaHome(), args);
        });
    }

    provideCodeLenses(_document: TextDocument, _token: CancellationToken): ProviderResult<any[]> {
        if (this.ballerinaExtension.langClient && (window.activeTextEditor || this.activeTextEditorUri)) {
            return this.getCodeLensList();
        }
        return [];
    }

    private async getCodeLensList(): Promise<CodeLens[]> {
        let codeLenses: CodeLens[] = [];
        let langClient: ExtendedLangClient | undefined = this.ballerinaExtension.langClient;

        if (!langClient) {
            return codeLenses;
        }

        await langClient.onReady().then(async () => {
            const activeEditorUri = this.activeTextEditorUri ? this.activeTextEditorUri
                : window.activeTextEditor!.document.uri;
            const fileUri = activeEditorUri.toString();
            await langClient!.getExecutorPositions({
                documentIdentifier: {
                    uri: fileUri
                }
            }).then(executorsResponse => {
                const response = executorsResponse as ExecutorPositionsResponse;
                if (response.executorPositions) {
                    response.executorPositions.forEach(position => {
                        codeLenses.push(this.createCodeLens(position, EXEC_TYPE.RUN));
                        codeLenses.push(this.createCodeLens(position, EXEC_TYPE.DEBUG));

                        if (position.kind == 'source' && position.name != 'main') {
                            const codeLens = new CodeLens(new Range(position.range.startLine.line, 0, position.range.endLine.line, 0));
                            const range: Position = {
                                startLine: position.range.startLine.line, startColumn: position.range.startLine.offset,
                                endLine: position.range.endLine.line, endColumn: position.range.endLine.offset
                            };
                            codeLens.command = {
                                title: "Try it",
                                tooltip: "Try running this service",
                                command: PALETTE_COMMANDS.TRY_IT,
                                arguments: [fileUri, position.name, range]
                            };
                            codeLenses.push(codeLens);
                        }
                    });
                }
            }, _error => {
                return codeLenses;
            });

            // Open in diagram code lenses
            await langClient!.getSyntaxTree({
                documentIdentifier: {
                    uri: fileUri
                }
            }).then(syntaxTreeResponse => {
                const response = syntaxTreeResponse as GetSyntaxTreeResponse;
                if (response.parseSuccess && response.syntaxTree) {
                    const syntaxTree = response.syntaxTree;

                    syntaxTree.members.forEach(member => {
                        if (member.kind === 'FunctionDefinition') {
                            const functionBody = member.functionBody;
                            if (functionBody.kind === 'ExpressionFunctionBody') {
                                const position = functionBody.position;
                                const codeLens = new CodeLens(new Range(position.startLine, 0, position.endLine, 0));
                                codeLens.command = {
                                    title: "Design",
                                    tooltip: "Open this code block in data mapping view",
                                    command: PALETTE_COMMANDS.OPEN_IN_DIAGRAM,
                                    arguments: [member.position, activeEditorUri.fsPath]
                                };
                                codeLenses.push(codeLens);
                            }
                        }
                    });
                }

            });

        });
        return codeLenses;
    }

    private createCodeLens(execPosition: ExecutorPosition, execType: EXEC_TYPE): CodeLens {
        const startLine = execPosition.range.startLine.line;
        const startColumn = execPosition.range.startLine.offset;
        const endLine = execPosition.range.endLine.line;
        const endColumn = execPosition.range.endLine.offset;
        const codeLens = new CodeLens(new Range(startLine, startColumn, endLine, endColumn));
        codeLens.command = {
            title: execType.toString(),
            tooltip: `${execType.toString()} ${execPosition.name}`,
            command: execPosition.kind === EXEC_POSITION_TYPE.SOURCE ? (execType === EXEC_TYPE.RUN ?
                PALETTE_COMMANDS.RUN : SOURCE_DEBUG_COMMAND) : (execType === EXEC_TYPE.RUN ? PALETTE_COMMANDS.TEST :
                    TEST_DEBUG_COMMAND),
            arguments: execPosition.kind === EXEC_POSITION_TYPE.SOURCE ? [] : (execType === EXEC_TYPE.RUN ?
                [EXEC_ARG.TESTS, execPosition.name] : [execPosition.name])
        };
        return codeLens;
    }
}

async function startDebugging(uri: Uri, testDebug: boolean, ballerinaCmd: string, ballerinaHome: string, args: any[])
    : Promise<boolean> {
    const workspaceFolder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(uri);
    const debugConfig: DebugConfiguration = await constructDebugConfig(uri, testDebug, ballerinaCmd,
        ballerinaHome, args);
    return debug.startDebugging(workspaceFolder, debugConfig);
}

async function constructDebugConfig(uri: Uri, testDebug: boolean, ballerinaCmd: string, ballerinaHome: string,
    args: any): Promise<DebugConfiguration> {

    let programArgs = [];
    let commandOptions = [];
    let env = {};
    const debugConfigs: DebugConfiguration[] = workspace.getConfiguration(DEBUG_REQUEST.LAUNCH).configurations;
    if (debugConfigs.length > 0) {
        let debugConfig: DebugConfiguration | undefined;
        for (let i = 0; i < debugConfigs.length; i++) {
            if ((testDebug && debugConfigs[i].name == DEBUG_CONFIG.TEST_DEBUG_NAME) ||
                (!testDebug && debugConfigs[i].name == DEBUG_CONFIG.SOURCE_DEBUG_NAME)) {
                debugConfig = debugConfigs[i];
                break;
            }
        }
        if (debugConfig) {
            if (debugConfig.programArgs) {
                programArgs = debugConfig.programArgs;
            }
            if (debugConfig.commandOptions) {
                commandOptions = debugConfig.commandOptions;
            }
            if (debugConfig.env) {
                env = debugConfig.env;
            }
        }
    }

    const debugConfig: DebugConfiguration = {
        type: LANGUAGE.BALLERINA,
        name: testDebug ? DEBUG_CONFIG.TEST_DEBUG_NAME : DEBUG_CONFIG.SOURCE_DEBUG_NAME,
        request: DEBUG_REQUEST.LAUNCH,
        script: fileUriToPath(uri.toString()),
        networkLogs: false,
        debugServer: '10001',
        debuggeePort: '5010',
        'ballerina.home': ballerinaHome,
        'ballerina.command': ballerinaCmd,
        debugTests: testDebug,
        tests: testDebug ? args : [],
        configEnv: !testDebug ? args : undefined,
        programArgs,
        commandOptions,
        env,
        capabilities: { supportsReadOnlyEditors: true }
    };
    return debugConfig;
}
