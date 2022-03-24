/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useState } from 'react';

import {
    ExpressionEditorLangClientInterface,
    LibraryDataResponse,
    LibraryDocResponse,
    LibrarySearchResponse,
    STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import * as monaco from "monaco-editor";
import { Diagnostic } from "vscode-languageserver-protocol";

import {
    APPEND_EXPR_LIST_CONSTRUCTOR,
    CUSTOM_CONFIG_TYPE,
    INIT_EXPR_LIST_CONSTRUCTOR
} from "../../constants";
import {
    CurrentModel,
    StmtDiagnostic,
    SuggestionItem
} from "../../models/definitions";
import { StatementEditorContextProvider } from "../../store/statement-editor-context";
import {
    addExpressionToTargetPosition,
    enrichModel,
    getCurrentModel,
    getFilteredDiagnosticMessages,
    getUpdatedSource,
} from "../../utils";
import {
    addStatementToTargetLine,
    getCompletions,
    getDiagnostics,
    getPartialSTForStatement,
    sendDidChange,
    sendDidOpen
} from "../../utils/ls-utils";
import { StatementEditorViewState } from "../../utils/statement-editor-viewstate";
import { StmtEditorUndoRedoManager } from '../../utils/undo-redo';
import { EXPR_SCHEME, FILE_SCHEME } from "../InputEditor/constants";
import { ViewContainer } from "../ViewContainer";

export interface LowCodeEditorProps {
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>;
    applyModifications: (modifications: STModification[]) => void;
    currentFile: {
        content: string,
        path: string,
        size: number
    };
    library: {
        getLibrariesList: (kind?: string) => Promise<LibraryDocResponse>;
        getLibrariesData: () => Promise<LibrarySearchResponse>;
        getLibraryData: (orgName: string, moduleName: string, version: string) => Promise<LibraryDataResponse>;
    };
    importStatements?: string[];
    experimentalEnabled?: boolean;
}
export interface StatementEditorProps extends LowCodeEditorProps {
    label: string;
    initialSource: string;
    formArgs: any;
    config: {
        type: string;
        model?: STNode;
    };
    validForm?: boolean;
    onWizardClose: () => void;
    onCancel: () => void;
    handleStatementEditorChange?: (partialModel: STNode) => void;
    onStmtEditorModelChange?: (partialModel: STNode) => void;
}

export function StatementEditor(props: StatementEditorProps) {
    const {
        label,
        initialSource,
        formArgs,
        config,
        onCancel,
        onWizardClose,
        onStmtEditorModelChange,
        getLangClient,
        applyModifications,
        library,
        currentFile,
        importStatements
    } = props;

    const [model, setModel] = useState<STNode>(null);
    const [currentModel, setCurrentModel] = useState<CurrentModel>({ model });
    const [stmtDiagnostics, setStmtDiagnostics] = useState<StmtDiagnostic[]>([]);
    const [moduleList, setModuleList] = useState(new Set<string>());
    const [lsSuggestionsList, setLSSuggestionsList] = useState([]);

    const fileURI = monaco.Uri.file(currentFile.path).toString().replace(FILE_SCHEME, EXPR_SCHEME);
    const {
        formArgs : {
            targetPosition : targetPosition
        }
    } = formArgs;

    const undoRedoManager = React.useMemo(() => new StmtEditorUndoRedoManager(), []);

    const undo = React.useCallback(async () => {
        const undoItem = undoRedoManager.getUndoModel();
        if (undoItem) {
            const updatedContent = await getUpdatedSource(undoItem.oldModel.source, currentFile.content,
                targetPosition, moduleList, getLangClient);
            sendDidChange(fileURI, updatedContent, getLangClient).then();
            const diagnostics = await handleDiagnostics(undoItem.oldModel.source.length);
            updateEditedModel(undoItem.oldModel, diagnostics);
        }
    }, []);

    const redo = React.useCallback(async () => {
        const redoItem = undoRedoManager.getRedoModel();
        if (redoItem) {
            const updatedContent = await getUpdatedSource(redoItem.oldModel.source, currentFile.content,
                targetPosition, moduleList, getLangClient);
            sendDidChange(fileURI, updatedContent, getLangClient).then();
            const diagnostics = await handleDiagnostics(redoItem.oldModel.source.length);
            updateEditedModel(redoItem.newModel, diagnostics);
        }
    }, []);

    useEffect(() => {
        if (config.type !== CUSTOM_CONFIG_TYPE || initialSource) {
            (async () => {
                const updatedContent = await getUpdatedSource(initialSource.trim(), currentFile.content,
                    targetPosition, moduleList, getLangClient);

                sendDidOpen(fileURI, updatedContent, getLangClient).then();
                const diagnostics = await handleDiagnostics(initialSource.length);

                const partialST = await getPartialSTForStatement(
                    { codeSnippet: initialSource.trim() }, getLangClient);

                if (!partialST.syntaxDiagnostics.length) {
                    updateEditedModel(partialST, diagnostics);
                }
            })();
        }
    }, []);

    useEffect(() => {
        (async () => {
            if (model && currentModel.model) {
                let lsSuggestions : SuggestionItem[] = [];
                const currentModelViewState = currentModel.model?.viewState as StatementEditorViewState;

                if (!currentModelViewState.isOperator && !currentModelViewState.isBindingPattern) {
                    const content: string = await addStatementToTargetLine(
                        currentFile.content, targetPosition, model.source, getLangClient);
                    sendDidChange(fileURI, content, getLangClient).then();
                    lsSuggestions = await getCompletions(fileURI, targetPosition, model,
                        currentModel, getLangClient);
                }
                setLSSuggestionsList(lsSuggestions);
            }
        })();
    }, [currentModel.model]);

    useEffect(() => {
        if (!!model) {
            onStmtEditorModelChange(model);
        }
    }, [model]);

    const handleChange = async (newValue: string) => {
        const updatedStatement = addExpressionToTargetPosition(model, currentModel.model.position, newValue);
        const updatedContent = await getUpdatedSource(updatedStatement, currentFile.content,
            targetPosition, moduleList, getLangClient);

        sendDidChange(fileURI, updatedContent, getLangClient).then();
        handleDiagnostics(updatedStatement.length).then();
        handleCompletions(newValue).then();
    }

    const updateModel = async (codeSnippet: string, position: NodePosition) => {
        let partialST: STNode;
        if (model) {
            const stModification = {
                startLine: position.startLine,
                startColumn: position.startColumn,
                endLine: position.endLine,
                endColumn: position.endColumn,
                newCodeSnippet: codeSnippet
            }
            partialST = await getPartialSTForStatement(
                { codeSnippet: model.source , stModification }, getLangClient);
        } else {
            partialST = await getPartialSTForStatement(
                { codeSnippet }, getLangClient);
        }

        undoRedoManager.add(model, partialST);

        const updatedContent = await getUpdatedSource(partialST.source, currentFile.content, targetPosition,
            moduleList, getLangClient);
        sendDidChange(fileURI, updatedContent, getLangClient).then();
        const diagnostics = await handleDiagnostics(partialST.source.length);

        if (!partialST.syntaxDiagnostics.length || config.type === CUSTOM_CONFIG_TYPE) {
            updateEditedModel(partialST, diagnostics);
        }

        // Since in list constructor we add expression with comma and close-bracket,
        // we need to reduce that length from the code snippet to get the correct current model
        let currentModelPosition: NodePosition;
        if (currentModel.model && STKindChecker.isListConstructor(currentModel.model) && codeSnippet === INIT_EXPR_LIST_CONSTRUCTOR) {
            currentModelPosition = {
                ...position,
                endColumn: position.startColumn + codeSnippet.length - 1
            };
        } else if (currentModel.model && codeSnippet === APPEND_EXPR_LIST_CONSTRUCTOR){
            currentModelPosition = {
                ...position,
                startColumn: position.startColumn + 2,
                endColumn: position.startColumn + codeSnippet.length - 1
            }
        } else {
            currentModelPosition = {
                ...position,
                endColumn: position.startColumn + codeSnippet.length
            };
        }

        const newCurrentModel = getCurrentModel(currentModelPosition, enrichModel(partialST, targetPosition));
        setCurrentModel({model: newCurrentModel});
    }

    const handleModules = (module: string) => {
        let moduleIncluded : boolean;
        importStatements.forEach(importedModule => {
            if (importedModule.includes(module)){
                moduleIncluded = true;
            }
        });

        if (!moduleIncluded){
            setModuleList((prevModuleList: Set<string>) => {
                return new Set(prevModuleList.add(module));
            });
        }
    };

    const handleCompletions = async (newValue: string) => {
        const lsSuggestions = await getCompletions(fileURI, targetPosition, model,
            currentModel, getLangClient, newValue);
        setLSSuggestionsList(lsSuggestions);
    }

    const handleDiagnostics = async (stmtLength: number): Promise<Diagnostic[]> => {
        const diagResp = await getDiagnostics(fileURI, getLangClient);
        const diag  = diagResp[0]?.diagnostics ? diagResp[0].diagnostics : [];
        removeUnusedModules(diag);
        const messages = getFilteredDiagnosticMessages(stmtLength, targetPosition, diag);
        setStmtDiagnostics(messages);
        return diag;
    }

    const removeUnusedModules = (completeDiagnostic:  Diagnostic[]) => {
        if (!!moduleList.size) {
            const unusedModuleName = new RegExp(/'(.*?[^\\])'/g);
            completeDiagnostic.forEach(diagnostic => {
                let extracted;
                if (diagnostic.message.includes("unused module prefix '") ||
                    diagnostic.message.includes("undefined module '")) {
                        extracted = unusedModuleName.exec(diagnostic.message);
                        if (extracted) {
                            const extractedModule = extracted[1]
                            moduleList.forEach(moduleName => {
                                if (moduleName.includes(extractedModule)) {
                                    moduleList.delete(moduleName);
                                    setModuleList(moduleList);
                                }
                            });
                        }
                }
            });
        }
    };

    const currentModelHandler = (cModel: STNode) => {
        setCurrentModel({
            model: cModel
        });
    };

    function updateEditedModel(editedModel: STNode, diagnostics?: Diagnostic[]) {
        setModel(enrichModel(editedModel, targetPosition, diagnostics));
    }

    return (
        (
            <>
                <StatementEditorContextProvider
                    model={model}
                    currentModel={currentModel}
                    changeCurrentModel={currentModelHandler}
                    handleChange={handleChange}
                    updateModel={updateModel}
                    handleModules={handleModules}
                    modulesToBeImported={moduleList}
                    formArgs={formArgs}
                    applyModifications={applyModifications}
                    library={library}
                    currentFile={currentFile}
                    getLangClient={getLangClient}
                    initialSource={initialSource}
                    undo={undo}
                    redo={redo}
                    hasRedo={undoRedoManager.hasRedo()}
                    hasUndo={undoRedoManager.hasUndo()}
                    diagnostics={stmtDiagnostics}
                    lsSuggestions={lsSuggestionsList}
                >
                    <ViewContainer
                        label={label}
                        formArgs={formArgs}
                        config={config}
                        isStatementValid={!stmtDiagnostics.length}
                        onWizardClose={onWizardClose}
                        onCancel={onCancel}
                    />
                </StatementEditorContextProvider>
            </>
        )
    )
}
