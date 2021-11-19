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

import { NodePosition, STNode } from "@ballerina/syntax-tree";

import { InputEditorContextProvider } from "./input-editor-context";

export const StatementEditorContext = React.createContext({
    modelCtx: {
        statementModel: null,
        updateModel: (codeSnippet: string, position: NodePosition) => {}
    },
    formCtx: {
        onCancel: false,
        formModelPosition: null
    },
    statementCtx: {
        validateStatement: (isValid: boolean) => {}
    }
});

interface CtxProviderProps {
    children?: React.ReactNode,
    model: STNode,
    onCancelClicked: boolean,
    updateModel? : (codeSnippet: string, position: NodePosition) => void,
    formArgs?: any,
    validateStatement: (isValid: boolean) => void
}
export const StatementEditorContextProvider = (props: CtxProviderProps) => {
    const { children, model, onCancelClicked, updateModel, formArgs, validateStatement } = props;

    return (
        <StatementEditorContext.Provider
            value={{
            modelCtx: {
                statementModel: model,
                updateModel
            },
            formCtx: {
                onCancel: onCancelClicked,
                formModelPosition: formArgs.formArgs.targetPosition
            },
            statementCtx: {
                validateStatement
            }
        }}
        >
            <InputEditorContextProvider>
                {children}
            </InputEditorContextProvider>
        </StatementEditorContext.Provider>
    );
}
