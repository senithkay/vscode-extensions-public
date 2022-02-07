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

import { LowCodeEditorProps } from '../components/ViewContainer/ViewContainer';

import { InputEditorContextProvider } from "./input-editor-context";

export const StatementEditorContext = React.createContext({
    modelCtx: {
        statementModel: null,
        currentModel: null,
        updateModel: (codeSnippet: string, position: NodePosition) => {}
    },
    formCtx: {
        formModelPosition: null
    },
    statementCtx: {
        validateStatement: (isValid: boolean) => {}
    },
    getLangClient: () => (Promise.resolve({} as any)),
    applyModifications: (modifications: STModification[]) => (undefined),
    library: {
        getLibrariesList: (kind: LibraryKind) => (Promise.resolve({} as any)),
        getLibrariesData: () => (Promise.resolve({} as any)),
        getLibraryData: (orgName: string, moduleName: string, version: string) => (Promise.resolve({} as any))
    },
    currentFile: {
        content: "",
        path: "",
        size: 0
    }
});

interface CtxProviderProps extends LowCodeEditorProps {
    children?: React.ReactNode,
    model: STNode,
    currentModel: { model: STNode },
    updateModel?: (codeSnippet: string, position: NodePosition) => void,
    formArgs?: any,
    validateStatement: (isValid: boolean) => void
}

export const StatementEditorContextProvider = (props: CtxProviderProps) => {
    const {
        children,
        model,
        currentModel,
        updateModel,
        formArgs,
        validateStatement,
        library,
        ...restProps
    } = props;

    return (
        <StatementEditorContext.Provider
            value={{
                modelCtx: {
                    statementModel: model,
                    currentModel,
                    updateModel
                },
                formCtx: {
                    formModelPosition: formArgs.formArgs.targetPosition
                },
                statementCtx: {
                    validateStatement
                },
                library,
                ...restProps
            }}
        >
            <InputEditorContextProvider>
                {children}
            </InputEditorContextProvider>
        </StatementEditorContext.Provider>
    );
}
