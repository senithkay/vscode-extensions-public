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
import React, { useEffect, useRef, useState } from 'react';

import { KeyboardNavigationManager } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode, traversNode } from "@wso2-enterprise/syntax-tree";
import * as monaco from "monaco-editor";
import { Diagnostic } from "vscode-languageserver-protocol";

import { ACTION, CONNECTOR, CUSTOM_CONFIG_TYPE, DEFAULT_INTERMEDIATE_CLAUSE } from "../../constants";
import {
    CurrentModel,
    DocumentationInfo,
    EditorModel,
    LSSuggestions,
    StatementSyntaxDiagnostics,
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
    getNextNode, getParentFunctionModel,
    getPreviousNode,
    getSelectedModelPosition,
    getStatementIndex,
    getStatementPosition,
    getUpdatedSource,
    isBindingPattern,
    isDocumentationSupportedModel,
    isModuleMember,
    isOperator,
} from "../../utils";
import {
    getCodeAction,
    getCompletions,
    getDiagnostics,
    getPartialSTForExpression,
    getPartialSTForModuleMembers,
    getPartialSTForStatement,
    getSymbolDocumentation,
    sendDidChange
} from "../../utils/ls-utils";
import { StatementEditorViewState } from "../../utils/statement-editor-viewstate";
import { StackElement } from "../../utils/undo-redo";
import { visitor as CommonParentFindingVisitor } from "../../visitors/common-parent-finding-visitor";
import { LowCodeEditorProps } from "../StatementEditorWrapper";
import { ViewContainer } from "../ViewContainer";

export interface StatementEditorProps extends LowCodeEditorProps {
    editor: EditorModel;
    editorManager: {
        switchEditor: (index: number) => void;
        updateEditor: (index: number, newContent: EditorModel) => void;
        dropLastEditor: (offset?: number) => void;
        addConfigurable: (newLabel: string, newPosition: NodePosition, newSource: string) => void;
        activeEditorId: number;
        editors: EditorModel[];
    };
    extraModules?: Set<string>;
    onWizardClose: () => void;
    onCancel: () => void;
    isHeaderHidden?: boolean;
    skipSemicolon?: boolean;
}

