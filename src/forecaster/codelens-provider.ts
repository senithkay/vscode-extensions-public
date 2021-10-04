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

import { BallerinaExtension, ExtendedLangClient, LANGUAGE } from '../core';
import {
    CancellationToken, CodeLens, CodeLensProvider, Event, EventEmitter,
    ProviderResult, Range, TextDocument, window, workspace
} from 'vscode';
import { BAL_TOML } from '../project';
import { log } from '../utils';
import { DataLabel, FORECAST_PERFORMANCE_COMMAND as FORECAST_PERFORMANCE_COMMAND, SHOW_GRAPH_COMMAND } from './activator';

enum ANALYZE_TYPE {
    ADVANCED = "advanced",
}

enum CODELENSE_TYPE {
    ENDPOINT,
    INVOCATION
}

let langClient: ExtendedLangClient;

/**
 * Codelense provider for perforemence forecaster.
 */
export class ExecutorCodeLensProvider implements CodeLensProvider {

    private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
    public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event;

    static onDidChangeCodeLenses: any;
    private static dataLabels: DataLabel[] = [];

    constructor(extensionInstance: BallerinaExtension) {
        ExecutorCodeLensProvider.onDidChangeCodeLenses = this._onDidChangeCodeLenses;
        langClient = <ExtendedLangClient>extensionInstance.langClient;
        workspace.onDidOpenTextDocument((document) => {
            if (document.languageId === LANGUAGE.BALLERINA || document.fileName.endsWith(BAL_TOML)) {
                this._onDidChangeCodeLenses.fire();
            }
        });

        workspace.onDidChangeTextDocument((activatedTextEditor) => {
            if (activatedTextEditor && activatedTextEditor.document.languageId === LANGUAGE.BALLERINA ||
                activatedTextEditor.document.fileName.endsWith(BAL_TOML)) {
                ExecutorCodeLensProvider.dataLabels = [];
                this._onDidChangeCodeLenses.fire();
            }
        });
    }

    public static addDataLabels(data: DataLabel[]) {
        ExecutorCodeLensProvider.dataLabels = data;
        ExecutorCodeLensProvider.onDidChangeCodeLenses.fire();
    }

    provideCodeLenses(_document: TextDocument, _token: CancellationToken): ProviderResult<any[]> {
        return this.getCodeLensList();
    }

    private async getCodeLensList(): Promise<CodeLens[]> {
        let codeLenses: CodeLens[] = [];
        const activeEditor = window.activeTextEditor;
        const uri = activeEditor?.document.uri.fsPath.toString();

        if (uri && langClient) {
            // add codelenses to endpoints
            await langClient.getActionInvocations({
                documentIdentifier: {
                    uri: uri
                }
            }).then(async response => {
                if (response) {
                    const json = JSON.parse(response);
                    log(json);
                    for (let endpoint in json.endpoints) {
                        const pos = json.endpoints[endpoint].pos;
                        if (pos.filePath == window.activeTextEditor!.document.fileName.split("/").pop()) {
                            const startLine = pos.startLine;
                            const endLine = pos.endLine;

                            codeLenses.push(this.createCodeLens(CODELENSE_TYPE.ENDPOINT,
                                startLine.line, startLine.offset,
                                endLine.line, endLine.offset, response, ANALYZE_TYPE.ADVANCED));
                        }
                    }

                }
            }, _error => {
                return codeLenses;
            });
        }

        if (ExecutorCodeLensProvider.dataLabels.length > 0) {
            // add codelenses to actions invocations
            for (let i = 0; i < ExecutorCodeLensProvider.dataLabels.length; i++) {
                const label = ExecutorCodeLensProvider.dataLabels[i];
                if (label.getFile == window.activeTextEditor!.document.fileName.split("/").pop()) {
                    const startLine = label.getRange.start;
                    const endLine = label.getRange.end;

                    codeLenses.push(this.createCodeLens(CODELENSE_TYPE.INVOCATION,
                        startLine.line, startLine.character,
                        endLine.line, endLine.character, "response", ANALYZE_TYPE.ADVANCED,
                        label.getLabel.toString()));
                }
            }

        }

        return codeLenses;
    }

    private createCodeLens(type: CODELENSE_TYPE, startLine, startColumn, endLine, endColumn,
        data, execType: ANALYZE_TYPE, latency = ""): CodeLens {

        const codeLens = new CodeLens(new Range(startLine, startColumn, endLine, endColumn));
        codeLens.command = {
            title: type == CODELENSE_TYPE.ENDPOINT ? "View Performance" : `Forecasted latency: ${latency} ms`,
            tooltip: type == CODELENSE_TYPE.ENDPOINT ? "Forecast performance using AI" :
                `Click here to view the performance graph.`,
            command: type == CODELENSE_TYPE.ENDPOINT ? FORECAST_PERFORMANCE_COMMAND : SHOW_GRAPH_COMMAND,
            arguments: type == CODELENSE_TYPE.ENDPOINT ? [data, execType] : [data]
        };
        return codeLens;
    }

}
