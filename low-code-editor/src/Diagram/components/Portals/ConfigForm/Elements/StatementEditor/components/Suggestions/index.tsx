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
import React from "react";

import { STNode } from "@ballerina/syntax-tree";

import * as c from "../../constants";
import { SuggestionItem } from "../../models/definitions";
import { addExpression, addOperator } from "../../utils/utils";
import { statementEditorStyles } from "../ViewContainer/styles";

interface SuggestionsProps {
    model: STNode
    suggestions: SuggestionItem[],
    operator: boolean,
    suggestionHandler: (model: STNode) => void
}

export function Suggestions(props: SuggestionsProps) {
    const overlayClasses = statementEditorStyles();
    const {model, suggestions, suggestionHandler} = props;

    const onClickExpressionSuggestion = (kind: string) => {
        addExpression(model, kind);
        suggestionHandler(model);
    }

    const onClickOperatorSuggestion = (operator: SuggestionItem) => {
        addOperator(model, operator);
        suggestionHandler(model);
    }

    return (
        <div>
            {suggestions.map((suggestion: SuggestionItem, index: number) => (
                (suggestion.kind) ?
                (
                    (suggestion.kind === "PlusToken") ?
                    <button
                        className={overlayClasses.suggestionButton}
                        key={index}
                        onClick={() => onClickOperatorSuggestion(suggestion)}
                    >
                        {suggestion.value}
                    </button>
                    :
                    <button
                        className={overlayClasses.suggestionButton}
                        key={index}
                        onClick={() => onClickOperatorSuggestion(suggestion)}
                        disabled={true}
                    >
                        {suggestion.value}
                    </button>

                )
                :
                (
                    (suggestion.value === c.ARITHMETIC  || suggestion.value === c.STRING_LITERAL) ?
                    <button
                        className={overlayClasses.suggestionButton}
                        key={index}
                        onClick={() => onClickExpressionSuggestion(suggestion.value)}
                    >
                        {suggestion.value}
                    </button>
                    :
                    <button
                        className={overlayClasses.suggestionButton}
                        key={index}
                        onClick={() => onClickExpressionSuggestion(suggestion.value)}
                        disabled={true}
                    >
                        {suggestion.value}
                    </button>
                )
            ))}
        </div>
    );
}
