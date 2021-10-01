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
import React from "react";

import { BinaryExpression, STNode } from "@ballerina/syntax-tree";

import { getKindBasedOnOperator, getOperatorSuggestions, getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { SuggestionItem } from "../../../utils/utils";
import { ExpressionComponent } from "../../Expression";
import { statementEditorStyles } from "../../ViewContainer/styles";
import { VariableUserInputs } from "../../../models/definitions";

interface BinaryProps {
    model: STNode
    callBack: (suggestions: SuggestionItem[], model: STNode, operator: boolean) => void
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function BinaryExpressionC(props: BinaryProps) {
    const { model, callBack, userInputs, diagnosticHandler } = props;
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
        lhs = <ExpressionComponent model={lhsExpression} callBack={callBack} isRoot={false} userInputs={userInputs} diagnosticHandler={diagnosticHandler} />;
        rhs = <ExpressionComponent model={rhsExpression} callBack={callBack} isRoot={false} userInputs={userInputs} diagnosticHandler={diagnosticHandler} />;
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
