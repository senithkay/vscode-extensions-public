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

import { MethodCall, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface MethodCallProps {
    model: MethodCall
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function MethodCallComponent(props: MethodCallProps) {
    const { model, userInputs, diagnosticHandler } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const { modelCtx } = stmtCtx;
    const { currentModel } = modelCtx;
    let hasMethodNameSelected = false;

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

    const methodName: ReactNode = (
        <ExpressionComponent
            model={model.methodName}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    if (currentModel.model) {
        if (currentModel.model.position === model.methodName.position) {
            hasMethodNameSelected = true;
        }
    }

    const expressionArgComponent = (
        <span>
            {
                model.arguments.map((argument: STNode, index: number) => (
                    (STKindChecker.isCommaToken(argument)) ? (
                        <span
                            key={index}
                            className={classNames(
                                statementEditorClasses.expressionBlock,
                                statementEditorClasses.expressionBlockDisabled
                            )}
                        >
                            {argument.value}
                        </span>
                    ) : (
                        <ExpressionComponent
                            model={argument}
                            isRoot={false}
                            userInputs={userInputs}
                            diagnosticHandler={diagnosticHandler}
                            isTypeDescriptor={false}
                        />
                    )
                ))
            }
        </span>
    );

    const onClickOnMethodName = (event: any) => {
        event.stopPropagation();
        expressionHandler(model.methodName, false, false,
            { expressionSuggestions: [], typeSuggestions: [], variableSuggestions: [] })
    };

    return (
        <span>
            {expression}
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
                    hasMethodNameSelected && statementEditorClasses.expressionElementSelected)}
                onClick={onClickOnMethodName}
            >
                {methodName}
            </button>
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.openParenToken.value}
            </span>
            {expressionArgComponent}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.closeParenToken.value}
            </span>
        </span>
    );
}
