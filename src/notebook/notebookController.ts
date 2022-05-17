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
import { CUSTOM_DESIGNED_MIME_TYPES, NOTEBOOK_TYPE } from './constants';
import { VariableViewProvider } from './variableView';
import { isWindows } from '../utils';

/**
 * Notebook controller to provide functionality of code execution.
 */
export class BallerinaNotebookController {
    readonly controllerId = 'ballerina-notebook-controller-id';
    readonly notebookType = NOTEBOOK_TYPE;
    readonly label = 'Ballerina Notebook';
    readonly supportedLanguages = ['ballerina'];

    private ballerinaExtension: BallerinaExtension;
    private variableView: VariableViewProvider;
    private metaInfoHandler: MetoInfoHandler;
    private readonly controller: NotebookController;
    private executionOrder = 0;

    /**
     * Constuctor for Ballerina notebook controller
     * 
     * @param extensionInstance Ballerina extension instance
     * @param variableViewProvider Provider for variable view
     */
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

    /**
     * Handler for cell execution.
     * 
     * @param cells Set of notebook cells to execute.
     * @param _notebook Notebook document
     * @param controller Notebook controller
     */
    private async execute(cells: NotebookCell[], _notebook: NotebookDocument,
        controller: NotebookController): Promise<void> {
        for (let cell of cells) {
            await this.doExecution(cell);
            this.updateVariableView(); // update the variable view to reflect changes
        }
    }

    private async doExecution(cell: NotebookCell): Promise<void> {
        let langClient: ExtendedLangClient = <ExtendedLangClient>this.ballerinaExtension.langClient;
        const cellContent = cell.document.getText().trim();
        
        const execution = this.controller.createNotebookCellExecution(cell);
        execution.executionOrder = ++this.executionOrder;
        execution.start(Date.now());
        execution.clearOutput();
        
        // appends string output to the current execution cell output
        const appendTextToOutput = (data: any) => {
            execution.appendOutput([new NotebookCellOutput([
                NotebookCellOutputItem.text(data.toString().trim())
            ])]);
        };

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

            // log console output first
            // since console output will be logged until an exception happens so it comes first
            output.consoleOut && appendTextToOutput(output.consoleOut);

            // render the output value if available
            if (output.shellValue?.value) {
                if (CUSTOM_DESIGNED_MIME_TYPES.includes(output.shellValue!.mimeType)) {
                    execution.appendOutput([new NotebookCellOutput([
                        NotebookCellOutputItem.json(output, output.shellValue!.mimeType),
                        NotebookCellOutputItem.text(output.shellValue.value)
                    ])]);
                }
                else {
                    execution.appendOutput([new NotebookCellOutput([
                        NotebookCellOutputItem.text(output.shellValue.value)
                    ])]);
                }
            }

            // finally errors and diagnostics
            output.diagnostics.length && output.diagnostics.forEach(appendTextToOutput);
            output.errors.length && output.errors.forEach(appendTextToOutput);

            // end execution with succes or fail
            // success if there are no diagnostics and errors
            execution.end(!(output.diagnostics.length) && !(output.errors.length), Date.now());

            // Collect and store if there is any declarations cell meta data
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

    /**
     * Brings controller to initial state by
     *  - resetting execution counter
     *  - updating variale view
     *  - resetting meta info on cells
     */
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

/**
 * Stores and handles info on variable declarations and module declarations for
 * executed cells
 */
class MetoInfoHandler {
    private cellInfoList: CellInfo[];

    constructor() {
        this.cellInfoList = [];
    }

    /**
     * Returns variable declarations and module declarations for a given cell if there are any
     * otherwise empty arrays will return for each
     * 
     * @param cell Notebook cell
     * @returns Variable declarations and module declarations for the cell
     */
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

    /**
     * Clears out info on a given cell if there is any
     * 
     * @param cell Notebook cell
     */
    clearInfoForCell(cell: NotebookCell) {
        for (const cellInfo of this.cellInfoList) {
            if (cellInfo.cell.document.uri === cell.document.uri) {
                cellInfo.definedVars = [];
                cellInfo.moduleDclns = [];
            }
        }
    }

    /**
     * Handles collection of meta info for cells
     * if the given cell is already in the cellinfoList, this will update info for thet cell
     * otherwise create a new entry with the info
     * 
     * TODO: handle cell delete, split and join
     * 
     * @param cell Notebook cell
     * @param metaInfo New info on the cell
     */
    handleNewMetaInfo(cell: NotebookCell, metaInfo: NotebookCellMetaInfo) {
        let found = false;
        for (const cellInfo of this.cellInfoList) {
            if (cellInfo.cell.document.uri === cell.document.uri) {
                found = true;
                // TODO: handle on changes of meta info
                // Example: if the new meta info includes only part of previous meta info
                // then those missing meta info must be deleted from invoker memory if they are
                // not defined in another cell
                // this approach should fix splitting of cells but it requires the execution of cells
                cellInfo.definedVars = metaInfo.definedVars;
                cellInfo.moduleDclns = metaInfo.moduleDclns;
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

    /**
     * Clears out cell info list
     */
    reset() {
        this.cellInfoList = [];
    }
}
