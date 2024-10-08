/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { COMMENT_NODE_GAP, DIAGRAM_CENTER_X, NODE_GAP_X, NODE_GAP_Y, NODE_PADDING, VSCODE_MARGIN } from "../resources/constants";
import { Branch, FlowNode } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class PositionVisitor implements BaseVisitor {
    private skipChildrenVisit = false;
    private diagramCenterX = DIAGRAM_CENTER_X;
    private lastNodeY = 200;

    constructor() {
        console.log(">>> position visitor started");
    }

    beginVisitEventHttpApi(node: FlowNode, parent?: FlowNode): void {
        // consider this as a start node
        node.viewState.y = this.lastNodeY;
        this.lastNodeY += node.viewState.h + NODE_GAP_Y;

        node.viewState.x = this.diagramCenterX - node.viewState.w / 2;
    }

    beginVisitIf(node: FlowNode, parent?: FlowNode): void {
        node.viewState.y = this.lastNodeY;
        this.lastNodeY += node.viewState.h + NODE_GAP_Y + VSCODE_MARGIN;

        const centerX = getTopNodeCenter(node, parent, this.diagramCenterX);
        node.viewState.x = centerX - node.viewState.w / 2;

        if (node.branches.length < 2) {
            console.error("If node should have 2 branches");
            return;
        }

        const firstBranchWidth = node.branches.at(0).viewState.cw;
        const lastBranchWidth = node.branches.at(-1).viewState.cw;
        // branches from index 1 to n-1
        let middleBranchesTotalWidth = 0;
        for (let i = 1; i < node.branches.length - 1; i++) {
            const branch = node.branches.at(i);
            middleBranchesTotalWidth += branch.viewState.cw;
        }
        const numberOfBranches = node.branches.length;
        // left side width to center point
        const leftWidth =
            (3 * firstBranchWidth +
                2 * middleBranchesTotalWidth +
                lastBranchWidth +
                (numberOfBranches - 1) * NODE_GAP_X) /
            4;
        const startX = centerX - leftWidth;

        node.branches.forEach((branch, index) => {
            if (index === 0) {
                // then branch
                branch.viewState.x = startX;
                // HACK
                // if(branch.children.length === 1 && branch.children.at(0).codedata.node === "EMPTY") {
                    branch.viewState.x -= VSCODE_MARGIN;
                // }
            } else {
                const previousBranch = node.branches.at(index - 1);
                branch.viewState.x = previousBranch.viewState.x + previousBranch.viewState.cw + NODE_GAP_X;
            }
            branch.viewState.y = this.lastNodeY;
        });
    }

    endVisitIf(node: FlowNode, parent?: FlowNode): void {
        this.lastNodeY = node.viewState.y + node.viewState.ch + NODE_GAP_Y;
    }

    beginVisitConditional(node: Branch, parent?: FlowNode): void {
        this.lastNodeY = node.viewState.y;
    }

    beginVisitElse(node: Branch, parent?: FlowNode): void {
        this.lastNodeY = node.viewState.y;
    }

    beginVisitNode(node: FlowNode, parent?: FlowNode): void {
        if (!node.viewState.y) {
            node.viewState.y = this.lastNodeY;
        }
        this.lastNodeY += node.viewState.h + NODE_GAP_Y;

        if (!node.viewState.x) {
            const centerX = getTopNodeCenter(node, parent, this.diagramCenterX);
            node.viewState.x = centerX - node.viewState.w / 2;
        }
    }

    beginVisitEmpty(node: FlowNode, parent?: FlowNode): void {
        // add empty node end of the block
        if (node.id.endsWith("-last")) {
            node.viewState.y = this.lastNodeY;
            const centerX = parent
                ? parent.viewState.x + (parent.viewState.w - VSCODE_MARGIN) / 2
                : this.diagramCenterX;
            node.viewState.x = centerX - node.viewState.w / 2;
            // if top node is comment, align with comment
            if (parent.codedata.node === "COMMENT") {
                node.viewState.x = parent.viewState.x - NODE_PADDING / 2;
            }
            return;
        }
        // normal node flow
        this.beginVisitNode(node, parent);
    }

    beginVisitComment(node: FlowNode, parent?: FlowNode): void {
        if (!node.viewState.y) {
            node.viewState.y = this.lastNodeY - COMMENT_NODE_GAP;
        }
        this.lastNodeY = node.viewState.y + node.viewState.h + COMMENT_NODE_GAP;

        if (!node.viewState.x) {
            const centerX = getTopNodeCenter(node, parent, this.diagramCenterX);
            node.viewState.x = centerX - (NODE_PADDING + VSCODE_MARGIN) / 2;
        }
    }

    beginVisitWhile(node: FlowNode, parent?: FlowNode): void {
        node.viewState.y = this.lastNodeY;
        this.lastNodeY += node.viewState.h + NODE_GAP_Y;

        const centerX = getTopNodeCenter(node, parent, this.diagramCenterX);
        node.viewState.x = centerX - node.viewState.w / 2;

        const bodyBranch = node.branches.find((branch) => branch.label === "Body");
        bodyBranch.viewState.y = this.lastNodeY;

        bodyBranch.viewState.x = centerX -  bodyBranch.viewState.cw / 2
    }

    endVisitForeach(node: FlowNode, parent?: FlowNode): void {
        this.lastNodeY = node.viewState.y + node.viewState.ch + NODE_GAP_Y;
    }

    beginVisitForeach(node: FlowNode, parent?: FlowNode): void {
        node.viewState.y = this.lastNodeY;
        this.lastNodeY += node.viewState.h + NODE_GAP_Y;

        const centerX = getTopNodeCenter(node, parent, this.diagramCenterX);
        node.viewState.x = centerX - node.viewState.w / 2;

        const bodyBranch = node.branches.find((branch) => branch.label === "Body");
        bodyBranch.viewState.y = this.lastNodeY;

        bodyBranch.viewState.x = centerX -  bodyBranch.viewState.cw / 2
    }

    endVisitWhile(node: FlowNode, parent?: FlowNode): void {
        this.lastNodeY = node.viewState.y + node.viewState.ch + NODE_GAP_Y;
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    getNodePosition(node: FlowNode, parent: FlowNode) {
        return { x: node.viewState.x, y: node.viewState.y };
    }
}

// get top node center. base node is centered. base node center is the width/2. comment node is left aligned. so, center is x.
function getTopNodeCenter(node: FlowNode, parent: FlowNode, branchCenterX: number) {
    if (parent.codedata.node === "COMMENT") {
        return parent.viewState.x + (NODE_PADDING + VSCODE_MARGIN) / 2;
    }
    const centerX = parent ? parent.viewState.x + parent.viewState.w / 2 : branchCenterX;
    return centerX;
}
