import React from "react";

import * as c from "../../../constants";
import {Expression, Unary} from "../../../models/definitions";
import {getOperatorSuggestions, getSuggestionsBasedOnExpressionKind} from "../../../utils";
import {ExpressionComponent} from "../../Expression";
import {statementEditorStyles} from "../../ViewContainer/styles";

interface UnaryProps {
    model: Expression
    callBack: (suggestions: string[], model: Expression, operator: boolean) => void
}

export function UnaryC(props: UnaryProps) {
    const overlayClasses = statementEditorStyles();
    const {model, callBack} = props;
    let operandExpression: any;
    let operand: any;
    let operator: any;

    if (model.kind === c.UNARY) {
        const unaryModel: Unary = model.expressionType as Unary;
        operandExpression = unaryModel.operand
        operator = unaryModel.operator
        operand = <ExpressionComponent model={operandExpression} callBack={callBack} isRoot={false}/>;
    }

    const onClickOperator = (e: any) => {
        e.stopPropagation()
        callBack(getOperatorSuggestions(c.UNARY), model, true)
    }

    const onClickOnExpression = (model: Expression, e: any) => {
        e.stopPropagation()
        callBack(getSuggestionsBasedOnExpressionKind(c.UNARY), model, false)
    };

    return (
        <span>
            <span
                className={`${overlayClasses.AppExpressionBlock} ${overlayClasses.AppExpressionBlockElement}`}
            >
                <button
                    className={overlayClasses.AppTemplateButton}
                    onClick={(e) => onClickOperator(e)}
                >
                    {operator ? operator : "operator"}
                </button>
            </span>
            <button
                className={overlayClasses.AppTemplateButton}
                onClick={(e) => onClickOnExpression(operandExpression, e)}
            >
                {operand}
            </button>
        </span>
    );
}
