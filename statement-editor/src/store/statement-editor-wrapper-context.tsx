/*
 * Copyright (c) 2022 WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { LowCodeEditorProps } from "../components/StatementEditorWrapper";
import { EditorModel } from "../models/definitions";

export const StatementEditorWrapperContext = React.createContext({
    formCtx: null,
    config: {
        type: ''
    },
    editorCtx: {
        editors: [],
        switchEditor: (index: number) => undefined,
        updateEditor: (index: number, newContent: EditorModel) => undefined,
        dropLastEditor: () => undefined,
        addConfigurable: (newLabel: string, newPosition: NodePosition, newSource: string) => undefined,
        activeEditorId: 0
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
    experimentalEnabled: false
});

interface SEWrapperCtxProviderProps extends LowCodeEditorProps {
    children?: React.ReactNode,
    config?: {type: string, model?: STNode},
    formArgs?: any,
    switchEditor?: (index: number) => void,
    updateEditor?: (index: number, newContent: EditorModel) => void,
    dropLastEditor?: () => void,
    addConfigurable?: (newLabel: string, newPosition: NodePosition, newSource: string) => void,
    activeEditorId?: number,
    editors?: EditorModel[],
    handleStmtEditorToggle?: () => void
}

export const StatementEditorWrapperContextProvider = (props: SEWrapperCtxProviderProps) => {
    const {
        children,
        config,
        formArgs,
        switchEditor,
        updateEditor,
        dropLastEditor,
        addConfigurable,
        activeEditorId,
        editors,
        importStatements,
        experimentalEnabled,
        handleStmtEditorToggle,
        ...restProps
    } = props;

    return (
        <StatementEditorWrapperContext.Provider
            value={{
                formCtx: formArgs,
                config,
                editorCtx: {
                    editors,
                    switchEditor,
                    updateEditor,
                    dropLastEditor,
                    addConfigurable,
                    activeEditorId
                },
                importStatements,
                experimentalEnabled,
                handleStmtEditorToggle,
                ...restProps
            }}
        >
            {children}
        </StatementEditorWrapperContext.Provider>
    );
}
