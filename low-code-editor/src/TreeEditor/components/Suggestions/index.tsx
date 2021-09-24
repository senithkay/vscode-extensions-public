import React, {ReactNode} from "react";

import {STNode} from "@ballerina/syntax-tree";

import {addExpression, addOperator, Operator} from "../../utils/utils";
import {statementEditorStyles} from "../ViewContainer/styles";

interface SuggestionsProps {
    model: STNode
    suggestions: string[],
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

    const onClickOperatorSuggestion = (cModel: STNode, operator: Operator) => {
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
            {suggestions.map((suggestion: string, index: number) => (
                <button
                    className={overlayClasses.AppSuggestionButtons}
                    key={index}
                    onClick={(e) => onClickExpressionSuggestion(model, suggestion)}
                >
                {suggestion}
                </button>
            ))}
        </div>
    );
}
