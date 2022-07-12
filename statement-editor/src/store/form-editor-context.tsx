/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import {
    ExpressionEditorLangClientInterface,
    LibraryKind,
    STModification,
    STSymbolInfo,
    SymbolInfoResponse
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {ModulePart, NodePosition, ServiceDeclaration, STNode} from "@wso2-enterprise/syntax-tree";

import { LowCodeEditorProps } from "../components/StatementEditorWrapper";
import {CurrentModel, EditorModel, EmptySymbolInfo, StmtDiagnostic, SuggestionItem} from "../models/definitions";

import { InputEditorContextProvider } from "./input-editor-context";

export const FormEditorContext = React.createContext({
    model: null,
    type: "",
    isLastMember: false,
    isEdit: false,
    targetPosition: null,
    currentFile: {
        content: "",
        path: "",
        size: 0
    },
    syntaxTree: null,
    stSymbolInfo: null,
    onCancel: () => undefined,
    onSave: () => undefined,
    onChange: (code: string, partialST: STNode, moduleList?: Set<string>, currentModel?: CurrentModel,
               newValue?: string, completionKinds?: number[], offsetLineCount?: number,
               diagnosticOffSet?: NodePosition) => undefined,
    getLangClient: () => (Promise.resolve({} as any)),
    applyModifications: (modifications: STModification[]) => undefined
});

export interface FormEditorProps {
    children?: React.ReactNode,
    model?: STNode;
    type?: string;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
    isLastMember?: boolean;
    stSymbolInfo?: STSymbolInfo;
    syntaxTree?: STNode;
    isEdit?: boolean;
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>;
    onChange: (code: string, partialST: STNode, moduleList?: Set<string>, currentModel?: CurrentModel,
               newValue?: string, completionKinds?: number[], offsetLineCount?: number,
               diagnosticOffSet?: NodePosition) => void;
    currentFile: {
        content: string,
        path: string,
        size: number
    };
    applyModifications: (modifications: STModification[]) => void;
}

export const FormEditorContextProvider = (props: FormEditorProps) => {
    const {
        children,
        model,
        type,
        isEdit,
        stSymbolInfo,
        isLastMember,
        syntaxTree,
        currentFile,
        targetPosition,
        applyModifications,
        onCancel,
        onSave,
        onChange,
        getLangClient
    } = props;

    return (
        <FormEditorContext.Provider
            value={{
                model,
                type,
                isEdit,
                stSymbolInfo,
                isLastMember,
                syntaxTree,
                currentFile,
                targetPosition,
                applyModifications,
                onCancel,
                onSave,
                onChange,
                getLangClient
            }}
        >
            {children}
        </FormEditorContext.Provider>
    );
}
