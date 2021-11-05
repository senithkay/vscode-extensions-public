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
    ProviderResult, Range, TextDocument, Uri, window, workspace
} from 'vscode';
import { BAL_TOML } from '../project';
import { createPerformanceGraphAndCodeLenses, SHOW_GRAPH_COMMAND } from './activator';
import { DataLabel, Member, SyntaxTree } from './model';
import path from 'path';
import { ANALYZETYPE } from '.';

enum CODELENSE_TYPE {
    RESOURCE,
    INVOCATION
}

let langClient: ExtendedLangClient;

/**
 * Codelense provider for performence forecaster.
 */
export class ExecutorCodeLensProvider implements CodeLensProvider {

    private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
    public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event;

    static onDidChangeCodeLenses: any;
    static dataLabels: DataLabel[] = [];
    private static isProccessing = false;

    constructor(extensionInstance: BallerinaExtension) {
        ExecutorCodeLensProvider.onDidChangeCodeLenses = this._onDidChangeCodeLenses;
        langClient = <ExtendedLangClient>extensionInstance.langClient;
        workspace.onDidOpenTextDocument(async (document) => {
            if (document.languageId === LANGUAGE.BALLERINA || document.fileName.endsWith(BAL_TOML)) {
                const uri = document.uri;
                await ExecutorCodeLensProvider.addCodeLenses(uri);

            }
        });

        workspace.onDidChangeTextDocument(async (activatedTextEditor) => {
            if (activatedTextEditor && activatedTextEditor.document.languageId === LANGUAGE.BALLERINA ||
                activatedTextEditor.document.fileName.endsWith(BAL_TOML)) {
                const activeEditor = window.activeTextEditor;
                const uri = activeEditor?.document.uri;
                await ExecutorCodeLensProvider.addCodeLenses(uri);
            }
        });
    }

    public static async addCodeLenses(uri: Uri | undefined) {
        if (!ExecutorCodeLensProvider.isProccessing) {
            ExecutorCodeLensProvider.isProccessing = true;
            ExecutorCodeLensProvider.dataLabels = [];
            await findResources(uri);
            ExecutorCodeLensProvider.onDidChangeCodeLenses.fire();
            ExecutorCodeLensProvider.isProccessing = false;
        }
    }

    public static addDataLabel(data: DataLabel) {
        this.dataLabels.push(data);
    }

    provideCodeLenses(_document: TextDocument, _token: CancellationToken): ProviderResult<any[]> {
        return this.getCodeLensList();
    }

    private async getCodeLensList(): Promise<CodeLens[]> {
        let codeLenses: CodeLens[] = [];

        // add codelenses to actions invocations
        for (let i = 0; i < ExecutorCodeLensProvider.dataLabels.length; i++) {
            const label = ExecutorCodeLensProvider.dataLabels[i];
            if (window.activeTextEditor &&
                (label.getFile == window.activeTextEditor.document.fileName ||
                    label.getFile == window.activeTextEditor.document.fileName.split(path.sep).pop())) {
                const startLine = label.getRange.start;
                const endLine = label.getRange.end;

                codeLenses.push(this.createCodeLens(CODELENSE_TYPE.INVOCATION,
                    startLine.line, startLine.character,
                    endLine.line, endLine.character,
                    [label.getResourcePos, label.getResourceName], label.getLabel.toString()));
            }
        }

        return codeLenses;
    }

    private createCodeLens(type: CODELENSE_TYPE, startLine, startColumn, endLine, endColumn,
        data: any[], latency = "null"): CodeLens {

        const codeLens = new CodeLens(new Range(startLine, startColumn, endLine, endColumn));
        codeLens.command = {
            title: latency == "" ? "View Performance" : `Forecasted latency: ${latency} ms`,
            tooltip: type == CODELENSE_TYPE.RESOURCE ? "Forecast performance using AI" :
                `Click here to view the performance graph.`,
            command: SHOW_GRAPH_COMMAND,
            arguments: data
        };
        return codeLens;
    }

}

async function findResources(uri: Uri | undefined) {
    if (!uri || !langClient) {
        return;
    }

    // add codelenses to resources
    await langClient.onReady().then(async () => {
        await langClient.getSyntaxTree({
            documentIdentifier: {
                uri: uri.toString()
            }
        }).then(async (response) => {
            const syntaxTree: SyntaxTree = response.syntaxTree;
            if (!syntaxTree || !syntaxTree.members) {
                return;
            }
            const members: Member[] = syntaxTree.members;
            for (let i = 0; i < members.length; i++) {
                if (members[i].kind === 'ServiceDeclaration') {
                    const serviceMembers: Member[] = members[i].members;
                    for (let ri = 0; ri < members[i].members.length; ri++) {
                        const serviceMember: Member = serviceMembers[ri];
                        if (serviceMember.kind === 'ResourceAccessorDefinition') {
                            const pos = serviceMember.position;

                            const range: Range = new Range(pos.startLine, pos.startColumn,
                                pos.endLine, pos.endColumn);

                            if (!serviceMember.functionName || !serviceMember.relativeResourcePath) {
                                continue;
                            }
                            await createPerformanceGraphAndCodeLenses(uri.fsPath, range, ANALYZETYPE.REALTIME,
                                `${serviceMember.functionName.value} ${serviceMember.relativeResourcePath[0].value}`);
                        }
                    }
                }
            }
        });
    });
}
