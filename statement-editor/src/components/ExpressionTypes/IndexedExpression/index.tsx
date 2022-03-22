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
import React, { ReactNode } from "react";

import { IndexedExpression, STNode } from "@wso2-enterprise/syntax-tree";

import { ExpressionComponent } from "../../Expression";
import { TokenComponent } from "../../Token";

interface IndexedExpressionProps {
    model: IndexedExpression;
}

export function IndexedExpressionComponent(props: IndexedExpressionProps) {
    const { model } = props;

    const keyExprComponent = (
        <span>
            {
                model.keyExpression.map((expression: STNode, index: number) => (
                    <ExpressionComponent
                            key={index}
                            model={expression}
                    />
                ))
            }
        </span>
    );

    const containerExpr: ReactNode = (
        <ExpressionComponent
            model={model.containerExpression}
        />
    );

    return (
        <span>
            {containerExpr}
            <TokenComponent model={model.openBracket} />
            {keyExprComponent}
            <TokenComponent model={model.closeBracket} />
        </span>
    );
}
