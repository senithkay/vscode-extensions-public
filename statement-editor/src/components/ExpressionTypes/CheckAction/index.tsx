/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { ReactNode, useContext } from "react";

import { CheckAction } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface CheckActionProps {
    model: CheckAction;
}

export function CheckActionComponent(props: CheckActionProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            changeCurrentModel
        }
    } = stmtCtx;

    const statementEditorClasses = useStatementEditorStyles();

    const onClickOnExpression = async (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model.expression);
    };

    const spanClassName =  classNames(
                                statementEditorClasses.expressionBlock,
                                statementEditorClasses.expressionBlockDisabled,
                                "keyword"
                            );
    const expressionComponent: ReactNode = (
        <ExpressionComponent
            model={model.expression}
            onSelect={onClickOnExpression}
        />
    );
    return (
        <span>
            <span className={spanClassName}>
                {model.checkKeyword.value}
            </span>
            {expressionComponent}
        </span>
    );
}
