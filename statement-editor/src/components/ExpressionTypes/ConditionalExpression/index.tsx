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

import { ConditionalExpression } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface ConditionalExpressionProps {
    model: ConditionalExpression;
}

export function ConditionalExpressionComponent(props: ConditionalExpressionProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            changeCurrentModel
        }
    } = stmtCtx;

    const statementEditorClasses = useStatementEditorStyles();

    const onClickOnLhsExpression = async (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model.lhsExpression);
    }

    const onClickOnMiddleExpression = async (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model.middleExpression);
    };

    const onClickOnEndExpression = async (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model.endExpression);
    };

    const lhsExpression: ReactNode = (
        <ExpressionComponent
            model={model.lhsExpression}
            onSelect={onClickOnLhsExpression}
        />
    );

    const middleExpression: ReactNode = (
        <ExpressionComponent
            model={model.middleExpression}
            onSelect={onClickOnMiddleExpression}
        />
    );

    const endExpression: ReactNode = (
        <ExpressionComponent
            model={model.endExpression}
            onSelect={onClickOnEndExpression}
        />
    );

    return (
        <span>
            {lhsExpression}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled,
                    "operator"
                )}
            >
                &nbsp;{model.questionMarkToken.value}
            </span>
            {middleExpression}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled,
                    "operator"
                )}
            >
                &nbsp;{model.colonToken.value}
            </span>
            {endExpression}
        </span>
    );
}
