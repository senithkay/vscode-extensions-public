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

import { LowCodeEditorProps } from "../components/Editors";
import { StmtEditorManager, StmtEditorStackItem } from "../utils/editors";

export const StatementEditorWrapperContext = React.createContext({
    formCtx: null,
    config: {
        type: ''
    },
    editorCtx: {
        editorManager: null,
        editors: [],
        handleConfigurable: (index: number) => undefined,
        addConfigurable: (newLabel: string, newPosition: NodePosition, newSource: string) => undefined
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
    importStatements: []
});

interface SEWrapperCtxProviderProps extends LowCodeEditorProps {
    children?: React.ReactNode,
    config?: {type: string, model?: STNode},
    formArgs?: any,
    handleConfigurable?: (index: number) => void,
    addConfigurable?: (newLabel: string, newPosition: NodePosition, newSource: string) => void,
    editors?: StmtEditorStackItem[],
    editorManager?: StmtEditorManager
}

export const StatementEditorWrapperContextProvider = (props: SEWrapperCtxProviderProps) => {
    const {
        children,
        config,
        formArgs,
        handleConfigurable,
        addConfigurable,
        editors,
        editorManager,
        importStatements,
        ...restProps
    } = props;

    return (
        <StatementEditorWrapperContext.Provider
            value={{
                formCtx: formArgs,
                config,
                editorCtx: {
                    editorManager,
                    editors,
                    handleConfigurable,
                    addConfigurable
                },
                importStatements,
                ...restProps
            }}
        >
            {children}
        </StatementEditorWrapperContext.Provider>
    );
}
