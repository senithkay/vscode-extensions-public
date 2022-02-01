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
import { ExpressionEditorState, FormField, WizardType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

import { GenerationType } from "../ConfigForms/ProcessConfigForms/ProcessForm/AddDataMappingConfig/OutputTypeSelector";

export interface FormElementProps<T = {}> extends FormElementEvents {
    model?: FormField | any;
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
    type?: "string" | "number" | "array" | "record" | "|" | "varref" | "int" | "float" | "boolean" | "json" | "var";
    editorDiagnostics?: Diagnostic[];
    mainDiagnostics?: Diagnostic[];
    targetPositionDraft?: any;
    disabled?: boolean;
    dataTestId?: string;
    currentValue?: string;
    tooltip?: string;
    hideLabelTooltips?: boolean;
    hideLabel?: boolean;
}

export interface FormElementEvents {
    // Should use either KeyUp or OnChange callBack
    onChange?: (event: any) => void;
    // This callback is to detect KeyUp event
    onKeyUp?: (event: any) => void;
    // This callback is to detect focus out
    onBlur?: (event: any) => void;
    onClick?: () => void;
    onFocus?: (event: any) => void;
    dispatchExprEditorStart?: (editor: ExpressionEditorState) => void;
    dispatchExprEditorContentChange?: (editor: ExpressionEditorState) => void;
    dispatchExprEditorClose?: (editor: ExpressionEditorState) => void;
}

export interface FormFieldChecks {
    name: string;
    isValid: boolean;
    isEmpty?: boolean;
    canIgnore?: boolean; // Ff field is optional or defaultable
}

export interface ConditionConfig {
    type: string;
    conditionExpression?: string | ForeachConfig | ElseIfConfig;
    scopeSymbols?: string[];
    conditionPosition?: NodePosition;
    model?: STNode
}

export interface ForeachConfig {
    variable: string;
    collection: string;
    type: string;
    model?: STNode
}

export interface ElseIfConfig {
    values: {id: number, expression: string, position: NodePosition}[]
}

export interface ProcessConfig {
    type: string;
    config?: string | LogConfig | RespondConfig | DataMapperConfig | CustomExpressionConfig;
    scopeSymbols?: string[];
    model?: STNode;
    wizardType?: WizardType;
    targetPosition?: NodePosition;
}

export interface LogConfig {
    type: string;
    expression: string;
}

export interface CustomExpressionConfig {
    expression: string;
}

export interface RespondConfig {
    genType: string;
    caller: string;
    respondExpression: string;
    variable: string;
    responseCode?: string;
}

export interface TypeInfo {
    name: string;
    orgName: string;
    moduleName: string;
    version: string;
}

export interface DataMapperInputTypeInfo {
    type: string;
    name: string;
    node?: STNode;
}

export interface DataMapperOutputTypeInfo {
    variableName?: string;
    type: string;
    node?: STNode;
    generationType?: GenerationType;
    typeInfo?: TypeInfo;
    startLine?: number;
    fields?: DataMapperOutputField[];
    sampleStructure?: string;
    fieldsGenerated?: boolean;
    saved?: boolean
    typeDefInSameModule?: boolean;
}

export interface DataMapperConfig {
    inputTypes: DataMapperInputTypeInfo[]; // todo ::: finalize the interface
    outputType: DataMapperOutputTypeInfo;
}

export interface DataMapperOutputField {
    name: string;
    type: string;
    fields?: DataMapperOutputField[];
    value?: string;
    isChanged: boolean;
}

export interface EndConfig {
    type: string;
    expression?: string | RespondConfig;
    scopeSymbols?: string[];
    wizardType?: WizardType;
    model?: STNode;
}
