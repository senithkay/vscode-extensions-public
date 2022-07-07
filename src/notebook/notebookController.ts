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
    NotebookDocument, NotebookDocumentContentChange, notebooks, window, workspace } from 'vscode';
import { BallerinaExtension, ExtendedLangClient, NotebookCellMetaInfo, NoteBookCellOutputResponse } from '../core';
import { CUSTOM_DESIGNED_MIME_TYPES, NOTEBOOK_TYPE } from './constants';
import { VariableViewProvider } from './variableView';
import { CMP_NOTEBOOK, sendTelemetryEvent, sendTelemetryException, TM_EVENT_RUN_NOTEBOOK, TM_EVENT_RUN_NOTEBOOK_BAL_CMD, 
    TM_EVENT_RUN_NOTEBOOK_CODE_SNIPPET } from '../telemetry';
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

        // handle deletetions of cells
        workspace.onDidChangeNotebookDocument(listner => {
            listner.contentChanges.forEach((change: NotebookDocumentContentChange) => {
                change.removedCells.forEach( async (cell: NotebookCell) => {
                    let failedVars = await this.deleteMetaInfoFromMemoryForCell(cell);
                    failedVars.length && window.showInformationMessage(
                        `'${failedVars.join("', '")}' is/are not removed from memory since it/they have referred in other cells.`
                    );
                    this.updateVariableView();
                });
            });
        });
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
        sendTelemetryEvent(this.ballerinaExtension, TM_EVENT_RUN_NOTEBOOK, CMP_NOTEBOOK);
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
            appendTextToOutput('Execution Interrupted.');
            execution.end(false, Date.now());
        });
        
        // if cell content is empty no need for an code execution
        // But if the cell contained executed code with definitions
        // remove them from the shell invokermemory
        if (!cellContent && !!langClient) {
            let failedVars = await this.deleteMetaInfoFromMemoryForCell(cell);
            failedVars.length && appendTextToOutput(
                `'${failedVars.join("', '")}' is/are not removed from memory since it/they have referred in other cells.`
            );
            execution.end(!failedVars.length, Date.now());
            return;
        }

        // handle if language client is not ready yet 
        if (!langClient) {
            execution.replaceOutput([new NotebookCellOutput([
                NotebookCellOutputItem.text("Language client is not ready yet.")
            ])]);
            execution.end(false, Date.now());
            return;
        }

        await langClient.onReady();

        try {
            // bal cmds
            if (cellContent.startsWith("bal")) {
                sendTelemetryEvent(this.ballerinaExtension, TM_EVENT_RUN_NOTEBOOK_BAL_CMD, CMP_NOTEBOOK);
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
            sendTelemetryEvent(this.ballerinaExtension, TM_EVENT_RUN_NOTEBOOK_CODE_SNIPPET, CMP_NOTEBOOK);
            let response = await langClient.getBalShellResult({
                source: cellContent
            });
            let output = response as NoteBookCellOutputResponse;
            
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
            // remove duplicates
            const errors = new Set(output.errors);
            const diagnostics = new Set(output.diagnostics);
            errors.forEach(appendTextToOutput);
            diagnostics.forEach(appendTextToOutput);

            // Collect and store if there is any declarations cell meta data
            if (output.metaInfo) {
                let removedDefs = this.metaInfoHandler.handleNewMetaInfo(cell, output.metaInfo);
                let failedVars = await this.deleteMetaInfoFromMemory(removedDefs);
                failedVars.length && appendTextToOutput(
                    `'${failedVars.join("', '")}' is/are not removed from memory since it/they have referred in other cells.`
                );
            }

            // end execution with succes or fail
            // success if there are no diagnostics and errors
            execution.end(!(output.diagnostics.length) && !(output.errors.length), Date.now());
        } catch (error) {
            if (error instanceof Error) {
                sendTelemetryException(this.ballerinaExtension, error, CMP_NOTEBOOK);
                execution.appendOutput([new NotebookCellOutput([
                    NotebookCellOutputItem.error(error)
                ])]);
            } else {
                appendTextToOutput("Unknown error occurred.");
            }
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
     * Removes meta info from memory for a given cell
     * 
     * @param cell Notebook cell which needs to remove definitions from memory
     * @returns List of definitions failed to remove from memory
     */
    private async deleteMetaInfoFromMemoryForCell(cell: NotebookCell): Promise<string[]> {
        let varsToDelete = this.metaInfoHandler.getMetaForCell(cell);
        return await this.deleteMetaInfoFromMemory(varsToDelete);
    }

    /**
     * Removes given definitions from memory
     * 
     * @param varsToDelete definitions which need to remove from memory
     * @returns List of definitions failed to remove from memory
     */
    private async deleteMetaInfoFromMemory(varsToDelete: string[]): Promise<string[]> {
        let langClient: ExtendedLangClient = <ExtendedLangClient>this.ballerinaExtension.langClient;
        if (!langClient) {
            return [];
        }
        let failedVars: string[] = [];
        for (const varToDelete of varsToDelete) {
            if (!(await langClient.deleteDeclarations({varToDelete: varToDelete}))) {
                failedVars.push(varToDelete);
            } else {
                this.metaInfoHandler.clearVarFromMap(varToDelete);
            }
        }
        return failedVars;
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
 * 
 * **Notes:**
 * - After each execution new variables and module declarations defined by cell
 *   are added to cellInfoList.
 * - varToCellMap will hold the last successfully executed cell for each variable 
 *   and module declaration
 * - On an event of empty cell invocation or cell delete variables and module dclns
 *   need to be deleted will be identified by ensuring that each associated meto info 
 *   for the cell are mapped to the cell in varToCellMap. If not matched those values 
 *   have defined and executed in another cell after the execution of this cell.
 */
class MetoInfoHandler {
    private cellInfoList: CellInfo[];
    // NotebookCell instead of uri to address changes in notebook cell order
    // (which affects uri) due to add, delete, join, and split.
    private varToCellMap: Map<string, NotebookCell>;

    constructor() {
        this.cellInfoList = [];
        this.varToCellMap = new Map<string,NotebookCell>();
    }

    /**
     * Returns variable declarations and module declarations for a given cell if there are any
     * otherwise empty arrays will return for each
     * 
     * @param cell Notebook cell
     * @returns Variable declarations and module declarations for the cell
     */
    getMetaForCell(cell: NotebookCell): string[] {
        let definedForCell: string[] = [];

        // finding the defined values for cell
        // this can include values that are redefined and executed in another cell
        for (const cellInfo of this.cellInfoList) {
            if (cellInfo.cell.document.uri === cell.document.uri) {
                definedForCell.push(...cellInfo.definedVars, ...cellInfo.moduleDclns);
                break;
            }
        }

        // check with variable to cell map
        // if the cell mapped to the variable is not the same cell then that variable decln
        // has defined in another place and executed after this cell
        return definedForCell.filter((key: string) => this.varToCellMap.get(key)?.document.uri === cell.document.uri);
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
     * if the given cell is already in the cellinfoList, this will update info for that cell
     * and removes definitions that was in this cell but removed with the current execution. 
     * otherwise create a new entry with the info
     * 
     * @param cell Notebook cell
     * @param metaInfo New info on the cell
     * @returns 
     */
    handleNewMetaInfo(cell: NotebookCell, metaInfo: NotebookCellMetaInfo): string[] {
        let found = false;
        let removedDefs: string[] = [];
        for (const cellInfo of this.cellInfoList) {
            if (cellInfo.cell.document.uri === cell.document.uri) {
                found = true;
                // find defs previously associated with this cell due to an previous
                // execution and not available after the new execution
                removedDefs.push(
                    ...cellInfo.definedVars.filter(x => !metaInfo.definedVars.includes(x)),
                    ...cellInfo.moduleDclns.filter(x => !metaInfo.moduleDclns.includes(x))
                );
                cellInfo.definedVars = metaInfo.definedVars;
                cellInfo.moduleDclns = metaInfo.moduleDclns;
                break;
            }
        }
        if (!found) {
            this.cellInfoList.push({
                cell: cell,
                definedVars: metaInfo.definedVars,
                moduleDclns: metaInfo.moduleDclns,
            })
        }
        // update varToCellMap
        [...metaInfo.definedVars, ...metaInfo.moduleDclns].forEach((key: string) => this.varToCellMap.set(key, cell));
        return removedDefs.filter((key: string) => this.varToCellMap.get(key)?.document.uri === cell.document.uri);
    }

    clearVarFromMap(varToDelete: string) {
        this.varToCellMap.delete(varToDelete);
    }

    /**
     * Clears out cell info list and map
     */
    reset() {
        this.cellInfoList = [];
        this.varToCellMap.clear();
    }
}
