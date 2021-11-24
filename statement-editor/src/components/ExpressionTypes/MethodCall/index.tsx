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
// tslint:disable: jsx-wrap-multiline jsx-no-multiline-js
import React, { ReactNode, useContext } from "react";

import { MethodCall, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { VariableUserInputs } from "../../../models/definitions";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface MethodCallProps {
    model: MethodCall
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function MethodCallComponent(props: MethodCallProps) {
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

    const methodName: ReactNode = <ExpressionComponent
        model={model.methodName}
        isRoot={false}
        userInputs={userInputs}
        diagnosticHandler={diagnosticHandler}
        isTypeDescriptor={false}
    />;

    const exprArguments: (ReactNode | string)[] = [];

    model.arguments.forEach((expr: STNode) => {
        if (STKindChecker.isCommaToken(expr)) {
            exprArguments.push(expr.value);
        } else {
            const expressionArg: ReactNode = <ExpressionComponent
                model={expr}
                isRoot={false}
                userInputs={userInputs}
                diagnosticHandler={diagnosticHandler}
                isTypeDescriptor={false}
            />;
            exprArguments.push(expressionArg)
        }
    });

    const expressionArgComponent = (
        <span>
                {
                    exprArguments.map((expr: ReactNode | string, index: number) => (
                        (typeof expr === 'string') ?
                            (
                                <span
                                    key={index}
                                    className={
                                        classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)
                                    }
                                >
                                    {expr}
                                </span>
                            ) :
                            (
                                <button
                                    key={index}
                                    className={statementEditorClasses.expressionElement}
                                >
                                    {expr}
                                </button>
                            )
                    ))
                }
            </span>
    );

    const onClickOnExpression = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.expression, false, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
    };

    return (
        <span>
            <button
                className={statementEditorClasses.expressionElement}
                onClick={onClickOnExpression}
            >
                {expression}
            </button>
            <span className={classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)}>
                {model.dotToken.value}
            </span>
            <button
                className={statementEditorClasses.expressionElement}
            >
                {methodName}
            </button>
            <span className={classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)}>
                {model.openParenToken.value}
            </span>
            {expressionArgComponent}
            <span className={classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)}>
                {model.closeParenToken.value}
            </span>
        </span>
    );
}
