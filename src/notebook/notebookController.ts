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

import { NotebookCell, NotebookCellOutput, NotebookCellOutputItem, NotebookController, 
    NotebookDocument, notebooks } from 'vscode';
import { BallerinaExtension, BalShellResponse, ExtendedLangClient } from '../core';
import { MIME_TYPE_TABLE } from './renderer/constants';

export class BallerinaNotebookController {
    readonly controllerId = 'ballerina-notebook-controller-id';
    readonly notebookType = 'ballerina-notebook';
    readonly label = 'Ballerina Notebook';
    readonly supportedLanguages = ['ballerina'];

    private ballerinaExtension: BallerinaExtension;
    private readonly controller: NotebookController;
    private executionOrder = 0;

    constructor(extensionInstance: BallerinaExtension) {
        this.ballerinaExtension = extensionInstance;
        this.controller = notebooks.createNotebookController(
            this.controllerId,
            this.notebookType,
            this.label
        );

        this.controller.supportedLanguages = this.supportedLanguages;
        this.controller.supportsExecutionOrder = true;
        this.controller.executeHandler = this.execute.bind(this);
    }

    private execute(cells: NotebookCell[], _notebook: NotebookDocument, 
        controller: NotebookController): void {
        for (let cell of cells) {
            this.doExecution(cell);
        }
    }

    private async doExecution(cell: NotebookCell): Promise<void> {
        if (cell && cell.document && !cell.document.getText().trim()) {
            return;
        }
        let langClient: ExtendedLangClient = <ExtendedLangClient>this.ballerinaExtension.langClient;

        if (!langClient) {
            return;
        }
        
        const execution = this.controller.createNotebookCellExecution(cell);
        execution.executionOrder = ++this.executionOrder;
        execution.start(Date.now());
        execution.clearOutput();
        execution.token.onCancellationRequested(()=> {
            execution.appendOutput(new NotebookCellOutput([
                NotebookCellOutputItem.text('Execution Interrupted')
            ]))
            execution.end(false, Date.now());
        });
        try {
            let output: BalShellResponse = await langClient.getBalShellResult({
                source: cell.document.getText().trim()
            });
            if (output.diagnostics.length) {
                output.diagnostics.length > 1 ? output.diagnostics.pop() : null;
                output.diagnostics.forEach(diagnostic => 
                        execution.appendOutput(new NotebookCellOutput([
                            NotebookCellOutputItem.text(diagnostic)
                        ]))
                );
                execution.end(false, Date.now());
            }
            else if (output.shellValue?.value) {
                if (output.shellValue.mimeType == MIME_TYPE_TABLE) {
                    execution.replaceOutput([ new NotebookCellOutput([
                            NotebookCellOutputItem.json(output, MIME_TYPE_TABLE),
                            NotebookCellOutputItem.text(output.shellValue.value)
                        ])
                    ]);
                }
                else {
                    execution.replaceOutput([ new NotebookCellOutput([
                        NotebookCellOutputItem.text(output.shellValue.value)])
                    ]);
                }
                execution.end(true, Date.now());
            } 
            else {
                execution.end(true, Date.now());
            }
        } catch (error) {
            
        }
    }

    dispose(): void {
        throw new Error('Method not implemented.');
    }
}