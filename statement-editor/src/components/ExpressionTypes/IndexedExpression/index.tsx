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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { ReactNode, useContext } from "react";

import { IndexedExpression, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind, isPositionsEquals } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface IndexedExpressionProps {
    model: IndexedExpression
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function IndexedExpressionComponent(props: IndexedExpressionProps) {
    const { model, userInputs, diagnosticHandler } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const { modelCtx } = stmtCtx;
    const { currentModel } = modelCtx;
    let hasContainerExprSelected = false;

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);

    const containerExpr: ReactNode = (
        <ExpressionComponent
            model={model.containerExpression}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    const keyExprComponent = (
        <span>
            {
                model.keyExpression.map((expression: STNode, index: number) => (
                    <button
                        key={index}
                        className={classNames(
                            statementEditorClasses.expressionElement,
                            (currentModel.model && currentModel.model.position === expression.position) &&
                            statementEditorClasses.expressionElementSelected
                        )}
                        onClick={(event) => onClickOnKeyExpr(expression, event)}
                    >
                        <ExpressionComponent
                            model={expression}
                            isRoot={false}
                            userInputs={userInputs}
                            diagnosticHandler={diagnosticHandler}
                            isTypeDescriptor={false}
                        />
                    </button>
                ))
            }
        </span>
    );

    const onClickOnContainerExpr = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.containerExpression, false, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
    };

    const onClickOnKeyExpr = (clickedExpression: STNode, event: any) => {
        event.stopPropagation()
        expressionHandler(clickedExpression, false, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
    };

    if (currentModel.model) {
        if (isPositionsEquals(currentModel.model.position, model.containerExpression.position)) {
            hasContainerExprSelected = true;
        }
    }

    return (
        <span>
            <button
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasContainerExprSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOnContainerExpr}
            >
                {containerExpr}
            </button>
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.openBracket.value}
            </span>
            {keyExprComponent}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.closeBracket.value}
            </span>
        </span>
    );
}
