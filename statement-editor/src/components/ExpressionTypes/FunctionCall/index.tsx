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

import { FunctionCall, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface FunctionCallProps {
    model: FunctionCall;
}

export function FunctionCallComponent(props: FunctionCallProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            changeCurrentModel
        }
    } = stmtCtx;
    const statementEditorClasses = useStatementEditorStyles();

    const onClickOnFunctionCallExpr = async (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model);
    }

    const expressionComponent = (
        <span>
            {
                model.arguments.map((expression: STNode, index: number) => (
                    (STKindChecker.isCommaToken(expression)) ? (
                        <span
                            key={index}
                            className={classNames(
                                statementEditorClasses.expressionBlock,
                                statementEditorClasses.expressionBlockDisabled
                            )}
                        >
                            {expression.value}
                        </span>
                    ) : (
                        <ExpressionComponent
                            model={expression}
                        />
                    )
                ))
            }
        </span>
    );

    const functionName: ReactNode = (
        <ExpressionComponent
            model={model.functionName}
            onSelect={onClickOnFunctionCallExpr}
        >
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.openParenToken.value}
            </span>
            {expressionComponent}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.closeParenToken.value}
            </span>
        </ExpressionComponent>
    );

    return (
        <span>
            {functionName}
        </span>
    );
}
