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
import { EmptyNodeModel } from "../components/nodes/EmptyNode";
import { createNodesLink } from "../utils/diagram";
import { Node, NodeModel } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class NodeFactoryVisitor implements BaseVisitor {
    nodes: (NodeModel)[] = [];
    links: NodeLinkModel[] = [];
    private skipChildrenVisit = false;
    private lastNodeModel: NodeModel | undefined; // last visited flow node

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

    private createEmptyNode(id: string, visible = true): EmptyNodeModel {
        const nodeModel = new EmptyNodeModel(id, visible);
        this.nodes.push(nodeModel);
        return nodeModel;
    }

    getNodes(): (NodeModel)[] {
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

        // create branches IN links
        node.branches?.forEach((branch) => {
            if (!branch.children || branch.children.length === 0) {
                // this empty branch will be handled in OUT links
                return;
            }
            const firstChildNodeModel = this.nodes.find((n) => n.getID() === branch.children.at(0).id);
            if (!firstChildNodeModel) {
                console.error("Branch node model not found", branch);
                return;
            }

            const link = createNodesLink(ifNodeModel, firstChildNodeModel, { label: branch.label });
            if (link) {
                this.links.push(link);
            }
        });

        // create branches OUT links
        const endIfEmptyNode = this.createEmptyNode(`${node.id}-endif`);
        let endIfLinkCount = 0;
        node.branches?.forEach((branch) => {
            if (!branch.children || branch.children.length === 0) {
                // empty branch
                let branchEmptyNode = this.createEmptyNode(`${node.id}-${branch.label}-branch`, false);
                const linkIn = createNodesLink(ifNodeModel, branchEmptyNode, { label: branch.label, brokenLine: true });
                const linkOut = createNodesLink(branchEmptyNode, endIfEmptyNode, {
                    brokenLine: true,
                    alignBottom: true,
                });
                if (linkIn && linkOut) {
                    this.links.push(linkIn, linkOut);
                    endIfLinkCount++;
                }
                return;
            }

            // get last child node model
            // if last child is RETURN, don't create link
            if (branch.children.at(-1).kind === "RETURN") {
                return;
            }
            const lastNode = branch.children.at(-1);
            let lastChildNodeModel;
            if (branch.children.at(-1).kind === "IF") {
                // if last child is IF, find endIf node
                lastChildNodeModel = this.nodes.find((n) => n.getID() === `${lastNode.id}-endif`);
            } else {
                // if last child is not IF, find last child node
                lastChildNodeModel = this.nodes.find((n) => n.getID() === lastNode.id);
            }
            if (!lastChildNodeModel) {
                console.error("Branch node model not found", branch);
                return;
            }
            const link = createNodesLink(lastChildNodeModel, endIfEmptyNode);
            if (link) {
                this.links.push(link);
                endIfLinkCount++;
            }
        });
        if (endIfLinkCount === 0) {
            // remove endIf node if no links are created
            const index = this.nodes.findIndex((n) => n.getID() === endIfEmptyNode.getID());
            if (index !== -1) {
                this.nodes.splice(index, 1);
            }
            return;
        }
        this.lastNodeModel = endIfEmptyNode;
    }

    endVisitBlock(node: Node, parent?: Node): void {
        this.lastNodeModel = undefined;
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    getLastNodeModel(): NodeModel | undefined {
        return this.lastNodeModel;
    }
}
