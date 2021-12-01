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
import React, {ReactNode, useContext} from "react";

import { AssignmentStatement } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind, getTypeDescriptors } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface AssignmentStatementProps {
    model: AssignmentStatement
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function AssignmentStatementComponent(props: AssignmentStatementProps) {
    const { model, userInputs, diagnosticHandler } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const { modelCtx } = stmtCtx;
    const { currentModel } = modelCtx;
    let hasVarRefSelected = false;
    let hasExpressionSelected = false;

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

    const varRef: ReactNode = (
        <ExpressionComponent
            model={model.varRef}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    const onClickOnVarRef = (event: any) => {
        event.stopPropagation();
        expressionHandler(model.varRef, false, false,
            {expressionSuggestions: [], typeSuggestions: getTypeDescriptors(), variableSuggestions: []});
    };

    const onClickOnExpression = (event: any) => {
        event.stopPropagation();
        expressionHandler(model.expression, false, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) });
    };

    if (currentModel.model) {
        if (currentModel.model.position === model.varRef.position) {
            hasVarRefSelected = true;
        } else if (currentModel.model.position === model.expression.position) {
            hasExpressionSelected = true;
        }
    }

    return (
        <span>
            <button
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasVarRefSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOnVarRef}
            >
                {varRef}
            </button>
            <span className={classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)}>
                {model.equalsToken.value}
            </span>
            <button
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasExpressionSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOnExpression}
            >
                {expression}
            </button>
            <span className={classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)}>
                {model.semicolonToken.value}
            </span>
        </span>
    );
}
