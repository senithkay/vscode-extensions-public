import React from "react";

import {BracedExpression, STNode} from "@ballerina/syntax-tree";

import {getSuggestionsBasedOnExpressionKind} from "../../../utils";
import {SuggestionItem} from "../../../utils/utils";
import {ExpressionComponent} from "../../Expression";
import {statementEditorStyles} from "../../ViewContainer/styles";

interface BracedExprProps {
    model: STNode
    callBack: (suggestions: SuggestionItem[], model: STNode, operator: boolean) => void
}

export function BracedExpressionC(props: BracedExprProps) {
    const {model, callBack} = props;
    let expression: any;
    let expressionComponent: any;

    const overlayClasses = statementEditorStyles();

    if (model.kind === 'BracedExpression') {
        const bracedExpModel = model as BracedExpression;
        expression = bracedExpModel.expression;
        expressionComponent = <ExpressionComponent model={expression} callBack={callBack} isRoot={false}/>;
    }

    const onClickOnExpression = (event: any) => {
        event.stopPropagation()
        // TODO: Change the kind appropriately
        callBack(getSuggestionsBasedOnExpressionKind("Arithmetic"), expression, false);
    };

    return (
        <span>
            <button
                className={overlayClasses.AppTemplateButton}
                onClick={onClickOnExpression}
            >
                {expressionComponent}
            </button>
        </span>
    );
}
