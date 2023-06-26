/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BallerinaExtension, LANGUAGE, WEBVIEW_TYPE } from '../core';
import {
    CancellationToken, CodeLens, CodeLensProvider, Event, EventEmitter,
    ProviderResult, Range, TextDocument, Uri, window, workspace
} from 'vscode';
// import { createPerformanceGraphAndCodeLenses } from './activator';
import { DataLabel } from './model';
import path from 'path';
import { SHOW_GRAPH_COMMAND } from './activator';
import { DefaultWebviewPanel } from './performanceGraphPanel';

export enum CODELENSE_TYPE {
    REALTIME,
    ADVANCED
}

const debounceTime: number = 5000;
let lastRefresh: number = Date.now();

/**
 * Codelense provider for performance forecaster.
 */
export class ExecutorCodeLensProvider implements CodeLensProvider {

    private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
    public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event;

    static onDidChangeCodeLenses: any;
    static dataLabels: DataLabel[] = [];
    private static isProccessing = false;
    private extension: BallerinaExtension;

    constructor(extensionInstance: BallerinaExtension) {
        ExecutorCodeLensProvider.onDidChangeCodeLenses = this._onDidChangeCodeLenses;
        this.extension = extensionInstance;
        workspace.onDidOpenTextDocument(async (document) => {
            if (document.languageId === LANGUAGE.BALLERINA) {
                const uri = document.uri;
                await ExecutorCodeLensProvider.addCodeLenses(uri);

            }
        });

        workspace.onDidChangeTextDocument(async (activatedTextEditor) => {
            if (!activatedTextEditor || activatedTextEditor.document.languageId !== LANGUAGE.BALLERINA) {
                return;
            }

            if (this.extension.getCodeServerContext().codeServerEnv && !this.extension.getDocumentContext().isActiveDiagram()) {
                this.extension.getCodeServerContext().telemetryTracker?.incrementTextEditCount();
            }

            if (this.extension.getWebviewContext().isOpen &&
                this.extension.getWebviewContext().type === WEBVIEW_TYPE.PERFORMANCE_FORECAST) {
                // Close graph while editing.
                DefaultWebviewPanel.currentPanel?.dispose();
            }

            const currentTime: number = Date.now();
            if (currentTime - lastRefresh > debounceTime) {
                await ExecutorCodeLensProvider.addCodeLenses(activatedTextEditor.document.uri);
                lastRefresh = currentTime;
            }
        });

        if (window.activeTextEditor && window.activeTextEditor.document.languageId === LANGUAGE.BALLERINA) {
            const uri = window.activeTextEditor.document.uri;
            ExecutorCodeLensProvider.addCodeLenses(uri);

        }
    }

    public static async addCodeLenses(uri: Uri) {
        if (!ExecutorCodeLensProvider.isProccessing) {
            ExecutorCodeLensProvider.isProccessing = true;
            ExecutorCodeLensProvider.dataLabels = [];
            // await createPerformanceGraphAndCodeLenses(uri.fsPath, ANALYZETYPE.REALTIME);
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

    public getCodeLensList(): CodeLens[] {
        let codeLenses: CodeLens[] = [];

        // add codelenses to actions invocations
        for (let i = 0; i < ExecutorCodeLensProvider.dataLabels.length; i++) {
            const label = ExecutorCodeLensProvider.dataLabels[i];
            if (window.activeTextEditor &&
                (label.getFile == window.activeTextEditor.document.fileName ||
                    label.getFile == window.activeTextEditor.document.fileName.split(path.sep).pop())) {

                codeLenses.push(this.createCodeLens(label));
            }
        }

        return codeLenses;
    }

    private createCodeLens(label: DataLabel): CodeLens {
        const startLine = label.getRange.start;
        const endLine = label.getRange.end;

        const concurrencies = label.getConcurrency;
        const latencies = label.getLatency;
        const tpss = label.getTps;

        let minLatency = latencies.min ? `${latencies.min > 1000 ? latencies.min / 1000 : latencies.min} ${latencies.min > 1000 ? " s" : " ms"}` : 0;
        let maxLatency = `${latencies.max > 1000 ? latencies.max / 1000 : latencies.max} ${latencies.max > 1000 ? " s" : " ms"}`;

        const codeLens = new CodeLens(new Range(startLine.line, startLine.character, endLine.line, endLine.character));

        codeLens.command = {
            title: label.getType == CODELENSE_TYPE.REALTIME ?
                (concurrencies.max !== 1 ?
                    `Forecasted latency between ${minLatency} - ${maxLatency} (for concurrency ${concurrencies.min} - ${concurrencies.max})` :
                    `Forecasted minimum latency ${minLatency} (with ${tpss.min} tps for single user)`) :
                `Forecasted latency ${maxLatency} (for concurrency ${concurrencies.max})`,

            tooltip: label.getType == CODELENSE_TYPE.REALTIME ? `Click here to view the performance graph.` : ``,
            command: SHOW_GRAPH_COMMAND,
            arguments: (label.getType == CODELENSE_TYPE.ADVANCED || concurrencies.max !== 1) ?
                [label.getData] : []
        };
        return codeLens;
    }

}
