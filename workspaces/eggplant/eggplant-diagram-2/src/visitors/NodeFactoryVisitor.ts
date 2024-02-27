/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeLinkModel } from "../components/NodeLink";
import { BaseNodeModel } from "../components/nodes/BaseNode";
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
        this.nodes.push(nodeModel);

        if (node.viewState?.startNodeId) {
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
        this.lastNodeModel = undefined;
    }

    endVisitIf(node: Node, parent?: Node): void {
        const ifNodeModel = this.nodes.find((n) => n.getID() === node.id);
        if (!ifNodeModel) {
            console.error("If node model not found", node);
            return;
        }

        node.branches?.forEach((branch) => {
            if (!branch.children || branch.children.length === 0) {
                console.warn("Branch children not found", branch);
                return;
            }
            const firstChildNodeModel = this.nodes.find((n) => n.getID() === branch.children.at(0).id);
            if (!firstChildNodeModel) {
                console.error("Branch node model not found", branch);
                return;
            }

            const link = createNodesLink(ifNodeModel, firstChildNodeModel);
            if (link) {
                this.links.push(link);
            }
        });
    }

    endVisitBlock(node: Node, parent?: Node): void {
        this.lastNodeModel = undefined;
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
