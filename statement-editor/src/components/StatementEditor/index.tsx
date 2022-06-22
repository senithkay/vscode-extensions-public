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

import { SymbolInfoResponse } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker, STNode, traversNode } from "@wso2-enterprise/syntax-tree";
import * as monaco from "monaco-editor";
import { Diagnostic } from "vscode-languageserver-protocol";

import { CUSTOM_CONFIG_TYPE, DEFAULT_INTERMEDIATE_CLAUSE } from "../../constants";
import {
    CurrentModel,
    EditorModel,
    EmptySymbolInfo,
    LSSuggestions,
    StmtDiagnostic,
    SuggestionItem
} from "../../models/definitions";
import { StatementEditorContextProvider } from "../../store/statement-editor-context";
import {
    addToTargetPosition,
    eligibleForLevelTwoSuggestions,
    enclosableWithParentheses,
    enrichModel,
    getCurrentModel,
    getFilteredDiagnosticMessages,
    getNextNode,
    getPreviousNode,
    getSelectedModelPosition,
    getUpdatedSource,
    isBindingPattern,
    isOperator,
} from "../../utils";
import { KeyboardNavigationManager } from '../../utils/keyboard-navigation-manager';
import {
    getCompletions,
    getDiagnostics,
    getPartialSTForModuleMembers,
    getPartialSTForStatement,
    getSymbolDocumentation,
    sendDidChange
} from "../../utils/ls-utils";
import { StatementEditorViewState } from "../../utils/statement-editor-viewstate";
import { StackElement } from "../../utils/undo-redo";
import { visitor as CommonParentFindingVisitor } from "../../visitors/common-parent-finding-visitor";
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
    const initSymbolInfo : EmptySymbolInfo = {}

    const [model, setModel] = useState<STNode>(null);
    const [currentModel, setCurrentModel] = useState<CurrentModel>({ model });
    const [hasSyntaxDiagnostics, setHasSyntaxDiagnostics] = useState<boolean>(false);
    const [stmtDiagnostics, setStmtDiagnostics] = useState<StmtDiagnostic[]>([]);
    const [moduleList, setModuleList] = useState(new Set<string>());
    const [lsSuggestionsList, setLSSuggestionsList] = useState<LSSuggestions>({ directSuggestions: [] });
    const [documentation, setDocumentation] = useState<SymbolInfoResponse | EmptySymbolInfo>(initSymbolInfo);
    const [isRestArg, setRestArg] = useState(false);

    const undo = async () => {
        const undoItem = undoRedoManager.getUndoModel();
        if (undoItem) {
            const updatedContent = getUpdatedSource(undoItem.oldModel.model.source, currentFile.content,
                targetPosition, moduleList);
            sendDidChange(fileURI, updatedContent, getLangClient).then();
            const diagnostics = await handleDiagnostics(undoItem.oldModel.model.source);
            setStmtModel(undoItem.oldModel.model, diagnostics);

            const newCurrentModel = getCurrentModel(undoItem.oldModel.selectedPosition, enrichModel(undoItem.oldModel.model, targetPosition));
            setCurrentModel({model: newCurrentModel});
            await handleDocumentation(newCurrentModel);
        }
        setHasSyntaxDiagnostics(false);
    };

    const redo = async () => {
        const redoItem = undoRedoManager.getRedoModel();
        if (redoItem) {
            const updatedContent = getUpdatedSource(redoItem.newModel.model.source, currentFile.content,
                targetPosition, moduleList);
            sendDidChange(fileURI, updatedContent, getLangClient).then();
            const diagnostics = await handleDiagnostics(redoItem.newModel.model.source);
            setStmtModel(redoItem.newModel.model, diagnostics);

            const newCurrentModel = getCurrentModel(redoItem.newModel.selectedPosition, enrichModel(redoItem.newModel.model, targetPosition));
            setCurrentModel({model: newCurrentModel});
            await handleDocumentation(newCurrentModel);
        }
        setHasSyntaxDiagnostics(false);
    };

    useEffect(() => {
        (async () => {
            if (!newConfigurableName) {
                const updatedContent = getUpdatedSource(source.trim(), currentFile.content, targetPosition, moduleList);

                sendDidChange(fileURI, updatedContent, getLangClient).then();
                const diagnostics = await handleDiagnostics(source);

                const newCurrentModel: STNode = selectedNodePosition
                    ? getCurrentModel(selectedNodePosition, editorModel) : undefined;

                setStmtModel(editorModel, diagnostics);
                setCurrentModel({ model: newCurrentModel });
                await handleDocumentation(newCurrentModel);
            }
        })();
    }, [editor]);

    useEffect(() => {
        (async () => {
            if (model && currentModel.model) {
                let directSuggestions: SuggestionItem[] = [];
                let secondLevelSuggestions: SuggestionItem[] = [];
                const currentModelViewState = currentModel.model?.viewState as StatementEditorViewState;
                const selection = currentModel.model.source
                    ? currentModel.model.source.trim()
                    : currentModel.model.value.trim();
                const selectionWithDot = enclosableWithParentheses(currentModel.model)
                    ? `(${selection}).`
                    : `${selection}.`;

                if (!isOperator(currentModelViewState.modelType) && !isBindingPattern(currentModelViewState.modelType)) {
                    const statements = [model.source];
                    if (eligibleForLevelTwoSuggestions(currentModel.model, selection)) {
                        const dotAdded = addToTargetPosition(model.source, currentModel.model.position, selectionWithDot);
                        statements.push(dotAdded);
                    }

                    for (const statement of statements) {
                        const index = statements.indexOf(statement);
                        const updatedContent = getUpdatedSource(statement, currentFile.content,
                            targetPosition, moduleList);
                        await sendDidChange(fileURI, updatedContent, getLangClient);
                        let completions: SuggestionItem[];

                        if (index === 0) {
                            directSuggestions = await getCompletions(fileURI, targetPosition, model, currentModel,
                                getLangClient);
                        } else {
                            completions = await getCompletions(fileURI, targetPosition, model, currentModel,
                                getLangClient, selectionWithDot);
                            secondLevelSuggestions = completions.map((suggestionItem) => ({
                                ...suggestionItem,
                                prefix: `${selectionWithDot}`
                            }));
                        }
                    }
                }
                setLSSuggestionsList({
                    directSuggestions,
                    secondLevelSuggestions: !!secondLevelSuggestions.length && {
                        selection: selectionWithDot,
                        secondLevelSuggestions
                    }
                });
                await handleDocumentation(currentModel.model);
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

    const restArg = (restCheckClicked: boolean) => {
        setRestArg(restCheckClicked);
    }

    const handleChange = async (newValue: string) => {
        const updatedStatement = addToTargetPosition(model.source, currentModel.model.position, newValue);
        const updatedContent = getUpdatedSource(updatedStatement, currentFile.content, targetPosition, moduleList);

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
            partialST = isConfigurableStmt
                ? await getPartialSTForModuleMembers({ codeSnippet }, getLangClient)
                : await getPartialSTForStatement({ codeSnippet }, getLangClient);
        }

        const updatedContent = getUpdatedSource(partialST.source, currentFile.content, targetPosition, moduleList);
        sendDidChange(fileURI, updatedContent, getLangClient).then();
        const diagnostics = await handleDiagnostics(partialST.source);

        if (!partialST.syntaxDiagnostics.length || config.type === CUSTOM_CONFIG_TYPE) {
            setStmtModel(partialST, diagnostics);
            const selectedPosition = getSelectedModelPosition(codeSnippet, position);
            const oldModel : StackElement = {
                model: existingModel,
                selectedPosition: currentModel.model.position
            }
            const newModel : StackElement = {
                model: partialST,
                selectedPosition
            }
            undoRedoManager.add(oldModel, newModel);

            const newCurrentModel = getCurrentModel(selectedPosition, enrichModel(partialST, targetPosition));
            setCurrentModel({model: newCurrentModel});
            setHasSyntaxDiagnostics(false);

        } else if (partialST.syntaxDiagnostics.length){
            setHasSyntaxDiagnostics(true);
        }
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
        setLSSuggestionsList({
            directSuggestions: lsSuggestions
        });
    }

    const handleDiagnostics = async (statement: string): Promise<Diagnostic[]> => {
        const diagResp = await getDiagnostics(fileURI, getLangClient);
        const diag  = diagResp[0]?.diagnostics ? diagResp[0].diagnostics : [];
        removeUnusedModules(diag);
        const messages = getFilteredDiagnosticMessages(statement, targetPosition, diag);
        setStmtDiagnostics(messages);
        return diag;
    }

    const handleDocumentation = async (newCurrentModel: STNode) => {
        if (newCurrentModel && STKindChecker.isFunctionCall(newCurrentModel)){
            setDocumentation(await getSymbolDocumentation(fileURI, targetPosition, newCurrentModel, getLangClient));
        } else {
            setDocumentation(initSymbolInfo)
        }
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

    const currentModelHandler = (cModel: STNode, stmtPosition?: NodePosition, isShift?: boolean) => {
        if (isShift){
            CommonParentFindingVisitor.setPositions(cModel.position, currentModel.model.position);
            traversNode(model, CommonParentFindingVisitor);
            const parentModel: STNode = CommonParentFindingVisitor.getModel()
            setCurrentModel({
                model: parentModel ? parentModel : cModel,
                stmtPosition: parentModel ? parentModel.position : stmtPosition
            });

        } else if (cModel.value && cModel.value === DEFAULT_INTERMEDIATE_CLAUSE){
            setCurrentModel({
                model: cModel.parent.parent,
                stmtPosition
            });
        } else {
            setCurrentModel({
                model: cModel,
                stmtPosition
            });
        }
    };

    const parentModelHandler = () => {
        setCurrentModel(() => {
            if (!!currentModel.model?.parent){
                return {model: currentModel.model.parent}
            }
            else {
                return currentModel
            }
        });
    }

    const nextModelHandler = () => {
        const nextModel = getNextNode(currentModel.model, model)
        setCurrentModel(() => {
            return {model: nextModel}
        });
    };

    const previousModelHandler = () => {
        const previousModel = getPreviousNode(currentModel.model, model)
        setCurrentModel(() => {
            return {model: previousModel};
        });
    };

    const enterKeyHandler = () => {
        setCurrentModel(() => {
            return {model: currentModel.model, isEntered: true};
        });
    };

    function setStmtModel(editedModel: STNode, diagnostics?: Diagnostic[]) {
        setModel({...enrichModel(editedModel, targetPosition, diagnostics)});
    }

    const keyboardNavigationManager = new KeyboardNavigationManager()

    React.useEffect(() => {

        const client = keyboardNavigationManager.getClient();

        keyboardNavigationManager.bindNewKey(client, ['ctrl+left', 'command+left'], parentModelHandler);
        keyboardNavigationManager.bindNewKey(client, ['ctrl+right', 'command+right'], parentModelHandler);
        keyboardNavigationManager.bindNewKey(client, ['tab'], nextModelHandler);
        keyboardNavigationManager.bindNewKey(client, ['shift+tab'], previousModelHandler);
        keyboardNavigationManager.bindNewKey(client, ['enter'], enterKeyHandler);

        return () => {
            keyboardNavigationManager.resetMouseTrapInstance(client)
        }
    }, [currentModel.model]);


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
                    documentation={documentation}
                    restArg={restArg}
                    hasRestArg={isRestArg}
                    hasSyntaxDiagnostics={hasSyntaxDiagnostics}
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
