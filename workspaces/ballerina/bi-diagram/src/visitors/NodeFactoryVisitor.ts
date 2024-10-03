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
import { CodeBlockNodeModel } from "../components/nodes/CodeBlockNode";
import { ButtonNodeModel } from "../components/nodes/ButtonNode";
import { CommentNodeModel } from "../components/nodes/CommentNode";
import { DraftNodeModel } from "../components/nodes/DraftNode/DraftNodeModel";
import { EmptyNodeModel } from "../components/nodes/EmptyNode";
import { IfNodeModel } from "../components/nodes/IfNode/IfNodeModel";
import { StartNodeModel } from "../components/nodes/StartNode/StartNodeModel";
import { WhileNodeModel } from "../components/nodes/WhileNode";
import {
    BUTTON_NODE_HEIGHT,
    EMPTY_NODE_WIDTH,
    NODE_HEIGHT,
    NODE_WIDTH,
    VSCODE_MARGIN
} from "../resources/constants";
import { createNodesLink } from "../utils/diagram";
import { getBranchInLinkId, getBranchLabel } from "../utils/node";
import { Branch, FlowNode, NodeModel } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class NodeFactoryVisitor implements BaseVisitor {
    nodes: NodeModel[] = [];
    links: NodeLinkModel[] = [];
    private skipChildrenVisit = false;
    private lastNodeModel: NodeModel | undefined; // last visited flow node
    private hasSuggestedNode = false;

    constructor() {
        console.log(">>> node factory visitor started");
    }

    private updateNodeLinks(node: FlowNode, nodeModel: NodeModel, options?: NodeLinkModelOptions): void {
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

    private createBaseNode(node: FlowNode): NodeModel {
        const nodeModel = new BaseNodeModel(node);
        this.nodes.push(nodeModel);
        this.updateNodeLinks(node, nodeModel);
        return nodeModel;
    }

    private createApiCallNode(node: FlowNode): NodeModel {
        const nodeModel = new ApiCallNodeModel(node);
        this.nodes.push(nodeModel);
        this.updateNodeLinks(node, nodeModel);
        return nodeModel;
    }

    private createEmptyNode(id: string, x: number, y: number, visible = true, showButton = false): EmptyNodeModel {
        const nodeModel = new EmptyNodeModel(id, visible, showButton);
        nodeModel.setPosition(x, y);
        this.nodes.push(nodeModel);
        return nodeModel;
    }

    private createCodeBlockNode(id: string, x: number, y: number, width: number, height: number): CodeBlockNodeModel {
        const nodeModel = new CodeBlockNodeModel(id, width, height);
        nodeModel.setPosition(x, y);
        this.nodes.push(nodeModel);
        return nodeModel;
    }

    private addSuggestionsButton(node: FlowNode): void {
        // if node is the first suggested node
        // add button node top of this node
        if (node.suggested && !this.hasSuggestedNode) {
            this.hasSuggestedNode = true;
            const buttonNodeModel = new ButtonNodeModel();
            buttonNodeModel.setPosition(
                node.viewState.x + NODE_WIDTH / 2 + 20,
                node.viewState.y - BUTTON_NODE_HEIGHT + 10
            );
            this.nodes.push(buttonNodeModel);
        }
    }

    getNodes(): NodeModel[] {
        return this.nodes;
    }

    getLinks(): NodeLinkModel[] {
        return this.links;
    }

    beginVisitNode = (node: FlowNode): void => {
        if (node.id) {
            this.createBaseNode(node);

            this.addSuggestionsButton(node);
        }
    }; // only ui nodes have id

    beginVisitEventHttpApi(node: FlowNode, parent?: FlowNode): void {
        // consider this as a start node
        const nodeModel = new StartNodeModel(node);
        this.nodes.push(nodeModel);
        this.updateNodeLinks(node, nodeModel);
    }

    beginVisitIf(node: FlowNode): void {
        const nodeModel = new IfNodeModel(node);
        this.nodes.push(nodeModel);
        this.updateNodeLinks(node, nodeModel);
        this.addSuggestionsButton(node);
        this.lastNodeModel = undefined;
    }

    endVisitIf(node: FlowNode, parent?: FlowNode): void {
        const ifNodeModel = this.nodes.find((n) => n.getID() === node.id);
        if (!ifNodeModel) {
            console.error("If node model not found", node);
            return;
        }

        // create branches IN links
        node.branches?.forEach((branch, index) => {
            if (!branch.children || branch.children.length === 0) {
                // this empty branch will be handled in OUT links
                return;
            }
            const firstChildNodeModel = this.nodes.find((n) => n.getID() === branch.children.at(0).id);
            if (!firstChildNodeModel) {
                // check non empty children. empty branches will handel later in below logic
                return;
            }

            const link = createNodesLink(ifNodeModel, firstChildNodeModel, {
                id: getBranchInLinkId(node.id, branch.label, index),
                label: getBranchLabel(branch),
            });
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
        endIfEmptyNode.setParentFlowNode(node);

        let endIfLinkCount = 0;
        let allBranchesReturn = true;
        node.branches?.forEach((branch, index) => {
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
            if (
                branch.children &&
                branch.children.length === 1 &&
                branch.children.find((n) => n.codedata.node === "EMPTY")
            ) {
                // empty branch
                const branchEmptyNodeModel = branch.children.at(0);
                let branchEmptyNode = this.createEmptyNode(
                    branchEmptyNodeModel.id,
                    branchEmptyNodeModel.viewState.x,
                    branchEmptyNodeModel.viewState.y,
                    true,
                    branchEmptyNodeModel.metadata?.draft ? false : true // else branch is draft
                );
                const linkIn = createNodesLink(ifNodeModel, branchEmptyNode, {
                    id: getBranchInLinkId(node.id, branch.label, index),
                    label: getBranchLabel(branch),
                    brokenLine: true,
                    showAddButton: false,
                });
                const linkOut = createNodesLink(branchEmptyNode, endIfEmptyNode, {
                    brokenLine: true,
                    showAddButton: false,
                    alignBottom: true,
                });
                if (linkIn && linkOut) {
                    this.links.push(linkIn, linkOut);
                    endIfLinkCount++;
                }
                return;
            }

            let lastChildNodeModel;
            if (branch.children.at(-1).codedata.node === "IF") {
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

    // endVisitBlock(node: Branch, parent?: FlowNode): void {
    //     this.lastNodeModel = undefined;
    // }
    endVisitConditional(node: Branch, parent?: FlowNode): void {
        this.lastNodeModel = undefined;
    }

    endVisitElse(node: Branch, parent?: FlowNode): void {
        this.lastNodeModel = undefined;
    }

    beginVisitWhile(node: FlowNode): void {
        const nodeModel = new WhileNodeModel(node);

        // TODO: Fix and enable code-block node
        // const codeBlockNode = this.createCodeBlockNode(
        //     `${node.id}-codeBlock`,
        //     node.viewState.x + NODE_HEIGHT / 2 - node.viewState.cw / 2 - NODE_GAP_X / 2,
        //     node.viewState.y + node.viewState.h + NODE_GAP_Y / 2 + NODE_BORDER_WIDTH / 2,
        //     node.viewState.cw + NODE_GAP_X,
        //     node.viewState.ch - node.viewState.h - NODE_GAP_Y / 2
        // );

        this.nodes.push(nodeModel);
        this.updateNodeLinks(node, nodeModel);
        this.lastNodeModel = undefined;
    }

    endVisitWhile(node: FlowNode, parent?: FlowNode): void {
        const whileNodeModel = this.nodes.find((n) => n.getID() === node.id);
        if (!whileNodeModel) {
            console.error("While node model not found", node);
            return;
        }

        // assume that only the body branch exist
        const branch = node.branches.at(0);

        // Create branch's IN link
        if (branch.children && branch.children.length > 0) {
            const firstChildNodeModel = this.nodes.find((n) => n.getID() === branch.children.at(0).id);
            if (firstChildNodeModel) {
                const link = createNodesLink(whileNodeModel, firstChildNodeModel);
                if (link) {
                    this.links.push(link);
                }
            }
        }

        // create branch's OUT link
        const endWhileEmptyNode = this.createEmptyNode(
            `${node.id}-endwhile`,
            node.viewState.x + NODE_HEIGHT / 2 - EMPTY_NODE_WIDTH / 2,
            node.viewState.y - EMPTY_NODE_WIDTH / 2 + node.viewState.ch
        );
        endWhileEmptyNode.setParentFlowNode(node);
        this.lastNodeModel = endWhileEmptyNode;

        if (
            branch.children &&
            branch.children.length === 1 &&
            branch.children.find((n) => n.codedata.node === "EMPTY")
        ) {
            const branchEmptyNodeModel = branch.children.at(0);
            
            let branchEmptyNode = this.createEmptyNode(
                branchEmptyNodeModel.id,
                node.viewState.x + NODE_HEIGHT / 2 - EMPTY_NODE_WIDTH / 2,
                branchEmptyNodeModel.viewState.y,
                true,
                true
            );
            const linkIn = createNodesLink(whileNodeModel, branchEmptyNode, {
                showAddButton: false,
            });
            const linkOut = createNodesLink(branchEmptyNode, endWhileEmptyNode, {
                showAddButton: false,
                alignBottom: true,
            });
            if (linkIn && linkOut) {
                this.links.push(linkIn, linkOut);
            }
            return;
        }

        const lastNode = branch.children.at(-1);
        let lastChildNodeModel;
        if (branch.children.at(-1).codedata.node === "IF") {
            // if last child is IF, find endIf node
            lastChildNodeModel = this.nodes.find((n) => n.getID() === `${lastNode.id}-endif`);
        } else {
            // if last child is not IF, find last child node
            lastChildNodeModel = this.nodes.find((n) => n.getID() === lastNode.id);
        }
        if (!lastChildNodeModel) {
            console.error("Last child node model not found", lastNode.id);
            return;
        }

        const endLink = createNodesLink(lastChildNodeModel, endWhileEmptyNode, {
            alignBottom: true,
            showAddButton: !lastNode.returning,
        });
        if (endLink) {
            this.links.push(endLink);
        }
    }

    beginVisitActionCall(node: FlowNode, parent?: FlowNode): void {
        if (node.id) {
            this.createApiCallNode(node);
            this.addSuggestionsButton(node);
        }
    }

    beginVisitEmpty(node: FlowNode, parent?: FlowNode): void {
        // add empty node end of the block
        if (node.id.endsWith("-last")) {
            const lastNodeModel = this.createEmptyNode(node.id, node.viewState.x, node.viewState.y, false);
            this.updateNodeLinks(node, lastNodeModel, { showArrow: true });
            return;
        }
        // skip node creation
    }

    beginVisitDraft(node: FlowNode, parent?: FlowNode): void {
        const nodeModel = new DraftNodeModel(node);
        this.nodes.push(nodeModel);
        this.updateNodeLinks(node, nodeModel);
    }

    beginVisitComment(node: FlowNode, parent?: FlowNode): void {
        const nodeModel = new CommentNodeModel(node);
        this.nodes.push(nodeModel);
        this.updateNodeLinks(node, nodeModel);
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    getLastNodeModel(): NodeModel | undefined {
        return this.lastNodeModel;
    }
}
