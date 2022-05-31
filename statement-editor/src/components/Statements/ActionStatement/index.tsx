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
// tslint:disable: jsx-no-multiline-js
import React, { useContext } from "react";

import { ActionStatement } from "@wso2-enterprise/syntax-tree";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExpressionComponent } from "../../Expression";
import { TokenComponent } from "../../Token";


interface ReturnStatementProps {
    model: ActionStatement;
}

export function ActionStatementC(props: ReturnStatementProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            currentModel,
            changeCurrentModel
        }
    } = stmtCtx;

    if (!currentModel.model) {
        changeCurrentModel(model.expression);
    }

    let component: JSX.Element = undefined;

    if (model.expression?.kind === "AsyncSendAction") {
        const expressionModel: any = model.expression as any;
        component = (
            <>
                <ExpressionComponent model={expressionModel.expression} />
                <TokenComponent model={expressionModel.rightArrowToken} /> 
                <ExpressionComponent model={expressionModel.peerWorker} />
                <TokenComponent model={model.semicolonToken} />
            </>
        )
    } else {
        component = (
            <>
                <ExpressionComponent model={model.expression} />
                <TokenComponent model={model.semicolonToken} />
            </>
        )
    }

    return (
        component
    );
}
