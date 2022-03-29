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
    TypedBindingPattern,
    TypeTestExpression,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { RemainingContent } from "../models/definitions";
import { getStringForMinutiae, isPositionsEquals } from "../utils";

const DEFAULT_EXPR = "EXPRESSION";
const DEFAULT_TYPE_DESC = "TYPE_DESCRIPTOR";

class ExpressionDeletingVisitor implements Visitor {
    private deletePosition: NodePosition;
    private newPosition: NodePosition;
    private codeAfterDeletion: string;
    private isNodeFound: boolean;

    public beginVisitBinaryExpression(node: BinaryExpression) {
        if (!this.isNodeFound) {
            if (isPositionsEquals(this.deletePosition, node.lhsExpr.position)) {
                if (node.lhsExpr.source.trim() === DEFAULT_EXPR) {
                    this.setProperties(node.rhsExpr.source, node.position);
                } else {
                    this.setProperties(DEFAULT_EXPR, node.lhsExpr.position);
                }
            } else if (isPositionsEquals(this.deletePosition, node.operator.position)) {
                this.setProperties(node.lhsExpr.source, node.position);
            } else if (isPositionsEquals(this.deletePosition, node.rhsExpr.position)) {
                if (node.rhsExpr.source.trim() === DEFAULT_EXPR) {
                    this.setProperties(node.lhsExpr.source, node.position);
                } else {
                    this.setProperties(DEFAULT_EXPR, node.rhsExpr.position);
                }
            }
        }
    }

    public beginVisitFieldAccess(node: FieldAccess) {
        if (!this.isNodeFound) {
            if (isPositionsEquals(this.deletePosition, node.expression.position)) {
                this.setProperties(DEFAULT_EXPR, node.position);
            } else if (isPositionsEquals(this.deletePosition, node.fieldName.position)) {
                this.setProperties(DEFAULT_EXPR, node.fieldName.position);
            }
        }
    }

    public beginVisitOptionalFieldAccess(node: OptionalFieldAccess) {
        if (!this.isNodeFound) {
            if (isPositionsEquals(this.deletePosition, node.expression.position)) {
                this.setProperties(DEFAULT_EXPR, node.position);
            } else if (isPositionsEquals(this.deletePosition, node.fieldName.position)) {
                this.setProperties(DEFAULT_EXPR, node.fieldName.position);
            }
        }
    }

    public beginVisitMethodCall(node: MethodCall) {
        if (!this.isNodeFound) {
            if (isPositionsEquals(this.deletePosition, node.expression.position)) {
                this.setProperties(DEFAULT_EXPR, node.position);
            } else if (isPositionsEquals(this.deletePosition, node.methodName.position)) {
                this.setProperties(DEFAULT_EXPR, {
                    ...node.methodName.position,
                    endColumn: node.closeParenToken.position.endColumn
                });
            } else {
                const hasArgToBeDeleted = node.arguments.some((arg: STNode) => {
                    return this.deletePosition === arg.position;
                });

                if (hasArgToBeDeleted) {
                    this.setProperties(DEFAULT_EXPR, this.deletePosition);
                }
            }
        }
    }

    public beginVisitListConstructor(node: ListConstructor) {
        if (!this.isNodeFound) {
            const hasItemsToBeDeleted = node.expressions.some((item: STNode) => {
                return this.deletePosition === item.position;
            });

            if (hasItemsToBeDeleted) {
                const expressions: string[] = [];
                node.expressions.map((expr: STNode) => {
                    if (this.deletePosition !== expr.position && !STKindChecker.isCommaToken(expr)) {
                        expressions.push(expr.source);
                    }
                });

                this.setProperties(expressions.join(','), {
                    ...node.position,
                    startColumn: node.openBracket.position.endColumn,
                    endColumn: node.closeBracket.position.startColumn
                });
            }
        }
    }

