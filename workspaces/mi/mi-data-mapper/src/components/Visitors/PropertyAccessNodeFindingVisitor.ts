/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { CallExpression, Identifier, Node, PropertyAccessExpression } from "ts-morph";
import { Visitor } from "../../ts/base-visitor";
import { isMapFunction } from "../Diagram/utils/common-utils";

export class PropertyAccessNodeFindingVisitor implements Visitor {
    private inputNodes: (PropertyAccessExpression | Identifier)[];
    private mapFnDepth: number;

    constructor() {
        this.inputNodes = []
        this.mapFnDepth = 0;
    }

    public beginVisitPropertyAccessExpression(node: PropertyAccessExpression, parent?: Node) {
        if (this.mapFnDepth > 0) {
            return;
        }
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
        if (!parent || !Node.isPropertyAccessExpression(parent) && this.mapFnDepth === 0) {
            this.inputNodes.push(node);
        }
    }

    public beginVisitCallExpression(node: CallExpression) {
        if (isMapFunction(node)) {
            this.mapFnDepth += 1;
        }
    }

    public endVisitCallExpression(node: CallExpression){
        if (isMapFunction(node)) {
            this.mapFnDepth -= 1;
        }
    }

    public getPropertyAccessNodes(): (PropertyAccessExpression | Identifier)[] {
        return this.inputNodes
    }
}
