/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeLinkModel } from "../components/NodeLink/NodeLinkModel";
import { BaseNodeModel } from "../components/nodes/BaseNode/BaseNodeModel";
import { createNodesLink } from "../utils/diagram";
import { Node } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class NodeFactoryVisitor implements BaseVisitor {
    nodes: BaseNodeModel[] = [];
    links: NodeLinkModel[] = [];
    private skipChildrenVisit = false;
    private lastNodeModel: BaseNodeModel | undefined; // last visited flow node

    constructor() {
        console.log("node factory visitor started");
    }

    private createNode(node: Node): void {
        const nodeModel = new BaseNodeModel(node);
        nodeModel.setPosition(node.viewState.x, node.viewState.y);
        this.nodes.push(nodeModel);

        if (node.viewState.startNodeId) {
            // new sub flow start
            const startNode = this.nodes.find((n) => n.getID() === node.viewState.startNodeId);
            const link = createNodesLink(startNode, nodeModel);
            if (link) {
                this.links.push(link);
            }
            this.lastNodeModel = undefined;
        } else if (this.lastNodeModel) {
            const link = createNodesLink(this.lastNodeModel, nodeModel);
            if (link) {
                this.links.push(link);
            }
        }
        this.lastNodeModel = nodeModel;
    }

    getNodes(): BaseNodeModel[] {
        return this.nodes;
    }

    getLinks(): NodeLinkModel[] {
        return this.links;
    }

    beginVisitNode = (node: Node): void => node.id && this.createNode(node); // only ui nodes have id

    beginVisitIf(node: Node): void {
        this.createNode(node);
        // mark the first node of then and else branches as start node
        if (node.thenBranch && node.thenBranch.children.length > 0) {
            node.thenBranch.children.at(0).viewState.startNodeId = node.id;
        }
        if (node.elseBranch && node.elseBranch.children.length > 0) {
            node.elseBranch.children.at(0).viewState.startNodeId = node.id;
        }
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
