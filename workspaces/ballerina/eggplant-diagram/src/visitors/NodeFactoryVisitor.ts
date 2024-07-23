/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeLinkModel, NodeLinkModelOptions } from "../components/NodeLink";
import { ApiCallNodeModel } from "../components/nodes/ApiCallNode";
import { BaseNodeModel } from "../components/nodes/BaseNode";
import { EmptyNodeModel } from "../components/nodes/EmptyNode";
import { IfNodeModel } from "../components/nodes/IfNode/IfNodeModel";
import { StartNodeModel } from "../components/nodes/StartNode/StartNodeModel";
import { EMPTY_NODE_WIDTH, VSCODE_MARGIN } from "../resources/constants";
import { createNodesLink } from "../utils/diagram";
import { Branch, Node, NodeModel } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class NodeFactoryVisitor implements BaseVisitor {
    nodes: NodeModel[] = [];
    links: NodeLinkModel[] = [];
    private skipChildrenVisit = false;
    private lastNodeModel: NodeModel | undefined; // last visited flow node

    constructor() {
        console.log(">>> node factory visitor started");
    }

    private updateNodeLinks(node: Node, nodeModel: NodeModel, options?: NodeLinkModelOptions): void {
        if (node.viewState?.startNodeId) {
            // new sub flow start
            const startNode = this.nodes.find((n) => n.getID() === node.viewState.startNodeId);
            const link = createNodesLink(startNode, nodeModel, options);
            if (link) {
                this.links.push(link);
            }
            this.lastNodeModel = undefined;
        } else if (this.lastNodeModel) {
            const link = createNodesLink(this.lastNodeModel, nodeModel, options);
            if (link) {
                this.links.push(link);
            }
        }
        this.lastNodeModel = nodeModel;
    }

    private createBaseNode(node: Node): NodeModel {
        const nodeModel = new BaseNodeModel(node);
        this.nodes.push(nodeModel);
        this.updateNodeLinks(node, nodeModel);
        return nodeModel;
    }

    private createApiCallNode(node: Node): NodeModel {
        const nodeModel = new ApiCallNodeModel(node);
        this.nodes.push(nodeModel);
        this.updateNodeLinks(node, nodeModel);
        return nodeModel;
    }

    private createEmptyNode(id: string, x: number, y: number, visible = true): EmptyNodeModel {
        const nodeModel = new EmptyNodeModel(id, visible);
        nodeModel.setPosition(x, y);
        this.nodes.push(nodeModel);
        return nodeModel;
    }

    getNodes(): NodeModel[] {
        return this.nodes;
    }

    getLinks(): NodeLinkModel[] {
        return this.links;
    }

    beginVisitNode = (node: Node): void => {
        if (node.id) {
            this.createBaseNode(node);
        }
    }; // only ui nodes have id

    beginVisitEventHttpApi(node: Node, parent?: Node): void {
        // consider this as a start node
        const nodeModel = new StartNodeModel(node);
        this.nodes.push(nodeModel);
        this.updateNodeLinks(node, nodeModel);
    }

    beginVisitIf(node: Node): void {
        const nodeModel = new IfNodeModel(node);
        this.nodes.push(nodeModel);
        this.updateNodeLinks(node, nodeModel);
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
        const endIfEmptyNode = this.createEmptyNode(
            `${node.id}-endif`,
            node.viewState.x + (node.viewState.w - VSCODE_MARGIN) / 2 - EMPTY_NODE_WIDTH / 2,
            node.viewState.y + node.viewState.ch - EMPTY_NODE_WIDTH / 2
        ); // TODO: move position logic to position visitor

        let endIfLinkCount = 0;
        let allBranchesReturn = true;
        node.branches?.forEach((branch) => {
            if (!branch.children || branch.children.length === 0) {
                console.error("Branch children not found", branch);
                return;
            }

            // get last child node model
            const lastNode = branch.children.at(-1);
            // check last node is a returning node
            if (!lastNode.returning) {
                allBranchesReturn = false;
            }

            // handle empty nodes in empty branches
            if (branch.children && branch.children.length === 1 && branch.children.find((n) => n.kind === "EMPTY")) {
                // empty branch
                const branchEmptyNodeModel = branch.children.at(0);
                let branchEmptyNode = this.createEmptyNode(
                    branchEmptyNodeModel.id,
                    branchEmptyNodeModel.viewState.x,
                    branchEmptyNodeModel.viewState.y,
                    false
                );
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

            const link = createNodesLink(lastChildNodeModel, endIfEmptyNode, {
                alignBottom: true,
                brokenLine: lastNode.returning,
                showAddButton: !lastNode.returning,
            });
            if (link) {
                this.links.push(link);
                endIfLinkCount++;
            }
        });

        if (endIfLinkCount === 0 || allBranchesReturn) {
            // remove endIf node if no links are created
            const index = this.nodes.findIndex((n) => n.getID() === endIfEmptyNode.getID());
            if (index !== -1) {
                this.nodes.splice(index, 1);
            }
            return;
        }
        this.lastNodeModel = endIfEmptyNode;
    }

    endVisitBlock(node: Branch, parent?: Node): void {
        this.lastNodeModel = undefined;
    }

    beginVisitHttpApiGetCall(node: Node, parent?: Node): void {
        if (node.id) {
            this.createApiCallNode(node);
        }
    }

    beginVisitHttpApiPostCall(node: Node, parent?: Node): void {
        if (node.id) {
            this.createApiCallNode(node);
        }
    }

    beginVisitActionCall(node: Node, parent?: Node): void {
        if (node.id) {
            this.createApiCallNode(node);
        }
    }

    beginVisitEmpty(node: Node, parent?: Node): void {
        // add empty node end of the block
        if (node.id.endsWith("-last")) {
            const lastNodeModel = this.createEmptyNode(node.id, node.viewState.x, node.viewState.y, false);
            this.updateNodeLinks(node, lastNodeModel, { showArrow: true });
        }
        // skip node creation
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    getLastNodeModel(): NodeModel | undefined {
        return this.lastNodeModel;
    }
}
