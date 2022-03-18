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

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface IndexedExpressionProps {
    model: IndexedExpression;
}

export function IndexedExpressionComponent(props: IndexedExpressionProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            changeCurrentModel
        }
    } = stmtCtx;

    const statementEditorClasses = useStatementEditorStyles();

    const keyExprComponent = (
        <span>
            {
                model.keyExpression.map((expression: STNode, index: number) => (
                    <ExpressionComponent
                            key={index}
                            model={expression}
                            onSelect={(event) => onClickOnKeyExpr(expression, event)}
                    />
                ))
            }
        </span>
    );

    const onClickOnContainerExpr = (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model.containerExpression);
    };

    const onClickOnKeyExpr = async (clickedExpression: STNode, event: any) => {
        event.stopPropagation();
        changeCurrentModel(clickedExpression);
    };

    const containerExpr: ReactNode = (
        <ExpressionComponent
            model={model.containerExpression}
            onSelect={onClickOnContainerExpr}
        />
    );

    return (
        <span>
            {containerExpr}
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
