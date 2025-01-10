/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DiagnosticMessage, FormDiagnostics, TextEdit, LinePosition } from "@wso2-enterprise/ballerina-core";
import { ParamConfig } from "../ParamManager/ParamManager";
import { CompletionItem } from "@wso2-enterprise/ui-toolkit";

export type FormValues = {
    [key: string]: any;
};

export type FormField = {
    key: string;
    label: string;
    type: null | string;
    optional: boolean;
    advanced?: boolean;
    editable: boolean;
    placeholder?: string;
    documentation: string;
    value: string | any[];
    valueType?: string;
    diagnostics?: DiagnosticMessage[];
    items?: string[];
    paramManagerProps?: ParamConfig;
    valueTypeConstraint: string;
    groupNo?: number;
    groupName?: string;
};

export type ExpressionFormField = {
    key: string;
    value: string;
    cursorPosition: LinePosition;
    isConfigured?: boolean
};

export type HelperPaneCompletionItem = {
    label: string;
    type?: string;
    insertText: string;
    kind?: string;
    codedata?: any;
}

export type HelperPaneCompletionCategory = {
    label: string;
    items: HelperPaneCompletionItem[];
}

export type HelperPaneVariableInfo = {
    category: HelperPaneCompletionCategory[];
}

export type HelperPaneFunctionCategory = {
    label: string;
    items?: HelperPaneCompletionItem[];
    subCategory?: HelperPaneFunctionCategory[];
}

export type HelperPaneFunctionInfo = {
    category: HelperPaneFunctionCategory[];
}

export type HelperPaneData = HelperPaneVariableInfo | HelperPaneFunctionInfo;

type FormCompletionConditionalProps = {
    completions: CompletionItem[];
    triggerCharacters: readonly string[];
    retrieveCompletions: (
        value: string,
        key: string,
        offset: number,
        triggerCharacter?: string,
        onlyVariables?: boolean
    ) => Promise<void>;
    extractArgsFromFunction: (
        value: string,
        key: string,
        cursorPosition: number
    ) => Promise<{
        label: string;
        args: string[];
        currentArgIndex: number;
    }>;
} | {
    completions?: never;
    triggerCharacters?: never;
    retrieveCompletions?: never;
    extractArgsFromFunction?: never;
}

type FormTypeConditionalProps = {
    types: CompletionItem[];
    retrieveVisibleTypes: (value: string, cursorPosition: number) => Promise<void>;
} | {
    types?: never;
    retrieveVisibleTypes?: never;
}

type FormHelperPaneConditionalProps = {
    isLoadingHelperPaneInfo: boolean;
    variableInfo: HelperPaneData;
    configVariableInfo: HelperPaneData;
    functionInfo: HelperPaneData;
    libraryBrowserInfo: HelperPaneData;
    getHelperPaneData?: (type: string, filterText: string) => void;
    onFunctionItemSelect?: (item: HelperPaneCompletionItem) => Promise<string>;
} | {
    isLoadingHelperPaneInfo?: never;
    variableInfo?: never;
    configVariableInfo?: never;
    functionInfo?: never;
    libraryBrowserInfo?: never;
    getHelperPaneData?: never;
    onFunctionItemSelect?: never;
}

type FormExpressionEditorBaseProps = {
    getExpressionEditorDiagnostics?: (
        showDiagnostics: boolean,
        expression: string,
        key: string
    ) => Promise<void>;
    getExpressionFormDiagnostics?: (
        showDiagnostics: boolean,
        expression: string,
        key: string,
        setDiagnosticsInfo: (diagnostics: FormDiagnostics) => void,
        shouldUpdateNode?: boolean,
        variableType?: string
    ) => Promise<void>;
    onCompletionItemSelect?: (value: string, additionalTextEdits?: TextEdit[]) => Promise<void>;
    onFocus?: () => void | Promise<void>;
    onBlur?: () => void | Promise<void>;
    onCancel?: () => void;
    onSave?: (value: string) => void | Promise<void>;
    onRemove?: () => void;
    onSaveConfigurables?: (values: any) => void;
}

export type FormExpressionEditorProps =
    FormCompletionConditionalProps &
    FormTypeConditionalProps &
    FormHelperPaneConditionalProps &
    FormExpressionEditorBaseProps;
