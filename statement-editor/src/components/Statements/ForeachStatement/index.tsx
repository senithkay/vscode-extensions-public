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

import { ForeachStatement } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";
import { TokenComponent } from "../../Token";

interface ForeachStatementProps {
    model: ForeachStatement;
}

export function ForeachStatementC(props: ForeachStatementProps) {
    const { model } = props;

    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            currentModel,
            changeCurrentModel
        }
    } = stmtCtx;

    const statementEditorClasses = useStatementEditorStyles();

    if (!currentModel.model) {
        changeCurrentModel(model.actionOrExpressionNode);
    }

    const typedBindingComponent: ReactNode = (
        <ExpressionComponent
            model={model.typedBindingPattern}
        />
    );

    const actionOrExprComponent: ReactNode = (
        <ExpressionComponent
            model={model.actionOrExpressionNode}
        />
    );

    return (
        <span>
            <TokenComponent model={model.forEachKeyword}  className="keyword" />
            {typedBindingComponent}
            <TokenComponent model={model.inKeyword}  className="keyword" />
            {actionOrExprComponent}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                &nbsp;{model.blockStatement.openBraceToken.value}
                <br/>
                &nbsp;&nbsp;&nbsp;{"..."}
                <br/>
                {model.blockStatement.closeBraceToken.value}
            </span>
        </span>
    );
}
