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
import React, { useState } from 'react';

import { LibraryKind, STModification } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import { languages } from "monaco-editor";

import { LowCodeEditorProps } from '../components/StatementEditor';

import { InputEditorContextProvider } from "./input-editor-context";
import Diagnostic = languages.typescript.Diagnostic;

export const StatementEditorContext = React.createContext({
    modelCtx: {
        initialSource: '',
        statementModel: null,
        currentModel: null,
        updateModel: (codeSnippet: string, position: NodePosition) => {},
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
    getLangClient: () => (Promise.resolve({} as any)),
    applyModifications: (modifications: STModification[]) => (undefined),
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
    updateModel?: (codeSnippet: string, position: NodePosition) => void,
    formArgs?: any,
    initialSource: string,
    undo?: () => void,
    redo?: () => void,
    hasUndo?: boolean,
    hasRedo?: boolean,
    diagnostics?: Diagnostic[]
}

export const StatementEditorContextProvider = (props: CtxProviderProps) => {
    const {
        children,
        model,
        currentModel,
        importStatements,
        updateModel,
        undo,
        redo,
        hasRedo,
        hasUndo,
        formArgs,
        library,
        initialSource,
        diagnostics,
        ...restProps
    } = props;

    const [moduleList, setModuleList] = useState(new Set<string>());

    const moduleHandler = (module: string) => {
        if (!importStatements.includes(module)) {
            setModuleList((prevModuleList: Set<string>) => {
                return new Set(prevModuleList.add(module));
            });
        }
    };

    return (
        <StatementEditorContext.Provider
            value={{
                modelCtx: {
                    initialSource,
                    statementModel: model,
                    currentModel,
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
                library,
                modules: {
                    modulesToBeImported: moduleList,
                    updateModuleList: moduleHandler
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
