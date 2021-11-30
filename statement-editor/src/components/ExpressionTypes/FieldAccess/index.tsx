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

import { FieldAccess } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind, isPositionsEquals } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface FieldAccessProps {
    model: FieldAccess
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function FieldAccessComponent(props: FieldAccessProps) {
    const { model, userInputs, diagnosticHandler } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const { modelCtx } = stmtCtx;
    const { currentModel } = modelCtx;
    let hasFieldAccessExprSelected = false;
    let hasExprSelected = false;
    let hasFieldNameSelected = false;

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);


    const expression: ReactNode = (
        <ExpressionComponent
            model={model.expression}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    const fieldName: ReactNode = (
        <ExpressionComponent
            model={model.fieldName}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    const onClickOnFieldAccessExpr = (event: any) => {
        event.stopPropagation()
        expressionHandler(model, true, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
    }

    const onClickOnExpr = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.expression, true, false,
            { expressionSuggestions: [], typeSuggestions: [], variableSuggestions: [] })
    }

    const onClickOnFieldName = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.fieldName, true, false,
            { expressionSuggestions: [], typeSuggestions: [], variableSuggestions: [] })
    }

    if (currentModel.model) {
        if (isPositionsEquals(currentModel.model.position, model.position)) {
            hasFieldAccessExprSelected = true;
        } else if (isPositionsEquals(currentModel.model.position, model.expression.position)) {
            hasExprSelected = true;
        } else if (isPositionsEquals(currentModel.model.position, model.fieldName.position)) {
            hasFieldNameSelected = true;
        }
    }

    return (
        <span>
            <button
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasFieldAccessExprSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOnFieldAccessExpr}
            >
                <button
                    className={classNames(statementEditorClasses.expressionElement,
                        hasExprSelected && statementEditorClasses.expressionElementSelected
                    )}
                    onClick={onClickOnExpr}
                >
                    {expression}
                </button>
                <span
                    className={classNames(
                        statementEditorClasses.expressionBlock,
                        statementEditorClasses.expressionBlockDisabled
                    )}
                >
                    {model.dotToken.value}
                </span>
                <button
                    className={classNames(
                        statementEditorClasses.expressionElement,
                        hasFieldNameSelected && statementEditorClasses.expressionElementSelected
                    )}
                    onClick={onClickOnFieldName}
                >
                    {fieldName}
                </button>
            </button>
        </span>
    );
}