export function StatementEditor(props: StatementEditorProps) {
    const {
        editor,
        onCancel,
        onWizardClose,
        editorManager,
        formArgs,
        config,
        getLangClient,
        applyModifications,
        updateFileContent,
        library,
        currentFile,
        syntaxTree,
        stSymbolInfo,
        importStatements,
        experimentalEnabled,
        extraModules,
        runBackgroundTerminalCommand,
        isExpressionMode,
        ballerinaVersion,
        openExternalUrl,
        isCodeServerInstance,
        isHeaderHidden,
        skipSemicolon
    } = props;

    const {
        model: editorModel,
        source,
        position: targetPosition,
        undoRedoManager,
        isConfigurableStmt,
        isModuleVar,
        selectedNodePosition,
        newConfigurableName,
        hasIncorrectSyntax
    } = editor;
    const {
        editors,
        activeEditorId,
        updateEditor
    } = editorManager;

    const fileURI = monaco.Uri.file(currentFile.path).toString();
    const initSymbolInfo : DocumentationInfo = {
        modelPosition: null,
        documentation: {}
    }
    const skipStatementSemicolon = isExpressionMode || skipSemicolon || false;

    const [model, setModel] = useState<STNode>(null);
    const [currentModel, setCurrentModel] = useState<CurrentModel>({ model });
    const [hasSyntaxDiagnostics, setHasSyntaxDiagnostics] = useState<boolean>(hasIncorrectSyntax);
    const [stmtDiagnostics, setStmtDiagnostics] = useState<StatementSyntaxDiagnostics[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>();
    const [moduleList, setModuleList] = useState(extraModules?.size > 0 ? extraModules : new Set<string>());
    const [lsSuggestionsList, setLSSuggestionsList] = useState<LSSuggestions>({ directSuggestions: [] });
    const [documentation, setDocumentation] = useState<DocumentationInfo>(initSymbolInfo);
    const [isRestArg, setRestArg] = useState(false);
    const [isPullingModule, setIsPullingModule] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDisableEditor, setIsDisableEditor] = useState(false);
    const [draftSource, setDraftSource] = useState(source);
    const [draftPosition, setDraftPosition] = useState(targetPosition);
    const pulledModules = useRef<string[]>([]);

    const undo = async () => {
        const undoItem = undoRedoManager.getUndoModel();
        if (hasSyntaxDiagnostics) {
            const currentSource = (currentModel.model?.value) ? currentModel.model.value : currentModel.model.source;
            handleChange(currentSource).then();
        } else if (undoItem) {
            await updateDraftFileContent(undoItem.oldModel.model.source, currentFile.content);
            const diagnostics = await handleDiagnostics(undoItem.oldModel.model.source);
            setStmtModel(undoItem.oldModel.model, diagnostics);

            const newCurrentModel = getCurrentModel(undoItem.oldModel.selectedPosition, enrichModel(undoItem.oldModel.model, targetPosition));
            setCurrentModel({ model: newCurrentModel });
            await handleDocumentation(newCurrentModel);
        }
        setHasSyntaxDiagnostics(false);
    };

    const redo = async () => {
        const redoItem = undoRedoManager.getRedoModel();
        if (redoItem) {
            await updateDraftFileContent(redoItem.newModel.model.source, currentFile.content);
            const diagnostics = await handleDiagnostics(redoItem.newModel.model.source);
            setStmtModel(redoItem.newModel.model, diagnostics);

            const newCurrentModel = getCurrentModel(redoItem.newModel.selectedPosition, enrichModel(redoItem.newModel.model, targetPosition));
            setCurrentModel({ model: newCurrentModel });
            await handleDocumentation(newCurrentModel);
        }
        setHasSyntaxDiagnostics(false);
    };

    useEffect(() => {
        (async () => {
            if (!newConfigurableName) {
                await updateDraftFileContent(source.trim(), currentFile.content);
                await handleDiagnostics(source);

                const newCurrentModel: STNode = selectedNodePosition
                    ? getCurrentModel(selectedNodePosition, editorModel) : undefined;

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
                            targetPosition, moduleList, skipStatementSemicolon);
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

                            const content = getUpdatedSource(model.source, currentFile.content,
                                targetPosition, moduleList, skipStatementSemicolon);
                            await sendDidChange(fileURI, content, getLangClient);
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
            if (config?.type !== CUSTOM_CONFIG_TYPE && editorModel && newConfigurableName) {
                await updateModel(newConfigurableName, selectedNodePosition, editorModel);
                updateEditor(activeEditorId, { ...editors[activeEditorId], newConfigurableName: undefined });
            } else if (currentModel.model !== null && !newConfigurableName && currentFile.content !== draftSource) {
                setIsDisableEditor(true); // FIXME: update st-editor disable logic to identify active statement changes
            }
        })();
    }, [currentFile.content]);

    useEffect(() => {
        (async () => {
            if (editorModel) {
                await updateEditorModel();
            }
        })();
    }, [editorModel]);

    const updateEditorModel = async () => {
        const { updatedPosition } = await updateDraftFileContent(source.trim(), currentFile.content);

        const diagnostics = await handleDiagnostics(source, updatedPosition);
        setStmtModel(editorModel, diagnostics);
    }

    const restArg = (restCheckClicked: boolean) => {
        setRestArg(restCheckClicked);
    }

    const handleChange = async (newValue: string) => {
        const updatedStatement = addToTargetPosition(model.source, currentModel.model.position, newValue);
        await updateDraftFileContent(updatedStatement, currentFile.content);

        handleDiagnostics(updatedStatement).then();
        handleCompletions(newValue).then();
    }

    const updateDraftFileContent = async (statement: string, fileContent: string) => {
        const updatedContent = getUpdatedSource(statement, fileContent, targetPosition, moduleList, skipStatementSemicolon);
        const stmtIndex = getStatementIndex(updatedContent, statement, targetPosition);
        const newTargetPosition = getStatementPosition(updatedContent, statement, stmtIndex);

        await updateFileContent(updatedContent, true);

        setDraftSource(updatedContent);
        setDraftPosition(newTargetPosition);

        return {
            updatedContent,
            updatedPosition: newTargetPosition,
        };
    };

    const updateSyntaxDiagnostics = (hasSyntaxIssues: boolean) => {
        setHasSyntaxDiagnostics(hasSyntaxIssues);
    }

    const updateEditing = (editing: boolean) => {
        setIsEditing(editing);
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
            partialST = isModuleMember(existingModel)
                ? await getPartialSTForModuleMembers({ codeSnippet: existingModel.source , stModification }, getLangClient)
                : (isExpressionMode ? await getPartialSTForExpression({ codeSnippet: existingModel.source , stModification }, getLangClient)
                : await getPartialSTForStatement({ codeSnippet: existingModel.source , stModification }, getLangClient));
        } else {
            partialST = (isConfigurableStmt || isModuleVar)
                ? await getPartialSTForModuleMembers({ codeSnippet }, getLangClient)
                : await getPartialSTForStatement({ codeSnippet }, getLangClient);
        }

        if (!partialST.syntaxDiagnostics.length || (!isExpressionMode && config.type === CUSTOM_CONFIG_TYPE)) {
            await updateDraftFileContent(partialST.source, currentFile.content);
            const diagnostics = await handleDiagnostics(partialST.source);
            setStmtModel(partialST, diagnostics);
            const selectedPosition = getSelectedModelPosition(codeSnippet, position);
            const oldModel: StackElement = {
                model: existingModel,
                selectedPosition: currentModel.model ? currentModel.model.position : position
            }
            const newModel: StackElement = {
                model: partialST,
                selectedPosition
            }
            undoRedoManager.add(oldModel, newModel);

            const newCurrentModel = getCurrentModel(selectedPosition, enrichModel(partialST, targetPosition));
            setCurrentModel({ model: newCurrentModel });
            setHasSyntaxDiagnostics(false);

        } else if (partialST.syntaxDiagnostics.length){
            const updatedStatement = addToTargetPosition(model.source, currentModel.model.position, codeSnippet);
            await updateDraftFileContent(updatedStatement, currentFile.content);
            handleDiagnostics(updatedStatement).then();
            setHasSyntaxDiagnostics(true);
        }
    }

    const updateStatementModel = async (updatedStatement: string, updatedSource: string, position: NodePosition) => {
        await updateFileContent(updatedSource, true);
        setDraftSource(updatedSource);
        setDraftPosition(position);
        const partialST = isModuleMember(model)
            ? await getPartialSTForModuleMembers({ codeSnippet: updatedStatement }, getLangClient)
            : (isExpressionMode ? await getPartialSTForExpression({ codeSnippet: updatedStatement }, getLangClient)
                : await getPartialSTForStatement({ codeSnippet: updatedStatement }, getLangClient));

        if (!partialST.syntaxDiagnostics.length || config.type === CUSTOM_CONFIG_TYPE) {
            const diagnostics = await handleDiagnostics(partialST.source);
            setStmtModel(partialST, diagnostics);
            const selectedPosition = getSelectedModelPosition(updatedStatement, position);
            const oldModel: StackElement = {
                model,
                selectedPosition: currentModel.model.position
            }
            const newModel: StackElement = {
                model: partialST,
                selectedPosition
            }
            undoRedoManager.add(oldModel, newModel);

            const newCurrentModel = getCurrentModel(selectedPosition, enrichModel(partialST, targetPosition));
            setCurrentModel({ model: newCurrentModel });
            setHasSyntaxDiagnostics(false);

        } else if (partialST.syntaxDiagnostics.length){
            handleDiagnostics(updatedStatement).then();
            setHasSyntaxDiagnostics(true);
        }
    }

    const handleModules = (module: string) => {
        let moduleIncluded: boolean;
        importStatements?.forEach(importedModule => {
            if (importedModule.includes(module)) {
                moduleIncluded = true;
            }
        });

        if (!moduleIncluded) {
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

    const handleDiagnostics = async (statement: string, targetedPosition?: NodePosition): Promise<Diagnostic[]> => {
        const diagResp = await getDiagnostics(fileURI, getLangClient);
        const diag  = diagResp[0]?.diagnostics ? diagResp[0].diagnostics : [];
        if (config.type === CONNECTOR){
            pullUnresolvedModules(diag).then();
        }
        if (config.type !== CONNECTOR && config.type !== ACTION){
            removeUnusedModules(diag);
        }
        const filteredDiagnostics = getFilteredDiagnosticMessages(statement, (targetedPosition || draftPosition), diag);
        const messagesWithCodeActions = await handleCodeAction(filteredDiagnostics);
        setStmtDiagnostics(messagesWithCodeActions);
        return diag;
    }

    const handleCodeAction = async (
        filteredDiagnostics: StatementSyntaxDiagnostics[]
    ): Promise<StatementSyntaxDiagnostics[]> => {
        for (const diagnostic of filteredDiagnostics) {
            if (diagnostic.diagnostic) {
                const codeActionResp = await getCodeAction(fileURI, diagnostic.diagnostic, getLangClient);
                if (codeActionResp) {
                    diagnostic.codeActions = codeActionResp;
                }
            }
        }
        return filteredDiagnostics;
    };

    const handleDocumentation = async (newCurrentModel: STNode) => {
        if (config.type === CONNECTOR || config.type === ACTION){
            return setDocumentation(initSymbolInfo);
        }
        if (newCurrentModel && isDocumentationSupportedModel(newCurrentModel)){
            setDocumentation({
                modelPosition: newCurrentModel.position,
                documentation: await getSymbolDocumentation(fileURI, draftPosition, newCurrentModel, getLangClient)
            });
        } else {
            if (newCurrentModel && (newCurrentModel.parent?.viewState as StatementEditorViewState)?.parentFunctionPos){
                const parentModel =
                    getParentFunctionModel((newCurrentModel.parent.viewState as StatementEditorViewState)?.parentFunctionPos,
                        model);

                if (isDocumentationSupportedModel(parentModel) && parentModel.position !== documentation.modelPosition){
                    setDocumentation({
                        modelPosition: (newCurrentModel.parent.viewState as StatementEditorViewState)?.parentFunctionPos,
                        documentation: await getSymbolDocumentation(fileURI, draftPosition, parentModel, getLangClient)
                    });
                }
            } else {
                setDocumentation(initSymbolInfo);
            }
        }
    };

    const removeUnusedModules = (completeDiagnostic: Diagnostic[]) => {
        if (!!moduleList.size) {
            const unusedModuleName = new RegExp(/'(.*?[^\\])'/g);
            completeDiagnostic.forEach(diagnostic => {
                let extracted;
                if (diagnostic.message.includes("unused module prefix '")) {
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

    const pullUnresolvedModules = async (completeDiagnostic: Diagnostic[]) => {
        if (!(!!moduleList?.size && runBackgroundTerminalCommand && !isPullingModule)) {
            return;
        }
        let pullCommand = "";
        for (const diagnostic of completeDiagnostic) {
            if (!diagnostic.message?.includes("cannot resolve module '")) {
                continue;
            }
            moduleList.forEach((module) => {
                if (diagnostic.message?.includes(module) && !pulledModules.current.includes(module)) {
                    if (pullCommand !== "") {
                        pullCommand += ` && `;
                    }
                    pullCommand += `bal pull ${module.replace(" as _", "")}`;
                    pulledModules.current.push(module);
                }
            });
        }
        if (pullCommand !== "") {
            setIsPullingModule(true);
            const cmdRes = await runBackgroundTerminalCommand(pullCommand);
            setIsPullingModule(false);
            updateEditorModel().then(() => {
                // HACK: Trying twice to fetch code actions.
                // Because immediate request after module pulling doesn't get any code actions.
                updateEditorModel().then();
            });
            if (cmdRes && cmdRes.error){
                // TODO: Handle module pulling failed error properly
                // tslint:disable-next-line: no-console
                console.error('Module pulling failed!', cmdRes.error);
                updateEditorModel().then();
            }
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

        } else if (cModel.value && cModel.value === DEFAULT_INTERMEDIATE_CLAUSE) {
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
            if (!!currentModel.model?.parent) {
                return { model: currentModel.model.parent }
            }
            else {
                return currentModel
            }
        });
    }

    const nextModelHandler = () => {
        const nextModel = getNextNode(currentModel.model, model)
        setCurrentModel(() => {
            return { model: nextModel }
        });
    };

    const previousModelHandler = () => {
        const previousModel = getPreviousNode(currentModel.model, model)
        setCurrentModel(() => {
            return { model: previousModel };
        });
    };

    const enterKeyHandler = () => {
        setCurrentModel(() => {
            return {model: currentModel.model, isEntered: true};
        });
    };

    function setStmtModel(editedModel: STNode, diagnostics?: Diagnostic[]) {
        setModel({ ...enrichModel(editedModel, targetPosition, diagnostics) });
    }

    async function handleOnCancel(){
        await updateFileContent(currentFile.content);
        onCancel();
    }

    React.useEffect(() => {

        const client = KeyboardNavigationManager.getClient();

        client.bindNewKey(['ctrl+left', 'command+left'], parentModelHandler);
        client.bindNewKey(['ctrl+right', 'command+right'], parentModelHandler);
        client.bindNewKey(['tab'], nextModelHandler);
        client.bindNewKey(['shift+tab'], previousModelHandler);
        client.bindNewKey(['enter'], enterKeyHandler);

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
                    updateStatementModel={updateStatementModel}
                    handleModules={handleModules}
                    modulesToBeImported={moduleList}
                    initialSource={source}
                    draftSource={draftSource}
                    draftPosition={draftPosition}
                    undo={undo}
                    redo={redo}
                    hasRedo={undoRedoManager.hasRedo()}
                    hasUndo={undoRedoManager.hasUndo() || hasSyntaxDiagnostics}
                    diagnostics={stmtDiagnostics}
                    errorMsg={errorMsg}
                    lsSuggestions={lsSuggestionsList}
                    editorManager={editorManager}
                    targetPosition={targetPosition}
                    config={config}
                    formArgs={formArgs}
                    getLangClient={getLangClient}
                    applyModifications={applyModifications}
                    updateFileContent={updateFileContent}
                    currentFile={currentFile}
                    library={library}
                    importStatements={importStatements}
                    syntaxTree={syntaxTree}
                    stSymbolInfo={stSymbolInfo}
                    experimentalEnabled={experimentalEnabled}
                    onWizardClose={onWizardClose}
                    onCancel={handleOnCancel}
                    documentation={documentation}
                    restArg={restArg}
                    hasRestArg={isRestArg}
                    hasSyntaxDiagnostics={hasSyntaxDiagnostics}
                    updateSyntaxDiagnostics={updateSyntaxDiagnostics}
                    editing={isEditing}
                    updateEditing={updateEditing}
                    isExpressionMode={isExpressionMode}
                    ballerinaVersion={ballerinaVersion}
                    isCodeServerInstance={isCodeServerInstance}
                    openExternalUrl={openExternalUrl}
                >
                    <ViewContainer
                        isStatementValid={!stmtDiagnostics.length}
                        isConfigurableStmt={isConfigurableStmt}
                        isPullingModule={isPullingModule}
                        isDisableEditor={isDisableEditor}
                        isHeaderHidden={isHeaderHidden}
                    />
                </StatementEditorContextProvider>
            </>
        )
    )
}
