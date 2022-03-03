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
    FunctionCall,
    IndexedExpression,
    ListConstructor,
    MappingConstructor,
    MethodCall,
    NodePosition,
    OptionalFieldAccess,
    SpecificField,
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
    private codeAfterDeletion: string;
    private isNodeFound: boolean;

    public beginVisitBinaryExpression(node: BinaryExpression) {
        if (!this.isNodeFound) {
            if (isPositionsEquals(this.deletePosition, node.lhsExpr.position)) {
                this.codeAfterDeletion = `${DEFAULT_EXPR}`;
                this.newDeletePosition = node.lhsExpr.position;
                this.isNodeFound = true;
            } else if (isPositionsEquals(this.deletePosition, node.operator.position)) {
                this.codeAfterDeletion = node.lhsExpr.source;
                this.newDeletePosition = node.position;
                this.isNodeFound = true;
            } else if (isPositionsEquals(this.deletePosition, node.rhsExpr.position)) {
                this.codeAfterDeletion = `${DEFAULT_EXPR}`;
                this.newDeletePosition = node.rhsExpr.position;
                this.isNodeFound = true;
            }
        }
    }

    public beginVisitFieldAccess(node: FieldAccess) {
        if (!this.isNodeFound) {
            if (isPositionsEquals(this.deletePosition, node.expression.position)) {
                this.codeAfterDeletion = `${DEFAULT_EXPR}`;
                this.newDeletePosition = node.position;
                this.isNodeFound = true;
            } else if (isPositionsEquals(this.deletePosition, node.fieldName.position)) {
                this.codeAfterDeletion = `${DEFAULT_EXPR}`;
                this.newDeletePosition = node.fieldName.position;
                this.isNodeFound = true;
            }
        }
    }

    public beginVisitOptionalFieldAccess(node: OptionalFieldAccess) {
        if (!this.isNodeFound) {
            if (isPositionsEquals(this.deletePosition, node.expression.position)) {
                this.codeAfterDeletion = `${DEFAULT_EXPR}`;
                this.newDeletePosition = node.position;
                this.isNodeFound = true;
            } else if (isPositionsEquals(this.deletePosition, node.fieldName.position)) {
                this.codeAfterDeletion = `${DEFAULT_EXPR}`;
                this.newDeletePosition = node.fieldName.position;
                this.isNodeFound = true;
            }
        }
    }

    public beginVisitMethodCall(node: MethodCall) {
        if (!this.isNodeFound) {
            if (isPositionsEquals(this.deletePosition, node.expression.position)) {
                this.codeAfterDeletion = `${DEFAULT_EXPR}`;
                this.newDeletePosition = node.position;
                this.isNodeFound = true;
            } else if (isPositionsEquals(this.deletePosition, node.methodName.position)) {
                this.codeAfterDeletion = `${DEFAULT_EXPR}`;
                this.newDeletePosition = {
                    ...node.methodName.position,
                    endColumn: node.closeParenToken.position.endColumn
                };
                this.isNodeFound = true;
            } else {
                const hasArgToBeDeleted = !!node.arguments.filter((arg) => {
                    return this.deletePosition === arg.position;
                }).length;

                if (hasArgToBeDeleted) {
                    this.codeAfterDeletion = `${DEFAULT_EXPR}`;
                    this.newDeletePosition = this.deletePosition;
                    this.isNodeFound = true;
                }
            }
        }
    }

    public beginVisitListConstructor(node: ListConstructor) {
        if (!this.isNodeFound) {
            const hasItemsToBeDeleted = !!node.expressions.filter((item) => {
                return this.deletePosition === item.position;
            }).length;

            if (hasItemsToBeDeleted) {
                const expressions: string[] = [];
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
                };
                this.isNodeFound = true;
            }
        }
    }

    public beginVisitMappingConstructor(node: MappingConstructor) {
        if (!this.isNodeFound) {
            const hasItemsToBeDeleted = !!node.fields.filter((field) => {
                return this.deletePosition === field.position;
            }).length;

            if (hasItemsToBeDeleted) {
                const expressions: string[] = [];
                node.fields.map((field) => {
                    if (this.deletePosition !== field.position && !STKindChecker.isCommaToken(field)) {
                        expressions.push(field.source);
                    }
                });

                this.codeAfterDeletion = expressions.join(',');
                this.newDeletePosition = {
                    startLine: node.openBrace.position.startLine,
                    startColumn: node.openBrace.position.endColumn,
                    endLine: node.closeBrace.position.endLine,
                    endColumn: node.closeBrace.position.startColumn
                };
                this.isNodeFound = true;
            }
        }
    }

    public beginVisitSpecificField(node: SpecificField) {
        if (!this.isNodeFound && isPositionsEquals(this.deletePosition, node.valueExpr.position)) {
            this.codeAfterDeletion = `${DEFAULT_EXPR}`;
            this.newDeletePosition = node.valueExpr.position;
            this.isNodeFound = true;
        }
    }

    public beginVisitIndexedExpression(node: IndexedExpression) {
        if (!this.isNodeFound) {
            if (isPositionsEquals(this.deletePosition, node.containerExpression.position)) {
                this.codeAfterDeletion = `${DEFAULT_EXPR}`;
                this.newDeletePosition = node.position;
                this.isNodeFound = true;
            } else {
                const hasKeyExprToBeDeleted = !!node.keyExpression.filter((expr) => {
                    return this.deletePosition === expr.position;
                }).length;

                if (hasKeyExprToBeDeleted) {
                    this.codeAfterDeletion = `${DEFAULT_EXPR}`;
                    this.newDeletePosition = this.deletePosition;
                    this.isNodeFound = true;
                }
            }
        }
    }

    public beginVisitFunctionCall(node: FunctionCall) {
        if (!this.isNodeFound) {
            const hasArgToBeDeleted = !!node.arguments.filter((arg) => {
                return this.deletePosition === arg.position;
            }).length;

            if (hasArgToBeDeleted) {
                this.codeAfterDeletion = `${DEFAULT_EXPR}`;
                this.newDeletePosition = this.deletePosition;
                this.isNodeFound = true;
            }
        }
    }

    public beginVisitSTNode(node: STNode, parent?: STNode) {
        // NoOp
    }

    getContent(): RemainingContent {
        return {
            code: this.isNodeFound ? this.codeAfterDeletion : DEFAULT_EXPR,
            position: this.isNodeFound ? this.newDeletePosition : this.deletePosition
        };
    }

    setPosition(position: NodePosition) {
        this.cleanDeletingInfo();
        this.deletePosition = position;
    }

    cleanDeletingInfo() {
        this.isNodeFound = false;
        this.newDeletePosition = null;
        this.codeAfterDeletion = '';
    }
}

export const visitor = new ExpressionDeletingVisitor();
