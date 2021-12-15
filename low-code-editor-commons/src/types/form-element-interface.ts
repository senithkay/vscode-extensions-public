import React from "react";

import { Diagnostic } from "vscode-languageserver-protocol";

import { FormField } from "./config-spec"
import { CustomLowCodeContext } from "./custom-lowcode-interface";
import { ExpressionConfigurableProps } from "./expression-configurable-interface";
import { ExpressionEditorState } from "./store";

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
    expressionConfigurable?: React.FC<ExpressionConfigurableProps>;
    lowCodeEditorContext?: CustomLowCodeContext
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
