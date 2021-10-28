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

import { NodePosition } from "@ballerina/syntax-tree";

import ExpressionEditor, { ExpressionEditorCustomTemplate } from "../../../Elements/ExpressionEditor";

import './style.scss'

interface VariableNameInputProps {
    displayName: string;
    value: string;
    onValueChange: (value: string) => void;
    validateExpression: (fieldName: string, isInValid: boolean) => void;
    position: NodePosition;
    overrideTemplate?: ExpressionEditorCustomTemplate
}

export function VariableNameInput(props: VariableNameInputProps) {
    const { onValueChange, validateExpression, position, value, displayName, overrideTemplate } = props;

    const expressionEditorNameConfig = {
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
                endLine: position.startLine,
                startColumn: 0,
                endColumn: 0
            },
            customTemplate: overrideTemplate ?
                overrideTemplate
                : {
                    defaultCodeSnippet: `var  = 10;`,
                    targetColumn: 5,
                },
            hideSuggestions: true
        },
        onChange: onValueChange,
        defaultValue: value,
    };

    return (
        <div className={'hide-suggestion'}>
            <ExpressionEditor {...expressionEditorNameConfig} />
        </div>
    )
}
