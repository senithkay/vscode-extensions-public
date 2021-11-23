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

import React from "react";

import { NodePosition } from "@wso2-enterprise/syntax-tree";

import ExpressionEditor, { ExpressionEditorCustomTemplate, ExpressionEditorProps } from "../../../FormFieldComponents/ExpressionEditor";
import { FormElementProps } from "../../../Types";

export interface VariableNameInputProps {
    displayName: string;
    value: string;
    isEdit: boolean;
    onValueChange: (value: string) => void;
    validateExpression: (fieldName: string, isInValid: boolean) => void;
    position: NodePosition;
    overrideTemplate?: ExpressionEditorCustomTemplate
}

export function VariableNameInput(props: VariableNameInputProps) {
    const { onValueChange, validateExpression, position, value, displayName, overrideTemplate, isEdit } = props;

    let customTemplate;

    if (!isEdit) {
        customTemplate = overrideTemplate ?
            overrideTemplate
            : {
                defaultCodeSnippet: `var  = 10;`,
                targetColumn: 5,
            }
    } else {
        customTemplate = {
            defaultCodeSnippet: '',
            targetColumn: 0
        }
    }

    const expressionEditorNameConfig: FormElementProps<ExpressionEditorProps> = {
        model: {
            name: "variableName",
            displayName,
            isOptional: false
        },
        customProps: {
            validate: validateExpression,
            interactive: true,
            editPosition: {
                startLine: position.startLine,
                endLine: position.endLine,
                startColumn: position.startColumn,
                endColumn: position.endColumn
            },
            customTemplate,
            hideSuggestions: true,
            hideExpand: true
        },
        onChange: onValueChange,
        defaultValue: value,
    };

    return (
        <ExpressionEditor {...expressionEditorNameConfig} />
    )
}
