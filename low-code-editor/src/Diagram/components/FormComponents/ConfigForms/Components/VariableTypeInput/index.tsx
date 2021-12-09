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

import React, { useState } from "react";

import { DiagramDiagnostic } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import ExpressionEditor, { ExpressionEditorCustomTemplate, ExpressionEditorProps } from "../../../FormFieldComponents/ExpressionEditor";
import { FormElementProps } from "../../../Types";

import { getVarTypeCompletions } from './utils';

export interface VariableTypeInputProps {
    displayName: string;
    value: string;
    hideLabel?: boolean;
    focus?: boolean;
    onValueChange: (value: string) => void;
    validateExpression: (fieldName: string, isInValid: boolean) => void;
    position: NodePosition;
    overrideTemplate?: ExpressionEditorCustomTemplate;
    hideTextLabel?: boolean;
    disabled?: boolean;
    ignoredCompletions?: string[];
    additionalCompletions?: string[];
    enterKeyPressed?: (value: string) => void;
    initialDiagnostics?: DiagramDiagnostic[];
    diagnosticsFilterExtraColumns?: {
        start?: number,
        end?: number,
    },
    changed?: boolean | string;
}

export function VariableTypeInput(props: VariableTypeInputProps) {
    const { onValueChange, validateExpression, position, value, displayName, overrideTemplate, hideLabel, disabled,
            ignoredCompletions = [], additionalCompletions = [], focus, enterKeyPressed, initialDiagnostics, diagnosticsFilterExtraColumns, changed } = props;

    const [editorFocus, setEditorFocus] = useState<boolean>(focus);

    const revertFocus = () => {
        setEditorFocus(false);
    };
    const expressionEditorNameConfig: FormElementProps<ExpressionEditorProps> = {
        model: {
            name: "variableType",
            displayName,
            isOptional: false,
            value,
        },
        customProps: {
            validate: validateExpression,
            interactive: true,
            editPosition: position,
            customTemplate: overrideTemplate ? overrideTemplate : {
                defaultCodeSnippet: `  tempVarType;`,
                targetColumn: 1
            },
            hideExpand: true,
            getCompletions: getVarTypeCompletions(ignoredCompletions, additionalCompletions),
            showHints: false,
            hideTextLabel: hideLabel,
            disabled,
            focus: editorFocus,
            revertFocus,
            enterKeyPressed,
            initialDiagnostics,
            diagnosticsFilterExtraColumns,
            changed,
        },
        onChange: onValueChange,
        defaultValue: value
    };

    return (
        <ExpressionEditor {...expressionEditorNameConfig} />
    )
}
