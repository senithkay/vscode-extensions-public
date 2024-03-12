/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import {
    NodePosition,
    QueryExpression,
    SelectClause,
    STKindChecker,
    Visitor,
} from "@wso2-enterprise/syntax-tree";

import { isPositionsEquals } from "../../../utils/st-utils";

export class QueryExprFindingVisitorByPosition implements Visitor {
    private queryExpression: QueryExpression;
    private selectClauseIndex: number ;

    constructor(private position: NodePosition) {
        this.selectClauseIndex = 0;
    }

    public beginVisitSelectClause(node: SelectClause): void {
        if (!this.queryExpression) {
            this.selectClauseIndex++;
            if (STKindChecker.isQueryExpression(node.expression) && isPositionsEquals(node.expression.position, this.position)) {
                this.queryExpression = node.expression;
            }
        }
    }

    public getQueryExpression() {
        return this.queryExpression;
    }

    public getSelectClauseIndex() {
        return this.selectClauseIndex;
    }
}