    public beginVisitMappingConstructor(node: MappingConstructor) {
        if (!this.isNodeFound) {
            const hasItemsToBeDeleted = node.fields.some((field: STNode) => {
                return isPositionsEquals(this.deletePosition, field.position);
            });

            if (hasItemsToBeDeleted) {
                const expressions: string[] = [];
                let nextCommaDeletable = false;
                node.fields.map((field: STNode) => {
                    if (!isPositionsEquals(this.deletePosition, field.position)) {
                        if (STKindChecker.isCommaToken(field)) {
                            if (!nextCommaDeletable) {
                                expressions.push(getStringForMinutiae(field.leadingMinutiae) + field.value +
                                    getStringForMinutiae(field.trailingMinutiae));
                            }
                        } else {
                            expressions.push(field.source);
                        }
                        nextCommaDeletable = false;
                    } else {
                        nextCommaDeletable = true;
                    }
                });

                this.setProperties(expressions.join(''), {
                    startLine: node.fields[0].position.startLine,
                    startColumn: node.fields[0].position.startColumn - getStringForMinutiae(node.fields[0].leadingMinutiae).length,
                    endLine: node.closeBrace.position.startLine,
                    endColumn: node.closeBrace.position.startColumn
                });
            }
        }
    }

    public beginVisitSpecificField(node: SpecificField) {
        if (!this.isNodeFound && isPositionsEquals(this.deletePosition, node.valueExpr.position)) {
            this.setProperties(DEFAULT_EXPR, node.valueExpr.position);
        }
    }

    public beginVisitIndexedExpression(node: IndexedExpression) {
        if (!this.isNodeFound) {
            if (isPositionsEquals(this.deletePosition, node.containerExpression.position)) {
                this.setProperties(DEFAULT_EXPR, node.position);
            } else {
                const hasKeyExprToBeDeleted = node.keyExpression.some((expr: STNode) => {
                    return this.deletePosition === expr.position;
                });

                if (hasKeyExprToBeDeleted) {
                    this.setProperties(DEFAULT_EXPR, this.deletePosition);
                }
            }
        }
    }

    public beginVisitFunctionCall(node: FunctionCall) {
        if (!this.isNodeFound) {
            const hasArgToBeDeleted = node.arguments.some((arg: STNode) => {
                return this.deletePosition === arg.position;
            });

            if (hasArgToBeDeleted) {
                this.setProperties(DEFAULT_EXPR, this.deletePosition);
            }
        }
    }

    public beginVisitTypeTestExpression(node: TypeTestExpression) {
        if (!this.isNodeFound && isPositionsEquals(this.deletePosition, node.expression.position)) {
            this.setProperties(DEFAULT_EXPR, node.expression.position);
        } else if (!this.isNodeFound && isPositionsEquals(this.deletePosition, node.typeDescriptor.position)) {
            this.setProperties(DEFAULT_TYPE_DESC, node.typeDescriptor.position);
        }
    }

    public beginVisitTypedBindingPattern(node: TypedBindingPattern) {
        if (!this.isNodeFound && isPositionsEquals(this.deletePosition, node.typeDescriptor.position)) {
            if (node.typeDescriptor.source.trim() === DEFAULT_TYPE_DESC) {
                this.setProperties(node.bindingPattern.source, node.position);
            } else {
                this.setProperties(DEFAULT_TYPE_DESC, node.typeDescriptor.position);
            }
        }
    }

    setProperties(codeAfterDeletion: string, newPosition: NodePosition) {
        this.codeAfterDeletion = codeAfterDeletion;
        this.newPosition = newPosition;
        this.isNodeFound = true;
    }

    getContent(): RemainingContent {
        return {
            code: this.isNodeFound ? this.codeAfterDeletion : DEFAULT_EXPR,
            position: this.isNodeFound ? this.newPosition : this.deletePosition
        };
    }

    setPosition(position: NodePosition) {
        this.cleanDeletingInfo();
        this.deletePosition = position;
    }

    cleanDeletingInfo() {
        this.isNodeFound = false;
        this.newPosition = null;
        this.codeAfterDeletion = '';
    }
}

export const visitor = new ExpressionDeletingVisitor();
