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
// tslint:disable: jsx-no-multiline-js
import React, { ReactNode, useContext } from "react";

import { BinaryExpression } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import {
    getKindBasedOnOperator,
    getOperatorSuggestions,
    getSuggestionsBasedOnExpressionKind,
    isPositionsEquals
} from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface BinaryProps {
    model: BinaryExpression
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function BinaryExpressionComponent(props: BinaryProps) {
    const { model, userInputs, diagnosticHandler } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const { modelCtx } = stmtCtx;
    const { currentModel } = modelCtx;
    const hasLHSSelected = currentModel.model &&
        isPositionsEquals(currentModel.model.position, model.lhsExpr.position);
    const hasOperatorSelected = currentModel.model &&
        isPositionsEquals(currentModel.model.position, model.operator.position);
    const hasRHSSelected = currentModel.model &&
        isPositionsEquals(currentModel.model.position, model.rhsExpr.position);

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);

    const lhs: ReactNode = (
        <ExpressionComponent
            model={model.lhsExpr}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );
    const rhs: ReactNode = (
        <ExpressionComponent
            model={model.rhsExpr}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    const operator: ReactNode = (
        <ExpressionComponent
            model={model.operator}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    const kind = getKindBasedOnOperator(model.operator.kind);

    const onClickOperator = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.operator, true, false,
            { expressionSuggestions: getOperatorSuggestions(kind) })
    }

    const onClickOnLhsExpression = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.lhsExpr, false, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
    };

    const onClickOnRhsExpression = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.rhsExpr, false, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
    };

    return (
        <span>
            <button
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasLHSSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOnLhsExpression}
            >
                {lhs}
            </button>
            <button
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasOperatorSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOperator}
            >
                {operator}
            </button>
            <button
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasRHSSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOnRhsExpression}
            >
                {rhs}
            </button>
        </span>
    );
}
