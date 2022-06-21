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

import { IfElseStatement, NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree"

import { ELSEIF_CLAUSE } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { NewExprAddButton } from "../../Button/NewExprAddButton";
import { ExpressionComponent } from "../../Expression";
import { StatementRenderer } from "../../StatementRenderer";
import { TokenComponent } from "../../Token";

interface IfStatementProps {
    model: IfElseStatement;
}

export function IfStatementC(props: IfStatementProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            currentModel,
            changeCurrentModel,
            updateModel
        }
    } = stmtCtx;

    if (!currentModel.model && !STKindChecker.isElseBlock(model)) {
        changeCurrentModel(model.condition);
    }

    const isFinalIfElseStatement = !(model.elseBody?.elseBody as IfElseStatement)?.ifBody;

    const addNewExpression = (ifBodyModel: STNode) => {
        const newPosition: NodePosition = {
            ...ifBodyModel.position
        }
        updateModel(`${ELSEIF_CLAUSE}`, newPosition);
    };

    return (
        <>
            <TokenComponent model={model.ifKeyword} className="keyword" />
            <ExpressionComponent model={model.condition} />
            <TokenComponent model={model.ifBody.openBraceToken} />
            &nbsp;&nbsp;&nbsp;{"..."}
            <TokenComponent model={model.ifBody.closeBraceToken} />
            {isFinalIfElseStatement && (
                <>
                    <NewExprAddButton model={model.ifBody.closeBraceToken} onClick={addNewExpression} />
                    &nbsp;
                </>
            )}
            {!!model.elseBody && <StatementRenderer model={model.elseBody} />}
        </>
    );
}
