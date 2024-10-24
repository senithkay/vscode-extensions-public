/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ObjectOutputNode, InputNode } from "../components/Diagram/Node";
import { DataMapperNodeModel } from "../components/Diagram/Node/commons/DataMapperNode";
import { DataMapperContext } from "../utils/DataMapperContext/DataMapperContext";
import { IDMModel, InputType, OutputType, TypeKind } from "@wso2-enterprise/ballerina-core";
import { OFFSETS } from "../components/Diagram/utils/constants";
import { BaseVisitor } from "./BaseVisitor";

export class NodeInitVisitor implements BaseVisitor {
    private inputNodes: DataMapperNodeModel[] = [];
    private outputNode: DataMapperNodeModel;

    constructor(
        private context: DataMapperContext,
    ){}

    beginVisitInputType(node: InputType, parent?: IDMModel): void {
        // Create input node
        const inputNode = new InputNode(this.context, node);
        inputNode.setPosition(0, 0);
        this.inputNodes.push(inputNode);
    }

    beginVisitOutputType(node: OutputType, parent?: IDMModel): void {
        // Create output node
        if (node.kind === TypeKind.Record) {
            this.outputNode = new ObjectOutputNode(this.context, node);
        }
        this.outputNode.setPosition(OFFSETS.TARGET_NODE.X, OFFSETS.TARGET_NODE.Y);
        // TODO: Handle other types
    }

    // TODO: Implement other visit methods

    getNodes() {
        const nodes = [...this.inputNodes];
        if (this.outputNode) {
            nodes.push(this.outputNode);
        }
        return nodes;
    }
}
