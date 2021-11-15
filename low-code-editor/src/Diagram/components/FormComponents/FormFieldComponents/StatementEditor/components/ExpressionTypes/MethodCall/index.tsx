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

import { MethodCall, STKindChecker, STNode } from "@ballerina/syntax-tree";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { VariableUserInputs } from "../../../models/definitions";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../ViewContainer/styles";

interface MethodCallProps {
    model: MethodCall
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function MethodCallComponent(props: MethodCallProps) {
    const { model, userInputs, diagnosticHandler } = props;

    const overlayClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);

    const expression: ReactNode = <ExpressionComponent
        model={model.expression}
        isRoot={false}
        userInputs={userInputs}
        diagnosticHandler={diagnosticHandler}
    />;

    const methodName: ReactNode = <ExpressionComponent
        model={model.methodName}
        isRoot={false}
        userInputs={userInputs}
        diagnosticHandler={diagnosticHandler}
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
                                        `${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`
                                    }
                                >
                                    {expr}
                                </span>
                            ) :
                            (
                                <button
                                    key={index}
                                    className={overlayClasses.expressionElement}
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
        expressionHandler(model.expression, false, { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
    };

    return (
        <span>
            <button
                className={overlayClasses.expressionElement}
                onClick={onClickOnExpression}
            >
                {expression}
            </button>
            <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                {model.dotToken.value}
            </span>
            <button
                className={overlayClasses.expressionElement}
            >
                {methodName}
            </button>
            <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                {model.openParenToken.value}
            </span>
            {expressionArgComponent}
            <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                {model.closeParenToken.value}
            </span>
        </span>
    );
}
