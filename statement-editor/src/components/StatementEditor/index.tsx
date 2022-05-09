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

import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import * as monaco from "monaco-editor";
import { Diagnostic } from "vscode-languageserver-protocol";

import { CUSTOM_CONFIG_TYPE } from "../../constants";
import {
    CurrentModel,
    EditorModel,
    StmtDiagnostic,
    SuggestionItem
} from "../../models/definitions";
import { StatementEditorContextProvider} from "../../store/statement-editor-context";
import {
    addToTargetPosition,
    enrichModel,
    getCurrentModel,
    getFilteredDiagnosticMessages,
    getUpdatedSource,
    isBindingPattern,
    isOperator,
} from "../../utils";
import {
    getCompletions,
    getDiagnostics,
    getPartialSTForModuleMembers,
    getPartialSTForStatement,
    sendDidChange
} from "../../utils/ls-utils";
import { StatementEditorViewState } from "../../utils/statement-editor-viewstate";
import { EXPR_SCHEME, FILE_SCHEME } from "../InputEditor/constants";
import { FormHandlingProps as StmtEditorWrapperProps} from "../StatementEditorWrapper";
import { ViewContainer } from "../ViewContainer";

export interface StatementEditorProps extends StmtEditorWrapperProps {
    editor: EditorModel;
    editorManager: {
        switchEditor: (index: number) => void;
        updateEditor: (index: number, newContent: EditorModel) => void;
        dropLastEditor: (offset?: number) => void;
        addConfigurable: (newLabel: string, newPosition: NodePosition, newSource: string) => void;
        activeEditorId: number;
        editors: EditorModel[];
    };
    onWizardClose: () => void;
    onCancel: () => void;
    onStmtEditorModelChange?: (partialModel: STNode) => void;
}

