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

import { TextDecoder, TextEncoder } from 'util';
import { CancellationToken, NotebookCellData, NotebookCellExecutionSummary, NotebookCellKind, 
    NotebookCellOutput, NotebookCellOutputItem, NotebookData, NotebookSerializer } from 'vscode';

interface RawNotebookCell {
    language: string;
    value: string;
    kind: NotebookCellKind;
    outputs: RawCellOutput[];
    executionSummary?: NotebookCellExecutionSummary;
    metadata?: {[key: string]: any};
}

interface RawCellOutput {
    mime: string;
    value: any;
}

export class BallerinaNotebookSerializer implements NotebookSerializer {
    async deserializeNotebook(content: Uint8Array, _token: CancellationToken): Promise<NotebookData> {
        var contents = new TextDecoder().decode(content);

        let raw: RawNotebookCell[];
        try {
            raw = <RawNotebookCell[]>JSON.parse(contents);
        } catch {
            raw = [];
        }

        const cells = raw.map(
            item => {
                let cellData: NotebookCellData = new NotebookCellData(item.kind, item.value, item.language);
                cellData.outputs = [new NotebookCellOutput(this.getCellOutputs(item.outputs))];
                cellData.executionSummary = item.executionSummary;
                cellData.metadata = item.metadata;
                return cellData;
            }
        );

        return new NotebookData(cells);
    }
   
    async serializeNotebook(data: NotebookData, _token: CancellationToken): Promise<Uint8Array> {
        let contents: RawNotebookCell[] = [];
        for (const cell of data.cells) {
            contents.push({
                kind: cell.kind,
                language: cell.languageId,
                value: cell.value,
                outputs: this.getRawCellOutputs(cell.outputs),
                executionSummary: cell.executionSummary,
                metadata: cell.metadata
            });
        }
        return new TextEncoder().encode(JSON.stringify(contents));
    }

    getCellOutputs(rawCellOutputs: RawCellOutput[]): NotebookCellOutputItem[] {
        let cellOutputs: NotebookCellOutputItem[] = [];
        for(let output of rawCellOutputs) {
            let data = new TextEncoder().encode(output.value);
            cellOutputs.push(new NotebookCellOutputItem(data, output.mime));
        }
        return cellOutputs;
    }

    getRawCellOutputs(cellOutputs: NotebookCellOutput[]|undefined): RawCellOutput[] {
        let rawCellOutputs: RawCellOutput[] = [];
        for (const output of cellOutputs ?? []) {
            for (const item of output.items) {
                let outputItemContent = new TextDecoder().decode(item.data);
                rawCellOutputs.push({
                    mime: item.mime,
                    value: outputItemContent
                });
            }
        }
        return rawCellOutputs;
    }
}