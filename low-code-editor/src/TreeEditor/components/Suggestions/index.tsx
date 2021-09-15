import React from "react";

import {Expression} from "../../models/definitions";
import {addExpression, addOperator} from "../../utils/utils";
import { statementEditorStyles } from "../ViewContainer/styles";

interface SuggestionsProps {
    model: Expression
    suggestions: string[],
    operator: boolean,
    callBack: (model: Expression) => void
}

export function Suggestions(props: SuggestionsProps) {
    const overlayClasses = statementEditorStyles();
    const {model, suggestions, operator, callBack} = props;

    const onClickSuggestion = (kind: string, selectedOperator: boolean, selectedModel: Expression) => {
        if (selectedOperator) {
            addOperator(selectedModel, kind)
        } else {
            addExpression(selectedModel, kind);
        }
        callBack(selectedModel)
    }

    return (
        <div className={overlayClasses.AppSuggestionBlock}>
            {suggestions.map((suggestion, index) => (
                <button
                    className={overlayClasses.AppSuggestionButtons}
                    key={index}
                    onClick={() => onClickSuggestion(suggestion, operator, model)}
                >
                    {suggestion.substring(0, suggestion.length - 1)}
                </button>
            ))}
        </div>
    );
}
