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

import { LibraryKind, STModification } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import { languages } from "monaco-editor";

import { LowCodeEditorProps } from '../components/StatementEditor';
import { ModelKind, SuggestionsList } from "../models/definitions";

import { InputEditorContextProvider } from "./input-editor-context";

import Diagnostic = languages.typescript.Diagnostic;

export const StatementEditorContext = React.createContext({
    modelCtx: {
        initialSource: '',
        statementModel: null,
        currentModel: null,
        changeCurrentModel: (model: STNode, kind?: ModelKind) => {},
        handleChange: (newStatement: string) => {},
        updateModel: (codeSnippet: string, position: NodePosition, isEdited?: boolean) => {},
        undo: () => undefined,
        redo: () => undefined,
        hasUndo: false,
        hasRedo: false,
    },
    formCtx: {
        formModelPosition: null
    },
    statementCtx: {
        diagnostics: null
    },
    suggestionsCtx: {
        lsSuggestions: [],
        exprSuggestions: []
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
    modules: {
        modulesToBeImported: new Set(),
        updateModuleList: (module: string) => {}
    }
});

interface CtxProviderProps extends LowCodeEditorProps {
    children?: React.ReactNode,
    model: STNode,
    currentModel: { model: STNode },
    changeCurrentModel?: (model: STNode, kind?: ModelKind) => void,
    handleChange?: (newStatement: string) => void,
    handleModules?: (module: string) => void,
    modulesToBeImported?: Set<string>,
    updateModel?: (codeSnippet: string, position: NodePosition, isEdited?: boolean) => void,
    formArgs?: any,
    initialSource: string,
    undo?: () => void,
    redo?: () => void,
    hasUndo?: boolean,
    hasRedo?: boolean,
    diagnostics?: Diagnostic[],
    suggestions?: SuggestionsList
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
        formArgs,
        library,
        initialSource,
        diagnostics,
        suggestions,
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
                formCtx: {
                    formModelPosition: formArgs.formArgs.targetPosition
                },
                statementCtx: {
                    diagnostics
                },
                suggestionsCtx: {
                    lsSuggestions: suggestions?.lsSuggestions,
                    exprSuggestions: suggestions?.expressionSuggestions
                },
                library,
                modules: {
                    modulesToBeImported,
                    updateModuleList: handleModules
                },
                ...restProps
            }}
        >
            <InputEditorContextProvider>
                {children}
            </InputEditorContextProvider>
        </StatementEditorContext.Provider>
    );
}
