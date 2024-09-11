/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeLinkModel } from "../components/NodeLink";
import { EmptyNodeModel } from "../components/nodes/EmptyNode";
import { NodeTypes } from "../resources/constants";
import { getNodeIdFromModel } from "../utils/node";
import { Flow, FlowNode, LinkableNodeModel, NodeModel } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class LinkTargetVisitor implements BaseVisitor {
    private skipChildrenVisit = false;
    private flow: Flow;
    private nodeModels: NodeModel[];
    private topDoBranch: string;

    constructor(originalFlowModel: Flow, nodeModels: NodeModel[], topDoBranch?: string) {
        console.log(">>> add link targets visitor started");
        this.flow = originalFlowModel;
        this.nodeModels = nodeModels;
        if (topDoBranch !== undefined) {
            this.topDoBranch = topDoBranch;
        }
    }

    private getOutLinksFromNode(node: FlowNode): NodeLinkModel[] {
        const model = this.nodeModels.find((nodeModel) => nodeModel.getID() === getNodeIdFromModel(node));
        if (!model) {
            return;
        }

        return this.getOutLinksFromModel(model as LinkableNodeModel);
    }

    private getOutLinksFromModel(nodeModel: NodeModel): NodeLinkModel[] {
        if (nodeModel.getType() === NodeTypes.BUTTON_NODE) {
            console.log(">>> getOutLinksFromNode: button node not supported");
            return;
        }

        const model = nodeModel as LinkableNodeModel;

        const outPort = model.getOutPort();
        if (!outPort) {
            console.log(">>> out port not found", { model });
            return;
        }

        const outLinks = outPort.getLinks();
        if (!outLinks) {
            console.log(">>> out links not found", { model });
            return;
        }

        const links: NodeLinkModel[] = [];
        for (const outLink of Object.values(outLinks)) {
            links.push(outLink as NodeLinkModel);
        }

        return links;
    }

    beginVisitNode(node: FlowNode, parent?: FlowNode): void {
        const outLinks = this.getOutLinksFromNode(node);
        if (!outLinks) {
            return;
        }
        outLinks.forEach((outLink) => {
            // set target position
            if (outLink && node.codedata?.lineRange?.endLine) {
                outLink.setTarget(node.codedata.lineRange.endLine);
                outLink.setTopNode(node);
            }
        });
    }

    beginVisitComment(node: FlowNode, parent?: FlowNode): void {
        const outLinks = this.getOutLinksFromNode(node);
        if (!outLinks) {
            return;
        }
        outLinks.forEach((outLink) => {
            // set target position
            if (outLink && node.codedata?.lineRange?.endLine) {
                outLink.setTarget({
                    line: node.codedata.lineRange.endLine.line - 1, // HACK: need to fix with LS extension
                    offset: 0,
                });
                outLink.setTopNode(node);
            }
        });
    }

    beginVisitEventHttpApi(node: FlowNode, parent?: FlowNode): void {
        // out links
        const outLinks = this.getOutLinksFromNode(node);
        // find top level do block
        const doBlock = this.flow.nodes.find((node) => node.codedata.node === "ERROR_HANDLER");
        if (doBlock) {
            const activeDoBranch = doBlock.branches.find((branch) => branch.label === this.topDoBranch);
            if (activeDoBranch && this.topDoBranch === "Body") {
                outLinks.forEach((outLink) => {
                    outLink.setTarget({
                        line: activeDoBranch.codedata.lineRange.startLine.line,
                        offset: activeDoBranch.codedata.lineRange.startLine.offset + 1, // HACK: need to fix with LS extension
                    });
                    outLink.setTopNode(activeDoBranch);
                });
                return;
            }
            if (activeDoBranch && this.topDoBranch === "On Failure") {
                outLinks.forEach((outLink) => {
                    outLink.setTarget({
                        line: activeDoBranch.codedata.lineRange.startLine.line,
                        offset: activeDoBranch.codedata.lineRange.startLine.offset + 1, // HACK: need to fix with LS extension
                    });
                    outLink.setTopNode(activeDoBranch);
                });
                return;
            }
        } else {
            console.log(">>> top level do block not found", node);
            outLinks.forEach((outLink) => {
                outLink.setTarget({
                    line: node.codedata.lineRange.startLine.line,
                    offset: node.codedata.lineRange.startLine.offset, // FIXME: need to fix with LS extension
                });
                outLink.setTopNode(node);
            });
        }
    }

    beginVisitIf(node: FlowNode, parent?: FlowNode): void {
        const outLinks = this.getOutLinksFromNode(node);
        if (!outLinks) {
            return;
        }

        const thenLink = outLinks.find((link) => link.label === "Then");
        if (thenLink) {
            const thenBranch = node.branches.find((branch) => branch.label === "Then");
            const line = thenBranch.codedata.lineRange.startLine;
            thenLink.setTarget({
                line: line.line,
                offset: line.offset + 1, // HACK: need to fix with LS extension
            });
            thenLink.setTopNode(thenBranch);
            // if then branch is empty, target node is empty node.
            // improve empty node with target position and top node
            const firstNode = thenLink.targetNode;
            if (firstNode && firstNode.getType() === NodeTypes.EMPTY_NODE) {
                const emptyNode = firstNode as EmptyNodeModel;
                emptyNode.setTopNode(thenBranch);
                emptyNode.setTarget({
                    line: line.line,
                    offset: line.offset + 1, // HACK: need to fix with LS extension
                });
            }
        }

        const elseLink = outLinks.find((link) => link.label === "Else");
        if (elseLink) {
            const elseBranch = node.branches.find((branch) => branch.label === "Else");
            const line = elseBranch.codedata.lineRange.startLine;
            elseLink.setTarget({
                line: line.line,
                offset: line.offset + 6, //HACK: need to fix with LS extension
            });
            elseLink.setTopNode(elseBranch);
            // if else branch is empty, target node is empty node.
            // improve empty node with target position and top node
            const firstNode = elseLink.targetNode;
            if (firstNode && firstNode.getType() === NodeTypes.EMPTY_NODE) {
                const emptyNode = firstNode as EmptyNodeModel;
                emptyNode.setTopNode(elseBranch);
                emptyNode.setTarget({
                    line: line.line,
                    offset: line.offset + 6, // HACK: need to fix with LS extension
                });
            }
        }

        // update end-if link target
        const endIfModel = this.nodeModels.find((nodeModel) => nodeModel.getID() === `${node.id}-endif`);
        if (!endIfModel) {
            console.log("End-if node model not found", node);
            return;
        }
        const endIfOutLinks = this.getOutLinksFromModel(endIfModel);
        if (!endIfOutLinks) {
            return;
        }
        endIfOutLinks.forEach((outLink) => {
            // set target position
            if (outLink && node.codedata?.lineRange?.endLine) {
                outLink.setTarget(node.codedata.lineRange.endLine);
            }
            outLink.setTopNode(node);
        });
    }

    beginVisitWhile(node: FlowNode, parent?: FlowNode): void {
        const outLinks = this.getOutLinksFromNode(node);
        if (!outLinks) {
            return;
        }

        const bodyLink = outLinks.find((link) => link.label === "Body");
        if (bodyLink) {
            const thenBranch = node.branches.find((branch) => branch.label === "Body");
            const line = thenBranch.codedata.lineRange.startLine;
            bodyLink.setTarget({
                line: line.line,
                offset: line.offset + 1, // HACK: need to fix with LS extension
            });
            bodyLink.setTopNode(thenBranch);
            // if body branch is empty, target node is empty node.
            // improve empty node with target position and top node
            const firstNode = bodyLink.targetNode;
            if (firstNode && firstNode.getType() === NodeTypes.EMPTY_NODE) {
                const emptyNode = firstNode as EmptyNodeModel;
                emptyNode.setTopNode(thenBranch);
                emptyNode.setTarget({
                    line: line.line,
                    offset: line.offset + 1, // HACK: need to fix with LS extension
                });
            }
        }

        // update end-if link target
        const endWhileModel = this.nodeModels.find((nodeModel) => nodeModel.getID() === `${node.id}-endwhile`);
        if (!endWhileModel) {
            console.log("End-while node model not found", node);
            return;
        }
        const endWhileOutLinks = this.getOutLinksFromModel(endWhileModel);
        if (!endWhileOutLinks) {
            return;
        }
        endWhileOutLinks.forEach((outLink) => {
            // set target position
            if (outLink && node.codedata?.lineRange?.endLine) {
                outLink.setTarget(node.codedata.lineRange.endLine);
            }
            outLink.setTopNode(node);
        });
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
