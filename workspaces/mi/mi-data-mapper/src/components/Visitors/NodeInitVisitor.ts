/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ts } from "ts-morph";
import { Visitor } from "../../ts/base-visitor";
import { ObjectOutputNode, InputNode } from "../Diagram/Node";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";

export class NodeInitVisitor implements Visitor {
    private inputNodes: DataMapperNodeModel[] = [];
    private outputNode: DataMapperNodeModel;

    constructor(
        private context: DataMapperContext,
    ) {}

    beginVisitArrowFunction(node: ts.ArrowFunction, parent?: ts.Node): void {
        // Create input nodes
        const params = node.parameters;
        params.forEach((param) => {
            const paramNode = new InputNode(this.context, param);
            paramNode.setPosition(0, 0);
            this.inputNodes.push(paramNode);
        });

        // Create output node
        if (ts.isParenthesizedExpression(node.body)) {
            const expr = (node.body as ts.ParenthesizedExpression).expression;

            if (ts.isObjectLiteralExpression(expr)) {
                this.outputNode = new ObjectOutputNode(
                    this.context,
                    expr
                );
            }
        }
        
    }

    getNodes() {
        const nodes = [...this.inputNodes];
        if (this.outputNode) {
            nodes.push(this.outputNode);
        }
        return nodes;
    }
}