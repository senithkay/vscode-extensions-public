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

import { IfElseStatement, STKindChecker } from "@wso2-enterprise/syntax-tree"
import classNames from "classnames";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExpressionComponent } from "../../Expression";
import { StatementRenderer } from "../../StatementRenderer";
import { useStatementEditorStyles } from "../../styles";

interface IfStatementProps {
    model: IfElseStatement;
}

export function IfStatementC(props: IfStatementProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            currentModel,
            changeCurrentModel
        }
    } = stmtCtx;

    const statementEditorClasses = useStatementEditorStyles();

    const elseBlockComponent: ReactNode = (
        <StatementRenderer
            model={model.elseBody}
        />
    );

    const onClickOnConditionExpression = async (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model.condition);
    };

    if (!currentModel.model && !STKindChecker.isElseBlock(model)) {
        changeCurrentModel(model.condition);
    }

    const conditionComponent: ReactNode = (
        <ExpressionComponent
            model={model.condition}
            onSelect={onClickOnConditionExpression}
        />
    );

    return (
        <span>
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled,
                    "keyword"
                )}
            >
                {model.ifKeyword.value}
            </span>
            {conditionComponent}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                &nbsp;{model.ifBody.openBraceToken.value}
                <br/>
                &nbsp;&nbsp;&nbsp;{"..."}
                <br/>
                {model.ifBody.closeBraceToken.value}
            </span>
            {!!model.elseBody && elseBlockComponent}
        </span>
    );
}
