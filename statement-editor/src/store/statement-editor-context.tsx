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

import { LibraryKind, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { LowCodeEditorProps } from "../components/StatementEditorWrapper";
import { EditorModel, StmtDiagnostic, SuggestionItem } from "../models/definitions";

import { InputEditorContextProvider } from "./input-editor-context";

export const StatementEditorContext = React.createContext({
    modelCtx: {
        initialSource: '',
        statementModel: null,
        currentModel: null,
        changeCurrentModel: (model: STNode) => {},
        handleChange: (codeSnippet: string, isEditedViaInputEditor?: boolean) => {},
        updateModel: (codeSnippet: string, position: NodePosition) => {},
        undo: () => undefined,
        redo: () => undefined,
        hasUndo: false,
        hasRedo: false,
    },
    statementCtx: {
        diagnostics: []
    },
    suggestionsCtx: {
        lsSuggestions: []
    },
    modules: {
        modulesToBeImported: new Set(),
        updateModuleList: (module: string) => {}
    },
    formCtx: null,
    config: {
        type: ''
    },
    editorCtx: {
        switchEditor: (index: number) => undefined,
        updateEditor: (index: number, newContent: EditorModel) => undefined,
        dropLastEditor: () => undefined,
        addConfigurable: (newLabel: string, newPosition: NodePosition, newSource: string) => undefined,
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
    syntaxTree: null,
    importStatements: [],
    handleStmtEditorToggle: () => undefined,
    onWizardClose: () => undefined,
    onCancel: () => undefined,
    experimentalEnabled: false
});

export interface CtxProviderProps extends LowCodeEditorProps {
    children?: React.ReactNode,
    model: STNode,
    currentModel: { model: STNode },
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
    diagnostics?: StmtDiagnostic[],
    lsSuggestions?: SuggestionItem[],
    handleStmtEditorToggle: () => void,
    editorManager: {
        switchEditor?: (index: number) => void,
        updateEditor?: (index: number, newContent: EditorModel) => void,
        dropLastEditor?: () => void,
        addConfigurable?: (newLabel: string, newPosition: NodePosition, newSource: string) => void,
        activeEditorId?: number,
        editors?: EditorModel[]
    }
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
        editorManager,
        config,
        formArgs,
        importStatements,
        experimentalEnabled,
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
                },
                statementCtx: {
                    diagnostics
                },
                suggestionsCtx: {
                    lsSuggestions
                },
                modules: {
                    modulesToBeImported,
                    updateModuleList: handleModules
                },
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
                importStatements,
                experimentalEnabled,
                ...restProps
            }}
        >
            <InputEditorContextProvider>
                {children}
            </InputEditorContextProvider>
        </StatementEditorContext.Provider>
    );
}
