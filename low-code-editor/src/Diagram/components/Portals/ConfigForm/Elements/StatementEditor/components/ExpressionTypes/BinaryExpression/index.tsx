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
// tslint:disable: jsx-wrap-multiline
import React from "react";

import { BinaryExpression, STKindChecker, STNode } from "@ballerina/syntax-tree";

import { SuggestionItem, VariableUserInputs } from "../../../models/definitions";
import { getKindBasedOnOperator, getOperatorSuggestions, getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { statementEditorStyles } from "../../ViewContainer/styles";

interface BinaryProps {
    model: STNode
    expressionHandler: (model: STNode, operator: boolean, variableSuggestions?: SuggestionItem[], suggestions?: SuggestionItem[]) => void
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function BinaryExpressionC(props: BinaryProps) {
    const { model, expressionHandler, userInputs, diagnosticHandler } = props;
    let lhsExpression: any;
    let rhsExpression: any;
    let lhs: any;
    let rhs: any;
    let operatorKind: string = "";
    let operator: any;

    const overlayClasses = statementEditorStyles();

    if (STKindChecker.isBinaryExpression(model)) {
        const binaryExpModel = model as BinaryExpression;
        operatorKind = binaryExpModel.operator.kind;
        lhsExpression = binaryExpModel.lhsExpr;
        rhsExpression = binaryExpModel.rhsExpr;
        operator = binaryExpModel.operator.value;
        lhs = <ExpressionComponent
            model={lhsExpression}
            expressionHandler={expressionHandler}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
        />;
        rhs = <ExpressionComponent
            model={rhsExpression}
            expressionHandler={expressionHandler}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
        />;
    }

    const kind = getKindBasedOnOperator(operatorKind);

    const onClickOperator = (event: any) => {
        event.stopPropagation()
        expressionHandler(model, true, [], getOperatorSuggestions(kind))
    }

    const onClickOnLhsExpression = (event: any) => {
        event.stopPropagation()
        expressionHandler(lhsExpression, false, null, getSuggestionsBasedOnExpressionKind(kind))
    };

    const onClickOnRhsExpression = (event: any) => {
        event.stopPropagation()
        expressionHandler(rhsExpression, false, null, getSuggestionsBasedOnExpressionKind(kind))
    };

    return (
        <span>
            <button
                className={overlayClasses.expressionElement}
                onClick={onClickOnLhsExpression}
            >
                {lhs}
            </button>
            <button
                className={overlayClasses.expressionElement}
                onClick={onClickOperator}
            >
                {operator ? operator : "operator"}
            </button>
            <button
                className={overlayClasses.expressionElement}
                onClick={onClickOnRhsExpression}
            >
                {rhs}
            </button>
        </span>
    );
}
