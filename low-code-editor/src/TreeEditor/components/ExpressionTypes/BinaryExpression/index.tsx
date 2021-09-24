import React from "react";

import {BinaryExpression, STNode} from "@ballerina/syntax-tree";

import {getKindBasedOnOperator, getSuggestionsBasedOnExpressionKind} from "../../../utils";
import {getOperatorSuggestions} from "../../../utils";
import {Operator} from "../../../utils/utils";
import {ExpressionComponent} from "../../Expression";
import {statementEditorStyles} from "../../ViewContainer/styles";

interface BinaryProps {
    model: STNode
    callBack: (suggestions: string[] | Operator[], model: STNode, operator: boolean) => void
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
        let binaryExpModel = model as BinaryExpression;
        operatorKind = binaryExpModel.operator.kind;
        lhsExpression = binaryExpModel.lhsExpr;
        rhsExpression = binaryExpModel.rhsExpr;
        operator = binaryExpModel.operator.value;
        lhs = <ExpressionComponent model={lhsExpression} callBack={callBack} isRoot={false}/>;
        rhs = <ExpressionComponent model={rhsExpression} callBack={callBack} isRoot={false}/>;
    }

    const kind = getKindBasedOnOperator(operatorKind);

    const onClickOperator = (e: any) => {
        e.stopPropagation()
        callBack(getOperatorSuggestions(kind), model, true)
    }

    const onClickOnExpression = (model: STNode, e: any) => {
        e.stopPropagation()
        callBack(getSuggestionsBasedOnExpressionKind(kind), model, false)
    };

    return (
        <span>
            <button className={overlayClasses.AppTemplateButton} onClick={(e) => onClickOnExpression(lhsExpression, e)}>{lhs}</button>
            <button className={overlayClasses.AppTemplateButton}
                    onClick={(e) => onClickOperator(e)}>{operator ? operator : "operator"}</button>
            <button className={overlayClasses.AppTemplateButton} onClick={(e) => onClickOnExpression(rhsExpression, e)}>{rhs}</button>
        </span>
    );
}
