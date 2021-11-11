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
import * as monaco from 'monaco-editor';
import { CompletionItemKind, InsertTextFormat } from "monaco-languageclient";

import { CompletionResponse, ExpressionEditorLangClientInterface, TextEdit } from "../../../../../../../Definitions";
import ExpressionEditor, { ExpressionEditorProps } from "../../../Elements/ExpressionEditor";
import { createSortText, GetExpCompletionsProps } from "../../../Elements/ExpressionEditor/utils";
import { FormElementProps } from "../../../types";

const getVarTypeCompletions = async ({
    getExpressionEditorLangClient,
    langServerURL,
    completionParams,
}: GetExpCompletionsProps) => {
    const langClient: ExpressionEditorLangClientInterface = await getExpressionEditorLangClient(langServerURL);
    const values: CompletionResponse[] = await langClient.getCompletion(completionParams);

    const acceptedKind: CompletionItemKind[] = [11, 22];

    const filteredCompletionItem: CompletionResponse[] = values.filter((completionResponse: CompletionResponse) => acceptedKind.includes(completionResponse.kind as CompletionItemKind));
    const completionItems: monaco.languages.CompletionItem[] = filteredCompletionItem.map((completionResponse: CompletionResponse, order: number) => {
        return {
            range: null,
            label: completionResponse.label,
            detail: completionResponse.detail,
            kind: completionResponse.kind as CompletionItemKind,
            insertText: completionResponse.insertText,
            insertTextFormat: completionResponse.insertTextFormat as InsertTextFormat,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            sortText: createSortText(order),
            documentation: completionResponse.documentation
        }
    });

    if (completionItems.length > 0) {
        completionItems[0] = { ...completionItems[0], preselect: true }
    }

    const completionList: monaco.languages.CompletionList = {
        incomplete: false,
        suggestions: completionItems
    };
    return completionList;
}

export interface VariableTypeInputProps {
    displayName: string;
    value: string;
    isEdit: boolean;
    onValueChange: (value: string) => void;
    validateExpression: (fieldName: string, isInValid: boolean) => void;
    position: NodePosition;
    onBlur?: () => void;
}

export function VariableTypeInput(props: VariableTypeInputProps) {
    const { onValueChange, validateExpression, position, value, displayName, isEdit, onBlur } = props;
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
            onBlur,
        },
        onChange: onValueChange,
        defaultValue: value,
    };

    return (
        <ExpressionEditor {...expressionEditorNameConfig} />
    )
}
