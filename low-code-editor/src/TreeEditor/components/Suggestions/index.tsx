// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline jsx-no-lambda

import React from "react";

import {STNode} from "@ballerina/syntax-tree";

import {addExpression, addOperator, SuggestionItem} from "../../utils/utils";
import {statementEditorStyles} from "../ViewContainer/styles";

interface SuggestionsProps {
    model: STNode
    suggestions: SuggestionItem[],
    operator: boolean,
    callBack: (model: STNode) => void
}

export function Suggestions(props: SuggestionsProps) {
    const overlayClasses = statementEditorStyles();
    const {model, suggestions, callBack} = props;

    const onClickExpressionSuggestion = (kind: string) => {
        addExpression(model, kind);
        callBack(model);
    }

    const onClickOperatorSuggestion = (operator: SuggestionItem) => {
        addOperator(model, operator);
        callBack(model);
    }

    return (
        <div>
            {suggestions.map((suggestion: SuggestionItem, index: number) => (
                (suggestion.kind) ?
                <button
                    className={overlayClasses.AppSuggestionButtons}
                    key={index}
                    onClick={() => onClickOperatorSuggestion(suggestion)}
                >
                    {suggestion.value}
                </button>
                    :
                <button
                    className={overlayClasses.AppSuggestionButtons}
                    key={index}
                    onClick={() => onClickExpressionSuggestion(suggestion.value)}
                >
                    {suggestion.value}
                </button>
            ))}
        </div>
    );
}
