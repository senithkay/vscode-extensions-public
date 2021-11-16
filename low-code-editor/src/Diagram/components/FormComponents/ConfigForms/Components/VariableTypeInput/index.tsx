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

import React from "react";

import { NodePosition } from "@ballerina/syntax-tree";

import ExpressionEditor, { ExpressionEditorProps } from "../../../FormFieldComponents/ExpressionEditor";
import { FormElementProps } from "../../../Types";

import { getVarTypeCompletions } from './utils';
export interface VariableTypeInputProps {
    displayName: string;
    value: string;
    isEdit: boolean;
    onValueChange: (value: string) => void;
    validateExpression: (fieldName: string, isInValid: boolean) => void;
    position: NodePosition;
}

export function VariableTypeInput(props: VariableTypeInputProps) {
    const { onValueChange, validateExpression, position, value, displayName, isEdit } = props;
    const expressionEditorNameConfig: FormElementProps<ExpressionEditorProps> = {
        model: {
            name: "variableType",
            displayName,
            isOptional: false
        },
        customProps: {
            validate: validateExpression,
            interactive: true,
            editPosition: {
                startLine: position.startLine,
                startColumn: position.startColumn,
                endLine: isEdit ? 0 : position.endLine,
                endColumn: isEdit ? 0 : position.endColumn
            },
            customTemplate: {
                defaultCodeSnippet: `  tempVarType;`,
                targetColumn: 1
            },
            hideExpand: true,
            getCompletions: getVarTypeCompletions,
            showHints: false,
        },
        onChange: onValueChange,
        defaultValue: value,
    };

    return (
        <ExpressionEditor {...expressionEditorNameConfig} />
    )
}
