/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Identifier, Node, PropertyAccessExpression } from "ts-morph";
import { Visitor } from "../../ts/base-visitor";

export class PropertyAccessNodeFindingVisitor implements Visitor {
    private inputNodes: (PropertyAccessExpression | Identifier)[];

    constructor() {
        this.inputNodes = []
    }

    public beginVisitPropertyAccessExpression(node: PropertyAccessExpression, parent?: Node) {
        if (!parent || (!Node.isPropertyAccessExpression(parent) && !Node.isCallExpression(parent))) {
            this.inputNodes.push(node)
        } else if (parent && Node.isCallExpression(parent)) {
            const expr = node.getExpression();
            if (Node.isPropertyAccessExpression(expr)) {
                this.inputNodes.push(expr);
            }
        }
    }

    public beginVisitIdentifier(node: Identifier, parent?: Node) {
        if (!parent || !Node.isPropertyAccessExpression(parent)) {
            this.inputNodes.push(node);
        }
    }

    public getPropertyAccessNodes(): (PropertyAccessExpression | Identifier)[] {
        return this.inputNodes
    }
}
