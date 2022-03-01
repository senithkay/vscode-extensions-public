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
import {
    BinaryExpression,
    NodePosition,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { RemainingContent } from "../models/definitions";
import { isPositionsEquals } from "../utils";

class ExpressionDeletingVisitor implements Visitor {
    private deletePosition: NodePosition;
    private newDeletePosition: NodePosition;
    private codeAfterDeletion: string;

    public beginVisitBinaryExpression(node: BinaryExpression) {
        const lhsPosition = node.lhsExpr.position;
        const operatorPosition = node.operator.position;
        const rhsPosition = node.rhsExpr.position;

        if (isPositionsEquals(lhsPosition, this.deletePosition)) {
            this.codeAfterDeletion = `${node.operator.value}${node.rhsExpr.source}`;
            this.newDeletePosition = node.position;
        }

        if (isPositionsEquals(operatorPosition, this.deletePosition)) {
            this.codeAfterDeletion = node.lhsExpr.source;
            this.newDeletePosition = node.position;
        }

        if (isPositionsEquals(rhsPosition, this.deletePosition)) {
            this.codeAfterDeletion = node.lhsExpr.source;
            this.newDeletePosition = node.position;
        }
    }

    public beginVisitSTNode(node: STNode, parent?: STNode) {
        // To be implemented
    }

    getContent(): RemainingContent {
        return {
            code: this.codeAfterDeletion,
            position: this.newDeletePosition
        };
    }

    setPosition(position: NodePosition) {
        this.deletePosition = position;
    }
}

export const visitor = new ExpressionDeletingVisitor();
