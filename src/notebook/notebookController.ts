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

import { spawn } from 'child_process';
import { NotebookCell, NotebookCellOutput, NotebookCellOutputItem, NotebookController, 
    NotebookDocument, notebooks } from 'vscode';
import { BallerinaExtension, ExtendedLangClient, NotebookCellMetaInfo, NoteBookCellOutputResponse } from '../core';
import { CUSTOM_DESIGNED_MIME_TYPES } from './constants';
import { VariableViewProvider } from './variableView';
import { isWindows } from '../utils';

export class BallerinaNotebookController {
    readonly controllerId = 'ballerina-notebook-controller-id';
    readonly notebookType = 'ballerina-notebook';
    readonly label = 'Ballerina Notebook';
    readonly supportedLanguages = ['ballerina'];

    private ballerinaExtension: BallerinaExtension;
    private variableView: VariableViewProvider;
    private metaInfoHandler: MetoInfoHandler;
    private readonly controller: NotebookController;
    private executionOrder = 0;

    constructor(extensionInstance: BallerinaExtension, variableViewProvider: VariableViewProvider) {
        this.ballerinaExtension = extensionInstance;
        this.variableView = variableViewProvider;
        this.metaInfoHandler = new MetoInfoHandler();

        this.controller = notebooks.createNotebookController(
            this.controllerId,
            this.notebookType,
            this.label
        );
        this.controller.supportedLanguages = this.supportedLanguages;
        this.controller.supportsExecutionOrder = true;
        this.controller.executeHandler = this.execute.bind(this);
    }

    private async execute(cells: NotebookCell[], _notebook: NotebookDocument,
        controller: NotebookController): Promise<void> {
        for (let cell of cells) {
            await this.doExecution(cell);
            this.updateVariableView();
        }
    }

    private async doExecution(cell: NotebookCell): Promise<void> {
        let langClient: ExtendedLangClient = <ExtendedLangClient>this.ballerinaExtension.langClient;
        const cellContent = cell.document.getText().trim();
        
        const appendTextToOutput = (data: any) => {
            execution.appendOutput([new NotebookCellOutput([
                NotebookCellOutputItem.text(data.toString().trim())
            ])]);
        };
        
        const execution = this.controller.createNotebookCellExecution(cell);
        execution.executionOrder = ++this.executionOrder;
        execution.start(Date.now());
        execution.clearOutput();

        // handle request to cancel the running execution 
        execution.token.onCancellationRequested(() => {
            appendTextToOutput('Execution Interrupted');
            execution.end(false, Date.now());
        });
        
        // if cell content is empty no need for an code execution
        // But if the cell contained executed code with definitions
        // remove them from the shell invokermemory
        if (!cellContent && !!langClient) {
            let deleteSuccess = await langClient.deleteDeclarations(this.metaInfoHandler.getMetaForCell(cell));
            deleteSuccess && this.metaInfoHandler.clearInfoForCell(cell);
            execution.end(deleteSuccess, Date.now());
            return;
        }

        // handle if language client is not ready yet 
        if (!langClient) {
            execution.replaceOutput([new NotebookCellOutput([
                NotebookCellOutputItem.text("Language client is not ready yet")
            ])]);
            execution.end(false, Date.now());
            return;
        }

        try {
            // bal cmds
            if (cellContent.startsWith("bal")) {
                // unlike linux, windows does not identify single quotes as separators
                const regex = isWindows() ? /(?:[^\s"]+|"[^"]*")+/g : /(?:[^\s"']+|"[^"]*"|'[^']*')+/g;
                const args = cellContent.substring("bal".length).trim().match(regex) || [];
                const balRunner = spawn(this.ballerinaExtension.getBallerinaCmd(), args);

                balRunner.stdout.setEncoding('utf8');
                balRunner.stdout.on('data', appendTextToOutput);

                balRunner.stderr.setEncoding('utf8');
                balRunner.stderr.on('data', appendTextToOutput);

                balRunner.on('close', (code) => {
                    execution.end(code === 0, Date.now());
                });
                return;
            }

            // code snippets
            let output: NoteBookCellOutputResponse = await langClient.getBalShellResult({
                source: cellContent
            });
            if (output.shellValue?.value) {
                if (CUSTOM_DESIGNED_MIME_TYPES.includes(output.shellValue!.mimeType)) {
                    execution.replaceOutput([new NotebookCellOutput([
                        NotebookCellOutputItem.json(output, output.shellValue!.mimeType),
                        NotebookCellOutputItem.text(output.shellValue.value)
                    ])]);
                }
                else {
                    execution.replaceOutput([new NotebookCellOutput([
                        NotebookCellOutputItem.text(output.shellValue.value)
                    ])]);
                }
            }
            if (output.diagnostics.length) {
                output.diagnostics.forEach(appendTextToOutput);
            }
            if (output.errors.length) {
                output.errors.forEach(appendTextToOutput);
            }
            execution.end(!(output.diagnostics.length) && !(output.errors.length), Date.now());
            // TODO: Collect and store if there is any declarations cell meta data
            output.metaInfo && this.metaInfoHandler.handleNewMetaInfo(cell, output.metaInfo);
        } catch (error) {
            appendTextToOutput(error);
            execution.end(false, Date.now());
        }
    }

    private resetMetaInfoHandler() {
        this.metaInfoHandler.reset();
    }

    public updateVariableView() {
        this.variableView.updateVariables();
    }

    public resetController() {
        this.executionOrder = 0;
        this.updateVariableView();
        this.resetMetaInfoHandler();
    }

    dispose(): void {
        throw new Error('Method not implemented.');
    }
}

interface CellInfo {
    cell: NotebookCell;
    definedVars: string[];
    moduleDclns: string[];
}

class MetoInfoHandler {
    private cellInfoList: CellInfo[];

    constructor() {
        this.cellInfoList = [];
    }

    getMetaForCell(cell: NotebookCell): NotebookCellMetaInfo {
        let definedVarsForCell: string[] = [];
        let moduleDclnsForCell: string[] = [];
        for (const cellInfo of this.cellInfoList) {
            if (cellInfo.cell.document.uri === cell.document.uri) {
                definedVarsForCell = cellInfo.definedVars;
                moduleDclnsForCell = cellInfo.moduleDclns;
            }
        }
        return {
            definedVars: definedVarsForCell,
            moduleDclns: moduleDclnsForCell
        }
    }

    clearInfoForCell(cell: NotebookCell) {
        for (const cellInfo of this.cellInfoList) {
            if (cellInfo.cell.document.uri === cell.document.uri) {
                cellInfo.definedVars = [];
                cellInfo.moduleDclns = [];
            }
        }
    }

    handleNewMetaInfo(cell: NotebookCell, metaInfo: NotebookCellMetaInfo) {
        let found = false;
        for (const cellInfo of this.cellInfoList) {
            if (cellInfo.cell.document.uri === cell.document.uri) {
                found = true;
                cellInfo.definedVars.push.apply(cellInfo.definedVars, metaInfo.definedVars);
                cellInfo.moduleDclns.push.apply(cellInfo.moduleDclns, metaInfo.moduleDclns);
            }
        }
        if (!found) {
            this.cellInfoList.push({
                cell: cell,
                definedVars: metaInfo.definedVars,
                moduleDclns: metaInfo.moduleDclns
            })
        }
    }

    reset() {
        this.cellInfoList = [];
    }
}
