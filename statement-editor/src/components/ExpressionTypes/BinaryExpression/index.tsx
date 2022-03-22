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

import { BinaryExpression } from "@wso2-enterprise/syntax-tree";

import { ModelKind } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExpressionComponent } from "../../Expression";

interface BinaryProps {
    model: BinaryExpression;
}

export function BinaryExpressionComponent(props: BinaryProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            changeCurrentModel
        }
    } = stmtCtx;

    // const onClickOperator = (event: any) => {
    //     event.stopPropagation();
    //     changeCurrentModel(model.operator, ModelKind.Operator);
    // }

    // const onClickOnLhsExpression = async (event: any) => {
    //     event.stopPropagation();
    //     changeCurrentModel(model.lhsExpr);
    // };

    // const onClickOnRhsExpression = async (event: any) => {
    //     event.stopPropagation();
    //     changeCurrentModel(model.rhsExpr);
    // };

    const lhs: ReactNode = (
        <ExpressionComponent
            model={model.lhsExpr}
            // onSelect={onClickOnLhsExpression}
            deleteConfig={{defaultExprDeletable: true}}
        />
    );
    const rhs: ReactNode = (
        <ExpressionComponent
            model={model.rhsExpr}
            // onSelect={onClickOnRhsExpression}
            deleteConfig={{defaultExprDeletable: true}}
        />
    );

    const operator: ReactNode = (
        <ExpressionComponent
            model={model.operator}
            // onSelect={onClickOperator}
            classNames="operator"
            modelKind={ModelKind.Operator}
        />
    );

    return (
        <span>
            {lhs}
            {operator}
            {rhs}
        </span>
    );
}
