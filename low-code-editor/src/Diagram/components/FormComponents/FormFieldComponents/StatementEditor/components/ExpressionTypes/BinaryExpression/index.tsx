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
import React, { ReactNode, useContext } from "react";

import { BinaryExpression } from "@ballerina/syntax-tree";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { VariableUserInputs } from "../../../models/definitions";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getKindBasedOnOperator, getOperatorSuggestions, getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../ViewContainer/styles";

interface BinaryProps {
    model: BinaryExpression
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function BinaryExpressionComponent(props: BinaryProps) {
    const { model, userInputs, diagnosticHandler } = props;

    const overlayClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);

    const lhs: ReactNode = <ExpressionComponent
        model={model.lhsExpr}
        isRoot={false}
        userInputs={userInputs}
        diagnosticHandler={diagnosticHandler}
    />;
    const rhs: ReactNode = <ExpressionComponent
        model={model.rhsExpr}
        isRoot={false}
        userInputs={userInputs}
        diagnosticHandler={diagnosticHandler}
    />;

    const kind = getKindBasedOnOperator(model.operator.kind);

    const onClickOperator = (event: any) => {
        event.stopPropagation()
        expressionHandler(model, true, { expressionSuggestions: getOperatorSuggestions(kind) })
    }

    const onClickOnLhsExpression = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.lhsExpr, false, { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
    };

    const onClickOnRhsExpression = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.rhsExpr, false, { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
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
                {model.operator.value ? model.operator.value : "operator"}
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
