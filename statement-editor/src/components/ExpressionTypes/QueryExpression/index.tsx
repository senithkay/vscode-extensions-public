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
import React, { ReactNode, useContext } from "react";

import { QueryExpression } from "@wso2-enterprise/syntax-tree";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExpressionComponent } from "../../Expression";
import { ExpressionArrayComponent } from "../../ExpressionArray";
import { useStatementEditorStyles } from "../../styles";
import { TokenComponent } from "../../Token";

interface QueryExpressionProps {
    model: QueryExpression;
}

export function QueryExpressionComponent(props: QueryExpressionProps) {
    const { model } = props;

    const selectClauseComponent: ReactNode = (
        <ExpressionComponent
            model={model.selectClause}
        />
    );
    const queryConstructTypeComponent: ReactNode = (
        <ExpressionComponent
            model={model.queryConstructType}
        />
    );

    const queryPipelineComponent: ReactNode = (
        <ExpressionComponent
            model={model.queryPipeline}
        />
    );

    return (
        <span>
            {model.queryConstructType && queryConstructTypeComponent}
            {queryPipelineComponent}
            {selectClauseComponent}
        </span>
    );
}
