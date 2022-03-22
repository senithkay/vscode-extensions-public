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

import { XmlTemplateExpression} from "@wso2-enterprise/syntax-tree";

import { ExpressionArrayComponent } from "../../ExpressionArray";
import { TokenComponent } from "../../Token";

interface XmlTemplateExpressionProps {
    model: XmlTemplateExpression;
}

export function XmlTemplateExpressionComponent(props: XmlTemplateExpressionProps) {
    const { model } = props;

    const contentComponent: ReactNode = (
        <ExpressionArrayComponent
            expressions={model.content}
        />
    );

    return (
        <span>
            <TokenComponent model={model.type} className={"keyword"} />
            <TokenComponent model={model.startBacktick} />
            {contentComponent}
            <TokenComponent model={model.endBacktick} />
        </span>
    );
}
