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
    FieldAccess,
    ListConstructor,
    MappingConstructor,
    MethodCall,
    NodePosition,
    OptionalFieldAccess,
    STKindChecker,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { RemainingContent } from "../models/definitions";
import { isPositionsEquals } from "../utils";

const DEFAULT_EXPR = "EXPRESSION";

class ExpressionDeletingVisitor implements Visitor {
    private deletePosition: NodePosition;
    private newDeletePosition: NodePosition;
    private codeAfterDeletion: string = DEFAULT_EXPR;

    public beginVisitBinaryExpression(node: BinaryExpression) {
        const lhsPosition = node.lhsExpr.position;
        const operatorPosition = node.operator.position;
        const rhsPosition = node.rhsExpr.position;

        if (isPositionsEquals(this.deletePosition, lhsPosition)) {
            this.codeAfterDeletion = node.rhsExpr.source;
            this.newDeletePosition = node.position;
        } else if (isPositionsEquals(this.deletePosition, operatorPosition) ||
                    isPositionsEquals(this.deletePosition, rhsPosition)) {
            this.codeAfterDeletion = node.lhsExpr.source;
        }
    }

    public beginVisitFieldAccess(node: FieldAccess) {
        const exprPosition = node.expression.position;
        const fieldNamePosition = node.fieldName.position;

        if (isPositionsEquals(this.deletePosition, exprPosition)) {
            this.codeAfterDeletion = `${DEFAULT_EXPR}`;
            this.newDeletePosition = node.position;
        } else if (isPositionsEquals(this.deletePosition, fieldNamePosition)) {
            this.codeAfterDeletion = `${DEFAULT_EXPR}`;
            this.newDeletePosition = node.fieldName.position;
        }
    }

    public beginVisitOptionalFieldAccess(node: OptionalFieldAccess) {
        const exprPosition = node.expression.position;
        const fieldNamePosition = node.fieldName.position;

        if (isPositionsEquals(this.deletePosition, exprPosition)) {
            this.codeAfterDeletion = `${DEFAULT_EXPR}`;
            this.newDeletePosition = node.position;
        } else if (isPositionsEquals(this.deletePosition, fieldNamePosition)) {
            this.codeAfterDeletion = `${DEFAULT_EXPR}`;
            this.newDeletePosition = node.fieldName.position;
        }
    }

    public beginVisitMethodCall(node: MethodCall) {
        const exprPosition = node.expression.position;
        const methodNamePosition = node.methodName.position;
        const hasArgToBeDeleted = !!node.arguments.filter((arg) => {
            return this.deletePosition === arg.position;
        }).length;

        if (isPositionsEquals(this.deletePosition, exprPosition)) {
            this.codeAfterDeletion = `${DEFAULT_EXPR}`;
            this.newDeletePosition = node.position;
        } else if (isPositionsEquals(this.deletePosition, methodNamePosition)) {
            this.codeAfterDeletion = `${DEFAULT_EXPR}`;
            this.newDeletePosition = {
                ...node.methodName.position,
                endColumn: node.closeParenToken.position.endColumn
            };
        } else if (hasArgToBeDeleted) {
            this.codeAfterDeletion = `${DEFAULT_EXPR}`;
            this.newDeletePosition = this.deletePosition;
        }
    }

    public beginVisitListConstructor(node: ListConstructor) {
        const hasItemsToBeDeleted = !!node.expressions.filter((item) => {
            return this.deletePosition === item.position;
        }).length;

        if (hasItemsToBeDeleted) {
            const expressions : string[] = [];
            node.expressions.map((expr) => {
                if (this.deletePosition !== expr.position && !STKindChecker.isCommaToken(expr)) {
                    expressions.push(expr.source);
                }
            });

            this.codeAfterDeletion = expressions.join(',');
            this.newDeletePosition = {
                ...node.position,
                startColumn: node.openBracket.position.endColumn,
                endColumn: node.closeBracket.position.startColumn
            }
        }
    }

    public beginVisitMappingConstructor(node: MappingConstructor) {
        const hasItemsToBeDeleted = !!node.fields.filter((field) => {
            return this.deletePosition === field.position;
        }).length;

        if (hasItemsToBeDeleted) {
            const expressions : string[] = [];
            node.fields.map((field) => {
                if (this.deletePosition !== field.position && !STKindChecker.isCommaToken(field)) {
                    expressions.push(field.source);
                }
            });

            this.codeAfterDeletion = expressions.join(',');
            this.newDeletePosition = {
                startLine: node.openBrace.position.startLine,
                startColumn: node.openBrace.position.endColumn,
                endLine:  node.closeBrace.position.endLine,
                endColumn: node.closeBrace.position.startColumn
            }
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
