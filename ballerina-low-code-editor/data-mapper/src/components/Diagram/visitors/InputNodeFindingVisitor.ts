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
    FieldAccess,
    OptionalFieldAccess,
    SimpleNameReference,
    STKindChecker,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

export class InputNodeFindingVisitor implements Visitor {
    private inputNodes: (FieldAccess | OptionalFieldAccess | SimpleNameReference)[];
    private queryExpressionDepth: number;

    constructor() {
        this.inputNodes = []
        this.queryExpressionDepth = 0
    }

    public beginVisitFieldAccess(node: FieldAccess, parent?: STNode) {
        if ((!parent || (!STKindChecker.isFieldAccess(parent) && !STKindChecker.isOptionalFieldAccess(parent)))
            && this.queryExpressionDepth === 0) {
            this.inputNodes.push(node)
        }
    }

    public beginVisitOptionalFieldAccess(node: OptionalFieldAccess, parent?: STNode) {
        if ((!parent || (!STKindChecker.isFieldAccess(parent) && !STKindChecker.isOptionalFieldAccess(parent)))
            && this.queryExpressionDepth === 0) {
            this.inputNodes.push(node)
        }
    }

    public beginVisitSimpleNameReference(node: SimpleNameReference, parent?: STNode) {
        if (
            STKindChecker.isIdentifierToken(node.name) &&
            (!parent ||
                (parent &&
                    !STKindChecker.isFieldAccess(parent) &&
                    !STKindChecker.isOptionalFieldAccess(parent)
                )) &&
            this.queryExpressionDepth === 0
        ) {
            this.inputNodes.push(node);
        }
    }

    public beginVisitQueryExpression() {
        this.queryExpressionDepth += 1;
    }

    public endVisitQueryExpression(){
        this.queryExpressionDepth -= 1;
    }

    public getFieldAccessNodes() {
        return this.inputNodes
    }

}

