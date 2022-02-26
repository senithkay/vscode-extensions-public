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
import { BallerinaExtension, ExtendedLangClient, ShellOutput } from '../core';

export class notebookController {
    readonly controllerId = 'ballerina-notebook-controller-id';
    readonly notebookType = 'ballerina-notebook';
    readonly label = 'Ballerina Notebook';
    readonly supportedLanguages = ['ballerina'];

    private ballerinaExtension: BallerinaExtension;
    private readonly _controller: NotebookController;
    private _executionOrder = 0;

    constructor(extensionInstance: BallerinaExtension) {
        this.ballerinaExtension = extensionInstance;
        this._controller = notebooks.createNotebookController(
            this.controllerId,
            this.notebookType,
            this.label
        );

        this._controller.supportedLanguages = this.supportedLanguages;
        this._controller.supportsExecutionOrder = true;
        this._controller.executeHandler = this._execute.bind(this);
    }

    private _execute(cells: NotebookCell[], _notebook: NotebookDocument, 
        _controller: NotebookController): void {
        for (let cell of cells) {
            this._doExecution(cell);
        }
    }

    private async _doExecution(cell: NotebookCell): Promise<void> {
        if (cell && cell.document && !cell.document.getText().trim()) {
            return;
        }
        let langClient: ExtendedLangClient = <ExtendedLangClient>this.ballerinaExtension.langClient;

        if (!langClient) {
            return;
        }
        
        const execution = this._controller.createNotebookCellExecution(cell);
        execution.executionOrder = ++this._executionOrder;
        execution.start(Date.now());
        
        let output: ShellOutput = await langClient.getBalShellResult({
            source: cell.document.getText().trim()
        });
        if (output.shellValue?.value) {
            execution.replaceOutput([
                new NotebookCellOutput([
                    NotebookCellOutputItem.text(output.shellValue.value)
                ])
            ]);
        }
        
        execution.end(true, Date.now());
    }


    dispose(): void {
        throw new Error('Method not implemented.');
    }
}