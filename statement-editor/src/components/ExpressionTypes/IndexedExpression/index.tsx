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
import React, { useContext } from "react";

import { IndexedExpression } from "@wso2-enterprise/syntax-tree";

import { EXPR_CONSTRUCTOR } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { NewExprAddButton } from "../../Button/NewExprAddButton";
import { ExpressionComponent } from "../../Expression";
import { ExpressionArrayComponent } from "../../ExpressionArray";
import { TokenComponent } from "../../Token";

interface IndexedExpressionProps {
    model: IndexedExpression;
}

export function IndexedExpressionComponent(props: IndexedExpressionProps) {
    const { model } = props;
    const {
        modelCtx: {
            updateModel,
        }
    } = useContext(StatementEditorContext);

    const addNewExpression = () => {
        const expr = `, ${EXPR_CONSTRUCTOR}`;
        const newPosition =  {
            startLine: model.keyExpression[model.keyExpression.length - 1].position.endLine,
            startColumn: model.keyExpression[model.keyExpression.length - 1].position.endColumn,
            endLine: model.closeBracket.position.startLine,
            endColumn: model.closeBracket.position.startColumn
        }
        updateModel(expr, newPosition);
    };

    return (
        <>
            <ExpressionComponent model={model.containerExpression} />
            <TokenComponent model={model.openBracket} />
            <ExpressionArrayComponent expressions={model.keyExpression} />
            <NewExprAddButton model={model} onClick={addNewExpression}/>
            <TokenComponent model={model.closeBracket} />
        </>
    );
}
