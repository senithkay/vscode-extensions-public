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
import React, { useContext } from "react";

import { ListConstructor, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { APPEND_EXPR_LIST_CONSTRUCTOR, INIT_EXPR_LIST_CONSTRUCTOR } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExpressionArrayComponent } from "../../ExpressionArray";
import { useStatementEditorStyles } from "../../styles";

interface ListConstructorProps {
    model: ListConstructor;
}

export function ListConstructorComponent(props: ListConstructorProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            updateModel,
            changeCurrentModel
        }
    } = stmtCtx;

    const statementEditorClasses = useStatementEditorStyles();

    const onClickOnExpression = async (clickedExpression: STNode, event: any) => {
        event.stopPropagation();
        changeCurrentModel(clickedExpression);
    };

    const expressionComponent = (
        <ExpressionArrayComponent
            expressions={model.expressions}
        />
    );

    const onClickOnPlusIcon = (event: any) => {
        event.stopPropagation();
        const newExpression = model.expressions.length !== 0 ? APPEND_EXPR_LIST_CONSTRUCTOR : INIT_EXPR_LIST_CONSTRUCTOR;
        updateModel(newExpression, model.closeBracket.position);
    };

    return (
        <span>
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.openBracket.value}
            </span>
            {expressionComponent}
            <span
                className={statementEditorClasses.plusIcon}
                onClick={onClickOnPlusIcon}
            >
                +
            </span>
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
