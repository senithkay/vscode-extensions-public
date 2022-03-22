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

import { Interpolation} from "@wso2-enterprise/syntax-tree";

import { ExpressionComponent } from "../../Expression";
import { TokenComponent } from "../../Token";

interface InterpolationProps {
    model: Interpolation;
}

export function InterpolationComponent(props: InterpolationProps) {
    const { model } = props;

    const expressionComponent: ReactNode = (
        <ExpressionComponent
            model={model.expression}
        />
    );

    return (
        <span>
            <TokenComponent model={model.interpolationStartToken} />
            {expressionComponent}
            <TokenComponent model={model.interpolationEndToken} />
        </span>
    );
}
