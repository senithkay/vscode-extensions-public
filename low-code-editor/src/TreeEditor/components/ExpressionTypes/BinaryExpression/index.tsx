import React from "react";

import {BinaryExpression, STNode} from "@ballerina/syntax-tree";

import {getKindBasedOnOperator, getOperatorSuggestions, getSuggestionsBasedOnExpressionKind} from "../../../utils";
import {SuggestionItem} from "../../../utils/utils";
import {ExpressionComponent} from "../../Expression";
import {statementEditorStyles} from "../../ViewContainer/styles";

interface BinaryProps {
    model: STNode
    callBack: (suggestions: SuggestionItem[], model: STNode, operator: boolean) => void
}

export function BinaryExpressionC(props: BinaryProps) {
    const {model, callBack} = props;
    let lhsExpression: any;
    let rhsExpression: any;
    let lhs: any;
    let rhs: any;
    let operatorKind: string = "";
    let operator: any;

    const overlayClasses = statementEditorStyles();

    if (model.kind === 'BinaryExpression') {
        const binaryExpModel = model as BinaryExpression;
        operatorKind = binaryExpModel.operator.kind;
        lhsExpression = binaryExpModel.lhsExpr;
        rhsExpression = binaryExpModel.rhsExpr;
        operator = binaryExpModel.operator.value;
        lhs = <ExpressionComponent model={lhsExpression} callBack={callBack} isRoot={false}/>;
        rhs = <ExpressionComponent model={rhsExpression} callBack={callBack} isRoot={false}/>;
    }

    const kind = getKindBasedOnOperator(operatorKind);

    const onClickOperator = (event: any) => {
        event.stopPropagation()
        callBack(getOperatorSuggestions(kind), model, true)
    }

    const onClickOnLhsExpression = (event: any) => {
        event.stopPropagation()
        callBack(getSuggestionsBasedOnExpressionKind(kind), lhsExpression, false)
    };

    const onClickOnRhsExpression = (event: any) => {
        event.stopPropagation()
        callBack(getSuggestionsBasedOnExpressionKind(kind), rhsExpression, false)
    };

    return (
        <span>
            <button
                className={overlayClasses.AppTemplateButton}
                onClick={onClickOnLhsExpression}
            >
                {lhs}
            </button>
            <button
                className={overlayClasses.AppTemplateButton}
                onClick={onClickOperator}
            >
                {operator ? operator : "operator"}
            </button>
            <button
                className={overlayClasses.AppTemplateButton}
                onClick={onClickOnRhsExpression}
            >
                {rhs}
            </button>
        </span>
    );
}
