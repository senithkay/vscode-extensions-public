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

import { ListConstructor } from "@wso2-enterprise/syntax-tree";

import { APPEND_EXPR_LIST_CONSTRUCTOR, INIT_EXPR_LIST_CONSTRUCTOR } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { NewExprAddButton } from "../../Button/NewExprAddButton";
import { ExpressionArrayComponent } from "../../ExpressionArray";
import { TokenComponent } from "../../Token";

interface ListConstructorProps {
    model: ListConstructor;
}

export function ListConstructorComponent(props: ListConstructorProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            updateModel,
        }
    } = stmtCtx;

    const addNewExpression = () => {
        const newExpression = model.expressions.length !== 0 ? APPEND_EXPR_LIST_CONSTRUCTOR : INIT_EXPR_LIST_CONSTRUCTOR;
        updateModel(newExpression, model.closeBracket.position);
    };

    return (
        <>
            <TokenComponent model={model.openBracket} />
            <ExpressionArrayComponent expressions={model.expressions} />
            <NewExprAddButton model={model} onClick={addNewExpression}/>
            <TokenComponent model={model.closeBracket} />
        </>
    );
}
