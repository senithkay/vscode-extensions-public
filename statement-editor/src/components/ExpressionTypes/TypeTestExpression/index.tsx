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
import React, { ReactNode } from "react";

import { TypeTestExpression } from "@wso2-enterprise/syntax-tree";

import { ModelKind } from "../../../models/definitions";
import { ExpressionComponent } from "../../Expression";
import { TokenComponent } from "../../Token";

interface TypeTestExpressionProps {
    model: TypeTestExpression;
}

export function TypeTestExpressionComponent(props: TypeTestExpressionProps) {
    const { model } = props;

    const expr: ReactNode = (
        <ExpressionComponent
            model={model.expression}
        />
    );

    const typeDescriptor: ReactNode = (
        <ExpressionComponent
            model={model.typeDescriptor}
            isTypeDesc={true}
            modelKind={ModelKind.TypeDesc}
        />
    );

    return (
        <span>
            {expr}
            <TokenComponent model={model.isKeyword} />
            {typeDescriptor}
        </span>
    );
}
