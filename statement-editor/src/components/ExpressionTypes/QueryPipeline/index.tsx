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
import React from "react";

import { QueryPipeline } from "@wso2-enterprise/syntax-tree";

import { ArrayType } from "../../../constants";
import { ExpressionComponent } from "../../Expression";
import { ExpressionArrayComponent } from "../../ExpressionArray";

interface QueryPipelineProps {
    model: QueryPipeline;
}

export function QueryPipelineComponent(props: QueryPipelineProps) {
    const { model } = props;

    return (
        <>
            <ExpressionComponent model={model.fromClause} />
            <ExpressionArrayComponent
                modifiable={true}
                arrayType={ArrayType.INTERMEDIATE_CLAUSE}
                expressions={model.intermediateClauses}
            />
        </>
    );
}
