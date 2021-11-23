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

import { FieldAccess } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { VariableUserInputs } from "../../../models/definitions";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface FieldAccessProps {
    model: FieldAccess
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function FieldAccessComponent(props: FieldAccessProps) {
    const { model, userInputs, diagnosticHandler } = props;

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);


    const expression: ReactNode = <ExpressionComponent
        model={model.expression}
        isRoot={false}
        userInputs={userInputs}
        diagnosticHandler={diagnosticHandler}
        isTypeDescriptor={false}
    />;

    const fieldName: ReactNode = <ExpressionComponent
        model={model.fieldName}
        isRoot={false}
        userInputs={userInputs}
        diagnosticHandler={diagnosticHandler}
        isTypeDescriptor={false}
    />;

    const onClickOnExpression = (event: any) => {
        event.stopPropagation()
        expressionHandler(model, true, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
    }

    return (
        <span>
            <button
                className={statementEditorClasses.expressionElement}
                onClick={onClickOnExpression}
            >
            <button
                className={statementEditorClasses.expressionElement}
            >
                {expression}
            </button>
            <span className={classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)}>
                {model.dotToken.value}
            </span>
            <button
                className={statementEditorClasses.expressionElement}
            >
                {fieldName}
            </button>
            </button>
        </span>
    );
}
