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
import React, { ReactNode } from "react";

import { ListConstructor, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { VariableUserInputs } from "../../../models/definitions";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface ListConstructorProps {
    model: ListConstructor
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function ListConstructorComponent(props: ListConstructorProps) {
    const { model, userInputs, diagnosticHandler } = props;

    const statementEditorClasses = useStatementEditorStyles();

    const expressions: (ReactNode | string)[] = [];

    model.expressions.forEach((expression: STNode) => {
        if (STKindChecker.isCommaToken(expression)) {
            expressions.push(expression.value);
        } else {
            const expr: ReactNode = <ExpressionComponent
                model={expression}
                isRoot={false}
                userInputs={userInputs}
                diagnosticHandler={diagnosticHandler}
                isTypeDescriptor={false}
            />;
            expressions.push(expr)
        }
    });

    const expressionComponent = (
            <span>
                {
                    expressions.map((expr: ReactNode | string, index: number) => (
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

    return (
        <span>
            <span
                className={classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)}
            >
                &nbsp;{model.openBracket.value}
            </span>
            {expressionComponent}
            <span
                className={classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)}
            >
                {model.closeBracket.value}
            </span>
        </span>
    );
}
