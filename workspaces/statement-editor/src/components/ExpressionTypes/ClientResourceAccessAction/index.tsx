/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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

import { ClientResourceAccessAction, NodePosition } from "@wso2-enterprise/syntax-tree";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { EXPR_PLACEHOLDER } from "../../../utils/expressions";
import { NewExprAddButton } from "../../Button/NewExprAddButton";
import { ExpressionComponent } from "../../Expression";
import { ExpressionArrayComponent } from "../../ExpressionArray";
import { TokenComponent } from "../../Token";

interface ClientResourceAccessActionProps {
    model: ClientResourceAccessAction;
}

export function ClientResourceAccessActionComponent(props: ClientResourceAccessActionProps) {
    const { model } = props;
    const {
        modelCtx: {
            updateModel
        }
    } = useContext(StatementEditorContext);

    const methodPosition: NodePosition = model.methodName?.position;
    if (model.arguments && methodPosition) {
        methodPosition.endLine = model.arguments.closeParenToken.position.endLLine;
        methodPosition.endColumn = model.arguments.closeParenToken.position.endColumn;
    }

    const addNewExpression = () => {
        const expression = `.${EXPR_PLACEHOLDER}`;
        const position: NodePosition =  model.position;
        position.startColumn = model.position.endColumn;
        position.startLine = model.position.endLine;
        updateModel(expression, position);
    };

    return (
        <>
            <ExpressionComponent model={model.expression} />
            <TokenComponent model={model.rightArrowToken} className={"operator"} />
            {model.resourceAccessPath.length ? <TokenComponent model={model.slashToken}  />
                : <ExpressionComponent model={model.slashToken} />}
            {model.resourceAccessPath && <ExpressionArrayComponent expressions={model.resourceAccessPath} />}
            {model.dotToken && <TokenComponent model={model.dotToken} className={"operator"} />}

            {model.methodName && (
                <ExpressionComponent model={model.methodName} stmtPosition={methodPosition}>
                    {model.arguments?.openParenToken && <TokenComponent model={model.arguments.openParenToken} />}
                    {model.arguments?.arguments && <ExpressionArrayComponent expressions={model.arguments.arguments} />}
                    {model.arguments?.closeParenToken && <TokenComponent model={model.arguments.closeParenToken} />}
                </ExpressionComponent>
            )}
            {!model.methodName && (
                <NewExprAddButton model={model} onClick={addNewExpression}/>
            )}
        </>
    );
}
