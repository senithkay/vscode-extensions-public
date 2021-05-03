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
import { BallerinaExtension, ExecutorPosition, LANGUAGE } from '../core';
import {
    CancellationToken, CodeLens, CodeLensProvider, commands, debug, DebugConfiguration, Event, EventEmitter,
    ProviderResult, Range, TextDocument, Uri, window, workspace, WorkspaceFolder
} from 'vscode';
import { clearTerminal, PALETTE_COMMANDS } from '../project';
import fileUriToPath = require('file-uri-to-path');
import {
    CMP_EXECUTOR_CODELENS, sendTelemetryEvent, TM_EVENT_SOURCE_DEBUG_CODELENS, TM_EVENT_TEST_DEBUG_CODELENS
} from '../telemetry';
import { DEBUG_CONFIG, DEBUG_REQUEST } from '../debugger';

enum EXEC_POSITION_TYPE {
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

const SOURCE_DEBUG_COMMAND = "ballerina.source.debug";
const TEST_DEBUG_COMMAND = "ballerina.test.debug";
const FOCUS_DEBUG_CONSOLE_COMMAND = 'workbench.debug.action.focusRepl';

export class ExecutorCodeLensProvider implements CodeLensProvider {

    private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
    public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event;

    private ballerinaExtension: BallerinaExtension;

    constructor(extensionInstance: BallerinaExtension) {
        this.ballerinaExtension = extensionInstance;

        workspace.onDidChangeConfiguration(() => {
            this._onDidChangeCodeLenses.fire();
        });
        workspace.onDidOpenTextDocument(() => {
            this._onDidChangeCodeLenses.fire();
        });
        workspace.onDidChangeTextDocument(() => {
            this._onDidChangeCodeLenses.fire();
        });

        commands.registerCommand(SOURCE_DEBUG_COMMAND, async (...args: any[]) => {
            sendTelemetryEvent(this.ballerinaExtension, TM_EVENT_SOURCE_DEBUG_CODELENS, CMP_EXECUTOR_CODELENS);
            clearTerminal();
            commands.executeCommand(FOCUS_DEBUG_CONSOLE_COMMAND);
            startDebugging(window.activeTextEditor!.document.uri, false, this.ballerinaExtension.getBallerinaCmd(),
                this.ballerinaExtension.getBallerinaHome(), args);
        });

        commands.registerCommand(TEST_DEBUG_COMMAND, async (...args: any[]) => {
            sendTelemetryEvent(this.ballerinaExtension, TM_EVENT_TEST_DEBUG_CODELENS, CMP_EXECUTOR_CODELENS);
            clearTerminal();
            commands.executeCommand(FOCUS_DEBUG_CONSOLE_COMMAND);
            startDebugging(window.activeTextEditor!.document.uri, true, this.ballerinaExtension.getBallerinaCmd(),
                this.ballerinaExtension.getBallerinaHome(), args);
        });
    }

    provideCodeLenses(_document: TextDocument, _token: CancellationToken): ProviderResult<CodeLens[]> {
        let codeLenses: CodeLens[] = [];
        if (this.ballerinaExtension.langClient && window.activeTextEditor) {
            return this.getCodeLensList();
        }
        return codeLenses;
    }

    private async getCodeLensList() {
        let codeLenses: CodeLens[] = [];
        await this.ballerinaExtension.langClient!.getExecutorPositions({
            documentIdentifier: {
                uri: window.activeTextEditor!.document.uri.toString()
            }
        }).then(response => {
            if (response.executorPositions) {
                response.executorPositions.forEach(position => {
                    codeLenses.push(this.createCodeLens(position, EXEC_TYPE.RUN));
                    codeLenses.push(this.createCodeLens(position, EXEC_TYPE.DEBUG));
                });
            }
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
            command: execPosition.kind === EXEC_POSITION_TYPE.SOURCE ? (execType === EXEC_TYPE.RUN ? PALETTE_COMMANDS.RUN :
                SOURCE_DEBUG_COMMAND) : (execType === EXEC_TYPE.RUN ? PALETTE_COMMANDS.TEST : TEST_DEBUG_COMMAND),
            arguments: execPosition.kind === EXEC_POSITION_TYPE.SOURCE ? [] : (execType === EXEC_TYPE.RUN ?
                [EXEC_ARG.TESTS, execPosition.name] : [execPosition.name])
        };
        return codeLens;
    }
}

async function startDebugging(uri: Uri, testDebug: boolean, ballerinaCmd: string, ballerinaHome: string, args: any[])
    : Promise<boolean> {
    const workspaceFolder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(uri);
    const debugConfig: DebugConfiguration = await constructDebugConfig(testDebug, ballerinaCmd,
        ballerinaHome, args);
    return debug.startDebugging(workspaceFolder, debugConfig);
}

async function constructDebugConfig(testDebug: boolean, ballerinaCmd: string, ballerinaHome: string, args: any[])
    : Promise<DebugConfiguration> {

    const debugConfig: DebugConfiguration = {
        type: LANGUAGE.BALLERINA,
        name: testDebug ? DEBUG_CONFIG.TEST_DEBUG_NAME : DEBUG_CONFIG.SOURCE_DEBUG_NAME,
        request: DEBUG_REQUEST.LAUNCH,
        script: fileUriToPath(window.activeTextEditor!.document.uri.toString()),
        networkLogs: false,
        debugServer: '10001',
        debuggeePort: '5010',
        'ballerina.home': ballerinaHome,
        'ballerina.command': ballerinaCmd,
        debugTests: testDebug ? true : false,
        tests: testDebug ? args : []
    };
    return debugConfig;
}
