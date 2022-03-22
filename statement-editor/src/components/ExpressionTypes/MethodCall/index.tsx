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

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExpressionComponent } from "../../Expression";
import { ExpressionArrayComponent } from "../../ExpressionArray";
import { useStatementEditorStyles } from "../../styles";
import { TokenComponent } from "../../Token";

interface MethodCallProps {
    model: MethodCall;
}

export function MethodCallComponent(props: MethodCallProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            changeCurrentModel
        }
    } = stmtCtx;

    const statementEditorClasses = useStatementEditorStyles();

    const expressionArgComponent = (
        <ExpressionArrayComponent
            expressions={model.arguments}
        />
    );

    const onClickOnExpression = async (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model.expression);
    };

    const onClickOnMethodName = async (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model.methodName);
    };

    const expression: ReactNode = (
        <ExpressionComponent
            model={model.expression}
            onSelect={onClickOnExpression}
        />
    );

    const methodName: ReactNode = (
        <ExpressionComponent
            model={model.methodName}
            onSelect={onClickOnMethodName}
        >
            <TokenComponent model={model.openParenToken} />
            {expressionArgComponent}
            <TokenComponent model={model.closeParenToken} />
        </ExpressionComponent>
    );

    return (
        <span>
            {expression}
            <TokenComponent model={model.dotToken} />
            {methodName}
        </span>
    );
}
