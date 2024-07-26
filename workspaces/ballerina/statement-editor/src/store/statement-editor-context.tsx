/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: no-empty jsx-no-multiline-js
import React from 'react';

import { STModification } from "@wso2-enterprise/ballerina-core";
import { LibraryBrowserRpcClient } from '@wso2-enterprise/ballerina-rpc-client';
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { LowCodeEditorProps } from "../components/StatementEditorWrapper";
import {
    CurrentModel,
    DocumentationInfo,
    EditorModel,
    LSSuggestions,
    StatementSyntaxDiagnostics
} from "../models/definitions";

import { InputEditorContextProvider } from "./input-editor-context";
import { ToolbarContextProvider } from './toolbar-context';

export const StatementEditorContext = React.createContext({
    modelCtx: {
        initialSource: "",
        statementModel: null,
        currentModel: null,
        changeCurrentModel: (model: STNode, stmtPosition?: NodePosition, isShift?: boolean) => {},
        handleChange: (codeSnippet: string, isEditedViaInputEditor?: boolean) => {},
        updateModel: (codeSnippet: string, position: NodePosition, stmtModel?: STNode) => {},
        updateStatementModel: (updatedStatement: string, updatedSource: string, position: NodePosition) => {},
        undo: () => undefined,
        redo: () => undefined,
        hasUndo: false,
        hasRedo: false,
        hasSyntaxDiagnostics: false,
        updateSyntaxDiagnostics: (hasSyntaxIssues: boolean) => {},
        editing: false,
        updateEditing: (editing: boolean) => {},
        restArg: (restCheckClicked: boolean) => undefined,
        hasRestArg: false
    },
    statementCtx: {
        diagnostics: [],
        errorMsg: ""
    },
    suggestionsCtx: {
        lsSuggestions: [],
        lsSecondLevelSuggestions: {
            selection: "",
            secondLevelSuggestions: []
        }
    },
    modules: {
        modulesToBeImported: new Set(),
        updateModuleList: (module: string) => {}
    },
    formCtx: null,
    config: null,
    targetPosition: null,
    editorCtx: {
        switchEditor: (index: number) => undefined,
        updateEditor: (index: number, newContent: EditorModel) => undefined,
        dropLastEditor: (offset?: number) => undefined,
        addConfigurable: (newLabel: string, newPosition: NodePosition, newSource: string, isExistingStmt?: boolean) => undefined,
        activeEditorId: 0,
        editors: []
    },
    langServerRpcClient: null,
    libraryBrowserRpcClient: null as LibraryBrowserRpcClient,
    applyModifications: (modifications: STModification[]) => undefined,
    currentFile: {
        content: "",
        path: "",
        size: 0,
        originalContent: null,
        draftSource: "",
        draftPosition: null,
    },
    documentation: null,
    syntaxTree: null,
    stSymbolInfo: null,
    importStatements: [],
    onWizardClose: (typeName?: string) => undefined,
    onCancel: () => undefined,
    experimentalEnabled: false,
    isExpressionMode: false,
    ballerinaVersion: null,
    isCodeServerInstance: false,
    openExternalUrl: (url: string) => {},
    currentReferences: []
});

export interface CtxProviderProps extends LowCodeEditorProps {
    children?: React.ReactNode,
    model: STNode,
    currentModel: CurrentModel,
    changeCurrentModel?: (model: STNode) => void,
    handleChange?: (codeSnippet: string, isEditedViaInputEditor?: boolean) => void,
    updateModel?: (codeSnippet: string, position: NodePosition, stmtModel?: STNode) => void,
    updateStatementModel?: (updatedStatement: string, updatedSource: string, position: NodePosition) => void,
    handleModules?: (module: string) => void,
    modulesToBeImported?: Set<string>,
    initialSource: string,
    draftSource?: string,
    draftPosition?: NodePosition,
    undo?: () => void,
    redo?: () => void,
    hasUndo?: boolean,
    hasRedo?: boolean,
    diagnostics?: StatementSyntaxDiagnostics[],
    errorMsg?: string,
    lsSuggestions?: LSSuggestions,
    hasSyntaxDiagnostics?: boolean,
    updateSyntaxDiagnostics?: (hasSyntaxIssues: boolean) => void,
    editing?: boolean,
    updateEditing?: (editing: boolean) => void,
    documentation?: DocumentationInfo,
    restArg?: (restCheckClicked: boolean) => void,
    hasRestArg?: boolean,
    editorManager: {
        switchEditor?: (index: number) => void,
        updateEditor?: (index: number, newContent: EditorModel) => void,
        dropLastEditor?: (offset?: number) => void,
        addConfigurable?: (newLabel: string, newPosition: NodePosition, newSource: string) => void,
        activeEditorId?: number,
        editors?: EditorModel[]
    },
    targetPosition: NodePosition,
    currentReferences?: string[]
}

export const StatementEditorContextProvider = (props: CtxProviderProps) => {
    const {
        children,
        model,
        currentModel,
        changeCurrentModel,
        handleChange,
        updateModel,
        updateStatementModel,
        handleModules,
        modulesToBeImported,
        undo,
        redo,
        hasRedo,
        hasUndo,
        initialSource,
        draftSource,
        draftPosition,
        diagnostics,
        errorMsg,
        lsSuggestions,
        documentation,
        restArg,
        hasRestArg,
        editorManager,
        targetPosition,
        config,
        formArgs,
        importStatements,
        experimentalEnabled,
        hasSyntaxDiagnostics,
        updateSyntaxDiagnostics,
        editing,
        updateEditing,
        isExpressionMode,
        currentFile,
        ballerinaVersion,
        isCodeServerInstance,
        openExternalUrl,
        currentReferences,
        langServerRpcClient,
        libraryBrowserRpcClient,
        ...restProps
    } = props;

    return (
        <StatementEditorContext.Provider
            value={{
                modelCtx: {
                    initialSource,
                    statementModel: model,
                    currentModel,
                    changeCurrentModel,
                    handleChange,
                    updateModel,
                    updateStatementModel,
                    undo,
                    redo,
                    hasRedo,
                    hasUndo,
                    restArg,
                    hasRestArg,
                    hasSyntaxDiagnostics,
                    updateSyntaxDiagnostics,
                    editing,
                    updateEditing
                },
                statementCtx: {
                    diagnostics,
                    errorMsg
                },
                suggestionsCtx: {
                    lsSuggestions: lsSuggestions.directSuggestions,
                    lsSecondLevelSuggestions: lsSuggestions?.secondLevelSuggestions
                },
                modules: {
                    modulesToBeImported,
                    updateModuleList: handleModules
                },
                documentation,
                formCtx: formArgs,
                config,
                editorCtx: {
                    switchEditor: editorManager.switchEditor,
                    updateEditor: editorManager.updateEditor,
                    dropLastEditor: editorManager.dropLastEditor,
                    addConfigurable: editorManager.addConfigurable,
                    activeEditorId: editorManager.activeEditorId,
                    editors: editorManager.editors
                },
                targetPosition,
                importStatements,
                experimentalEnabled,
                isExpressionMode,
                currentFile: {
                    ...currentFile,
                    originalContent: currentFile.originalContent,
                    draftSource,
                    draftPosition
                },
                ballerinaVersion,
                isCodeServerInstance,
                openExternalUrl,
                langServerRpcClient,
                libraryBrowserRpcClient,
                currentReferences,
                ...restProps
            }}
        >
            <ToolbarContextProvider>
                <InputEditorContextProvider>
                    {children}
                </InputEditorContextProvider>
            </ToolbarContextProvider>
        </StatementEditorContext.Provider>
    );
}
