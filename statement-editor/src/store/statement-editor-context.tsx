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
// tslint:disable: no-empty jsx-no-multiline-js
import React from 'react';

import { LibraryKind, STModification, SymbolInfoResponse } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { LowCodeEditorProps } from "../components/StatementEditorWrapper";
import {
    CurrentModel,
    DocumentationInfo,
    EditorModel,
    EmptySymbolInfo,
    LSSuggestions,
    StatementSyntaxDiagnostics
} from "../models/definitions";

import { InputEditorContextProvider } from "./input-editor-context";

export const StatementEditorContext = React.createContext({
    modelCtx: {
        initialSource: '',
        statementModel: null,
        currentModel: null,
        changeCurrentModel: (model: STNode, stmtPosition?: NodePosition, isShift?: boolean) => {},
        handleChange: (codeSnippet: string, isEditedViaInputEditor?: boolean) => {},
        updateModel: (codeSnippet: string, position: NodePosition) => {},
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
        diagnostics: []
    },
    suggestionsCtx: {
        lsSuggestions: [],
        lsSecondLevelSuggestions: {
            selection: '',
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
    getLangClient: () => (Promise.resolve({} as any)),
    applyModifications: (modifications: STModification[]) => undefined,
    library: {
        getLibrariesList: (kind?: LibraryKind) => (Promise.resolve({} as any)),
        getLibrariesData: () => (Promise.resolve({} as any)),
        getLibraryData: (orgName: string, moduleName: string, version: string) => (Promise.resolve({} as any))
    },
    currentFile: {
        content: "",
        path: "",
        size: 0
    },
    documentation: null,
    syntaxTree: null,
    stSymbolInfo: null,
    importStatements: [],
    onWizardClose: () => undefined,
    onCancel: () => undefined,
    experimentalEnabled: false,
    ballerinaVersion: null
});

export interface CtxProviderProps extends LowCodeEditorProps {
    children?: React.ReactNode,
    model: STNode,
    currentModel: CurrentModel,
    changeCurrentModel?: (model: STNode) => void,
    handleChange?: (codeSnippet: string, isEditedViaInputEditor?: boolean) => void,
    updateModel?: (codeSnippet: string, position: NodePosition) => void,
    handleModules?: (module: string) => void,
    modulesToBeImported?: Set<string>,
    initialSource: string,
    undo?: () => void,
    redo?: () => void,
    hasUndo?: boolean,
    hasRedo?: boolean,
    diagnostics?: StatementSyntaxDiagnostics[],
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
    targetPosition: NodePosition
}

export const StatementEditorContextProvider = (props: CtxProviderProps) => {
    const {
        children,
        model,
        currentModel,
        changeCurrentModel,
        handleChange,
        updateModel,
        handleModules,
        modulesToBeImported,
        undo,
        redo,
        hasRedo,
        hasUndo,
        initialSource,
        diagnostics,
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
        ballerinaVersion,
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
                    diagnostics
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
                ballerinaVersion,
                ...restProps
            }}
        >
            <InputEditorContextProvider>
                {children}
            </InputEditorContextProvider>
        </StatementEditorContext.Provider>
    );
}