export function StatementEditor(props: StatementEditorProps) {
    const {
        editor,
        onCancel,
        onWizardClose,
        onStmtEditorModelChange,
        editorManager,
        formArgs,
        config,
        getLangClient,
        applyModifications,
        library,
        currentFile,
        syntaxTree,
        stSymbolInfo,
        importStatements,
        experimentalEnabled,
        handleStmtEditorToggle
    } = props;

    const {
        model: editorModel,
        source,
        position : targetPosition,
        undoRedoManager,
        isConfigurableStmt,
        selectedNodePosition,
        newConfigurableName
    } = editor;
    const {
        editors,
        activeEditorId,
        updateEditor
    } = editorManager;

    const fileURI = monaco.Uri.file(currentFile.path).toString().replace(FILE_SCHEME, EXPR_SCHEME);

    const [model, setModel] = useState<STNode>(null);
    const [currentModel, setCurrentModel] = useState<CurrentModel>({ model });
    const [stmtDiagnostics, setStmtDiagnostics] = useState<StmtDiagnostic[]>([]);
    const [moduleList, setModuleList] = useState(new Set<string>());
    const [lsSuggestionsList, setLSSuggestionsList] = useState([]);

    const undo = async () => {
        const undoItem = undoRedoManager.getUndoModel();
        if (undoItem) {
            const updatedContent = await getUpdatedSource(undoItem.oldModel.source, currentFile.content,
                targetPosition, moduleList);
            sendDidChange(fileURI, updatedContent, getLangClient).then();
            const diagnostics = await handleDiagnostics(undoItem.oldModel.source);
            setStmtModel(undoItem.oldModel, diagnostics);
        }
    };

    const redo = async () => {
        const redoItem = undoRedoManager.getRedoModel();
        if (redoItem) {
            const updatedContent = await getUpdatedSource(redoItem.oldModel.source, currentFile.content,
                targetPosition, moduleList);
            sendDidChange(fileURI, updatedContent, getLangClient).then();
            const diagnostics = await handleDiagnostics(redoItem.oldModel.source);
            setStmtModel(redoItem.newModel, diagnostics);
        }
    };

    useEffect(() => {
        (async () => {
            const updatedContent = await getUpdatedSource(source.trim(), currentFile.content,
                targetPosition, moduleList);

            sendDidChange(fileURI, updatedContent, getLangClient).then();
            const diagnostics = await handleDiagnostics(source);

            setStmtModel(editorModel, diagnostics);
            setCurrentModel({
                model: selectedNodePosition ? getCurrentModel(selectedNodePosition, editorModel) : undefined
            });
        })();
    }, [editor]);

    useEffect(() => {
        (async () => {
            if (model && currentModel.model) {
                let lsSuggestions : SuggestionItem[] = [];
                const currentModelViewState = currentModel.model?.viewState as StatementEditorViewState;

                if (!isOperator(currentModelViewState.modelType) && !isBindingPattern(currentModelViewState.modelType)) {
                    const content: string = addToTargetPosition(currentFile.content, targetPosition, model.source);
                    sendDidChange(fileURI, content, getLangClient).then();
                    lsSuggestions = await getCompletions(fileURI, targetPosition, model,
                        currentModel, getLangClient);
                }
                setLSSuggestionsList(lsSuggestions);
            }
        })();
    }, [currentModel.model]);

    useEffect(() => {
        (async () => {
            if (config.type !== CUSTOM_CONFIG_TYPE) {
                if (editorModel && newConfigurableName) {
                    await updateModel(newConfigurableName, selectedNodePosition, editorModel);
                    updateEditor(activeEditorId, {...editors[activeEditorId], newConfigurableName: undefined});
                }
            }
        })();
    }, [currentFile.content]);

    useEffect(() => {
        if (!!model) {
            onStmtEditorModelChange(model);
        }
    }, [model]);

    const handleChange = async (newValue: string) => {
        const updatedStatement = addToTargetPosition(model.source, currentModel.model.position, newValue);
        const updatedContent = await getUpdatedSource(updatedStatement, currentFile.content,
            targetPosition, moduleList);

        sendDidChange(fileURI, updatedContent, getLangClient).then();
        handleDiagnostics(updatedStatement).then();
        handleCompletions(newValue).then();
    }

    const updateModel = async (codeSnippet: string, position: NodePosition, stmtModel?: STNode) => {
        const existingModel = stmtModel || model;
        let partialST: STNode;
        if (existingModel) {
            const stModification = {
                startLine: position.startLine,
                startColumn: position.startColumn,
                endLine: position.endLine,
                endColumn: position.endColumn,
                newCodeSnippet: codeSnippet
            }
            partialST = STKindChecker.isModuleVarDecl(existingModel)
                ? await getPartialSTForModuleMembers({ codeSnippet: existingModel.source , stModification }, getLangClient)
                : await getPartialSTForStatement({ codeSnippet: existingModel.source , stModification }, getLangClient);
        } else {
            partialST = await getPartialSTForStatement({ codeSnippet }, getLangClient);
        }

        undoRedoManager.add(existingModel, partialST);

        const updatedContent = await getUpdatedSource(partialST.source, currentFile.content, targetPosition,
            moduleList);
        sendDidChange(fileURI, updatedContent, getLangClient).then();
        const diagnostics = await handleDiagnostics(partialST.source);

        if (!partialST.syntaxDiagnostics.length || config.type === CUSTOM_CONFIG_TYPE) {
            setStmtModel(partialST, diagnostics);
        }

        const currentModelPosition : NodePosition = {
            ...position,
            endColumn: position.startColumn + codeSnippet.length
        };

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

    const handleDiagnostics = async (statement: string): Promise<Diagnostic[]> => {
        const diagResp = await getDiagnostics(fileURI, getLangClient);
        const diag  = diagResp[0]?.diagnostics ? diagResp[0].diagnostics : [];
        removeUnusedModules(diag);
        const messages = getFilteredDiagnosticMessages(statement, targetPosition, diag);
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

    function setStmtModel(editedModel: STNode, diagnostics?: Diagnostic[]) {
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
                    initialSource={source}
                    undo={undo}
                    redo={redo}
                    hasRedo={undoRedoManager.hasRedo()}
                    hasUndo={undoRedoManager.hasUndo()}
                    diagnostics={stmtDiagnostics}
                    lsSuggestions={lsSuggestionsList}
                    editorManager={editorManager}
                    targetPosition={targetPosition}
                    config={config}
                    formArgs={formArgs}
                    getLangClient={getLangClient}
                    applyModifications={applyModifications}
                    currentFile={currentFile}
                    library={library}
                    importStatements={importStatements}
                    syntaxTree={syntaxTree}
                    stSymbolInfo={stSymbolInfo}
                    experimentalEnabled={experimentalEnabled}
                    onWizardClose={onWizardClose}
                    onCancel={onCancel}
                    handleStmtEditorToggle={handleStmtEditorToggle}
                >
                    <ViewContainer
                        isStatementValid={!stmtDiagnostics.length}
                        isConfigurableStmt={isConfigurableStmt}
                    />
                </StatementEditorContextProvider>
            </>
        )
    )
}
