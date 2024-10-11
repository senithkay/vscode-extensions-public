/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ObjectOutputNode, InputNode } from "../Diagram/Node";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import { LocalVarDecl, STNode, Visitor } from "@wso2-enterprise/syntax-tree";
import { TypeKind } from "@wso2-enterprise/ballerina-core";
import { OFFSETS } from "../Diagram/utils/constants";

export class NodeInitVisitor implements Visitor {
    private inputNodes: DataMapperNodeModel[] = [];
    private outputNode: DataMapperNodeModel;

    constructor(
        private context: DataMapperContext,
    ){}

    beginVisitLocalVarDecl(node: LocalVarDecl, parent?: STNode): void {
        // Create output node
        if (this.context.outputTree.kind === TypeKind.Record) {
            this.outputNode = new ObjectOutputNode(
                this.context,
                node.initializer,
                this.context.outputTree
            );
        }
        this.outputNode.setPosition(OFFSETS.TARGET_NODE.X, OFFSETS.TARGET_NODE.Y);
        // TODO: Handle other types
    }

    // TODO: Implement other visit methods

    getNodes() {
        const { inputTrees } = this.context;

        inputTrees.forEach((inputTree) => {
            const inputNode = new InputNode(this.context, inputTree);
            inputNode.setPosition(0, 0);
            this.inputNodes.push(inputNode);
        });

        const nodes = [...this.inputNodes];
        if (this.outputNode) {
            nodes.push(this.outputNode);
        }
        return nodes;
    }
}
