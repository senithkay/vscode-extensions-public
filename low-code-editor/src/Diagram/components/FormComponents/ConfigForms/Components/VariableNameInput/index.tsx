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

import { ExpressionEditorCustomTemplate, ExpressionEditorProps } from "@wso2-enterprise/ballerina-expression-editor";
import { DiagramDiagnostic,
    FormElementProps } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { LowCodeExpressionEditor } from "../../../FormFieldComponents/LowCodeExpressionEditor";
import { wizardStyles as useFormStyles } from "../../style";

export interface VariableNameInputProps {
    displayName: string;
    value: string;
    isEdit: boolean;
    onValueChange: (value: string) => void;
    validateExpression: (fieldName: string, isInValid: boolean) => void;
    position: NodePosition;
    overrideTemplate?: ExpressionEditorCustomTemplate;
    overrideEditTemplate?: ExpressionEditorCustomTemplate;
    hideLabel?: boolean;
    initialDiagnostics?: DiagramDiagnostic[];
    diagnosticsFilterExtraColumns?: {
        start?: number,
        end?: number,
    };
    disabled?: boolean;
}

export function VariableNameInput(props: VariableNameInputProps) {
    const { onValueChange, validateExpression, position, value, displayName, overrideTemplate, overrideEditTemplate, isEdit, hideLabel, initialDiagnostics, diagnosticsFilterExtraColumns, disabled } = props;
    const formClasses = useFormStyles();

    let customTemplate;

    if (isEdit) {
        if (overrideEditTemplate) {
            customTemplate = overrideEditTemplate;
        } else {
            customTemplate = {
                defaultCodeSnippet: '',
                targetColumn: 0
            }
        }
    } else {
        if (overrideTemplate) {
            customTemplate = overrideTemplate;
        } else {
            customTemplate = {
                defaultCodeSnippet: `var  = 10;`,
                targetColumn: 5,
            };
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
                startLine: position?.startLine || 0,
                endLine: position?.endLine || 0,
                startColumn: position?.startColumn || 0,
                endColumn: position?.endColumn || 0
            },
            customTemplate,
            hideSuggestions: true,
            hideExpand: true,
            hideTextLabel: hideLabel,
            initialDiagnostics,
            diagnosticsFilterExtraColumns,
            disabled
        },
        onChange: onValueChange,
        defaultValue: value
    };

    return (
        <div className={formClasses.expStatementWrapper}>
            <LowCodeExpressionEditor {...expressionEditorNameConfig} />
        </div>
    )
}
