/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    COMMENT_NODE_GAP,
    DIAGRAM_CENTER_X,
    NODE_GAP_X,
    NODE_GAP_Y,
    NODE_PADDING,
    VSCODE_MARGIN,
} from "../resources/constants";
import { Branch, FlowNode } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class PositionVisitor implements BaseVisitor {
    private skipChildrenVisit = false;
    private diagramCenterX = DIAGRAM_CENTER_X;
    private lastNodeY = 200;

    constructor() {
        // console.log(">>> position visitor started");
    }

    beginVisitEventStart(node: FlowNode, parent?: FlowNode): void {
        // consider this as a start node
        node.viewState.y = this.lastNodeY;
        this.lastNodeY += node.viewState.h + NODE_GAP_Y;
        console.log(">>> start node", { node, parent, lastNodeY: this.lastNodeY });

        node.viewState.x = this.diagramCenterX - node.viewState.rw;
    }

    beginVisitIf(node: FlowNode, parent?: FlowNode): void {
        node.viewState.y = this.lastNodeY;
        this.lastNodeY += node.viewState.h + (NODE_GAP_Y * 3) / 2;

        const centerX = getTopNodeCenter(node, parent, this.diagramCenterX);
        console.log(">>> if node", { node, parent, lastNodeY: this.lastNodeY, centerX });
        node.viewState.x = centerX - node.viewState.lw;

        if (node.branches.length < 2) {
            console.error("If node should have 2 branches");
            return;
        }

        // const firstBranchWidth = node.branches.at(0).viewState.clw + node.branches.at(0).viewState.crw;
        // const lastBranchWidth = node.branches.at(-1).viewState.clw + node.branches.at(-1).viewState.crw;
        // branches from index 1 to n-1
        // let middleBranchesTotalWidth = 0;
        // for (let i = 1; i < node.branches.length - 1; i++) {
        //     const branch = node.branches.at(i);
        //     middleBranchesTotalWidth += branch.viewState.clw + branch.viewState.crw;
        // }
        // const numberOfBranches = node.branches.length;
        // left side width to center point
        // const leftWidth =
        //     (3 * firstBranchWidth +
        //         2 * middleBranchesTotalWidth +
        //         lastBranchWidth +
        //         (numberOfBranches - 1) * NODE_GAP_X) /
        //     4;
        // const startX = centerX - leftWidth;

        node.branches.forEach((branch, index) => {
            if (index === 0) {
                branch.viewState.x = centerX - node.viewState.clw;
            } else {
                const previousBranch = node.branches.at(index - 1);
                branch.viewState.x =
                    previousBranch.viewState.x +
                    previousBranch.viewState.clw +
                    previousBranch.viewState.crw +
                    NODE_GAP_X;
            }
            branch.viewState.y = this.lastNodeY;
        });
    }

    endVisitIf(node: FlowNode, parent?: FlowNode): void {
        this.lastNodeY = node.viewState.y + node.viewState.ch + NODE_GAP_Y;
        console.log(">>> end if node", { node, parent, lastNodeY: this.lastNodeY });
    }

    beginVisitConditional(node: Branch, parent?: FlowNode): void {
        this.lastNodeY = node.viewState.y;
    }

    beginVisitBody(node: Branch, parent?: FlowNode): void {
        // `Body` is inside `Foreach` node
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
            node.viewState.x = centerX - node.viewState.lw;
            console.log(">>> node", { node, parent, lastNodeY: this.lastNodeY, centerX });
        }
    }

    beginVisitEmpty(node: FlowNode, parent?: FlowNode): void {
        // add empty node end of the block
        if (node.id.endsWith("-last")) {
            node.viewState.y = this.lastNodeY;
            const centerX = parent ? parent.viewState.x + parent.viewState.lw : this.diagramCenterX;
            console.log(">>> end node", { node, parent, lastNodeY: this.lastNodeY, centerX });
            node.viewState.x = centerX - node.viewState.rw;
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
        node.viewState.x = centerX - node.viewState.rw;

        const bodyBranch = node.branches.find((branch) => branch.label === "Body");
        bodyBranch.viewState.y = this.lastNodeY;

        bodyBranch.viewState.x = centerX - bodyBranch.viewState.crw;
    }

    endVisitWhile(node: FlowNode, parent?: FlowNode): void {
        this.lastNodeY = node.viewState.y + node.viewState.ch + NODE_GAP_Y;
    }

    beginVisitForeach(node: FlowNode, parent?: FlowNode): void {
        this.beginVisitWhile(node, parent);
    }

    endVisitForeach(node: FlowNode, parent?: FlowNode): void {
        this.endVisitWhile(node, parent);
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
    if (!parent) {
        console.error("Parent is not defined");
        return;
    }
    if (parent.codedata.node === "COMMENT") {
        return parent.viewState.x + NODE_PADDING / 2;
    }
    const centerX = parent ? parent.viewState.x + parent.viewState.lw : branchCenterX;
    return centerX;
}
