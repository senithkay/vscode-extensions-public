/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { STNode } from "@ballerina/syntax-tree";
import { Diagnostic } from "monaco-languageclient/lib/monaco-language-client";

import { AppInfo, ApplicationFile } from "../../../../../api/models";
import { FormField, WizardType } from "../../../../../ConfigurationSpec/types";
import { ExpressionEditorState } from "../../../../../Definitions";
import { DraftUpdateStatement } from "../../../../view-state/draft";

export interface FormElementProps<T = {}> extends FormElementEvents {
    model?: FormField;
    index?: number;
    customProps?: T;
    defaultValue?: any;
    placeholder?: string;
    label?: string;
    rowsMax?: number;
    errorMessage?: string;
    validateEmptyField?: (field: string, isEmpty: boolean) => void;
    onFieldValueChange?: (isRequiredFieldsFilled: boolean) => void;
    size?: "small" | "medium";
    type?: "string" | "number" | "collection" | "record" | "|" | "varref" | "int" | "float" | "boolean" | "json" | "var";
    currentFile?: ApplicationFile;
    currentApp?: AppInfo;
    editorDiagnostics?: Diagnostic[];
    mainDiagnostics?: Diagnostic[];
    targetPositionDraft?: any;
    disabled?: boolean;
    dataTestId?: string;
}

export interface FormElementEvents {
    onChange?: (event: any) => void;
    onClick?: () => void;
    dispatchExprEditorStart?: (editor: ExpressionEditorState) => void;
    dispatchExprEditorContentChange?: (editor: ExpressionEditorState) => void;
    dispatchExprEditorClose?: (editor: ExpressionEditorState) => void;
}

export interface ConditionConfig {
    type: string;
    conditionExpression?: string | ForeachConfig;
    scopeSymbols?: string[];
    conditionPosition?: DraftUpdateStatement;
}

export interface ForeachConfig {
    variable: string;
    collection: string;
    model?: STNode
}

export interface ProcessConfig {
    type: string;
    config?: string | LogConfig | RespondConfig;
    scopeSymbols?: string[];
    model?: STNode;
    wizardType?: WizardType;
}

export interface LogConfig {
    type: string;
    expression: string;
}

export interface RespondConfig {
    genType: string;
    caller: string;
    respondExpression: string;
    variable: string;
}

export interface EndConfig {
    type: string;
    expression?: string | RespondConfig;
    scopeSymbols?: string[];
    wizardType?: WizardType;
    model?: STNode;
}
