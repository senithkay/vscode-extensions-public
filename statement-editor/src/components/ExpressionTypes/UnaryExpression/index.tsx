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
import React, { ReactNode } from "react";

import { UnaryExpression } from "@wso2-enterprise/syntax-tree";

import { ExpressionComponent } from "../../Expression";

interface UnaryProps {
    model: UnaryExpression;
}

export function UnaryExpressionComponent(props: UnaryProps) {
    const { model } = props;

    const expression: ReactNode = (
        <ExpressionComponent
            model={model.expression}
        />
    );

    const operator: ReactNode = (
        <ExpressionComponent
            model={model.unaryOperator}
        />
    );

    return (
        <span>
            {operator}
            {expression}
        </span>
    );
}
