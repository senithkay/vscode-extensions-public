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

    const onClickExpressionSuggestion = (cModel: STNode, kind: string) => {
        addExpression(cModel, kind);
        callBack(model);
    }

    const onClickOperatorSuggestion = (cModel: STNode, operator: SuggestionItem) => {
        addOperator(cModel, operator);
        callBack(model);
    }

    // const suggestionsContent: ReactNode[] = suggestions.map((suggestion: string, index: number) => {
    //     // if (suggestion.constructor === String) {
    //         const expressionItem: string = suggestion as string;
    //         return <button
    //             className={overlayClasses.AppSuggestionButtons}
    //             key={index}
    //             onClick={(e) => onClickExpressionSuggestion(model, expressionItem)}
    //         >
    //             {suggestion}
    //         </button>;
    //     } else {
    //         const operatorItem: Operator = suggestion as Operator;
    //         return <button
    //             className={overlayClasses.AppSuggestionButtons}
    //             key={index}
    //             onClick={(e) => onClickOperatorSuggestion(model, operatorItem)}
    //         >
    //             {operatorItem.value}
    //         </button>;
    //     }
    // });


    return (
        // {suggestionsContent}
        <div>
            {suggestions.map((suggestion: SuggestionItem, index: number) => (
                (suggestion.kind) ?
                <button
                    className={overlayClasses.AppSuggestionButtons}
                    key={index}
                    onClick={(e) => onClickOperatorSuggestion(model, suggestion)}
                >
                    {suggestion.value}
                </button>
                    :
                <button
                    className={overlayClasses.AppSuggestionButtons}
                    key={index}
                    onClick={(e) => onClickExpressionSuggestion(model, suggestion.value)}
                >
                    {suggestion.value}
                </button>
            ))}
        </div>
    );
}
