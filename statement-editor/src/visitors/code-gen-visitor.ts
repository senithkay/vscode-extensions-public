/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
    BracedExpression,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

const leafKind = ['PlusToken', 'MinusToken', 'AsteriskToken', 'SlashToken', 'PercentToken',
    'GtToken', 'GtEqualToken', 'LtToken', 'LtEqualToken',
    'DoubleEqualToken', 'NotEqualToken', 'TrippleEqualToken', 'NotDoubleEqualToken',
    'LogicalAndToken', 'LogicalOrToken',
    'DoubleDotLtToken',
    'DecimalIntegerLiteralToken', 'StringLiteralToken', 'IdentifierToken'];

class CodeGenVisitor implements Visitor {
    private codeSnippet: string = "";

    public beginVisitSTNode(node: STNode, parent?: STNode) {
        if (leafKind.includes(node.kind)) {
            this.codeSnippet = this.codeSnippet + node.value;
        }
    }

    public beginVisitBracedExpression(node: STNode, parent?: STNode) {
        const bracedExprNode = node as BracedExpression;
        this.codeSnippet = this.codeSnippet + bracedExprNode.openParen.value;
    }

    public endVisitBracedExpression(node: STNode, parent?: STNode) {
        const bracedExprNode = node as BracedExpression;
        this.codeSnippet = this.codeSnippet + bracedExprNode.closeParen.value;
    }

    getCodeSnippet() {
        return this.codeSnippet;
    }

    clearCodeSnippet() {
        this.codeSnippet = "";
    }
}

export const visitor = new CodeGenVisitor();
