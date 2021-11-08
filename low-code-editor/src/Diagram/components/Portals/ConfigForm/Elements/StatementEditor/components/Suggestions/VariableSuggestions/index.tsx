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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline jsx-no-lambda
import React, { useContext } from "react";

import { STNode } from "@ballerina/syntax-tree";

import { SuggestionItem } from "../../../models/definitions";
import { InputEditorContext } from "../../../store/input-editor-context";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { useStatementEditorStyles } from "../../ViewContainer/styles";

export interface VariableSuggestionsProps {
    model: STNode
    variableSuggestions?: SuggestionItem[],
    suggestionHandler: () => void
}

export function VariableSuggestions(props: VariableSuggestionsProps) {
    const overlayClasses = useStatementEditorStyles();
    const { model, variableSuggestions, suggestionHandler } = props;

    const inputEditorCtx = useContext(InputEditorContext);

    const {
        modelCtx: {
            updateModel,
        }
    } = useContext(StatementEditorContext);

    const onClickVariableSuggestion = (suggestion: SuggestionItem) => {
        updateModel(suggestion.value, model.position);
        inputEditorCtx.onVariableSelection(suggestion.value);
        suggestionHandler();
    }

    return (
        <div>
            {
                variableSuggestions.map((suggestion: SuggestionItem, index: number) => (
                    <button
                        className={overlayClasses.suggestionButton}
                        key={index}
                        onClick={() => onClickVariableSuggestion(suggestion)}
                    >
                        {suggestion.value}
                        <span className={overlayClasses.dataTypeTemplate}>{suggestion.kind}</span>
                    </button>
                ))
            }
        </div>
    );
}
