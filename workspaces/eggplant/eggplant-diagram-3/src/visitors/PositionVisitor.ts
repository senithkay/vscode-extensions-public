/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NODE_GAP_X, NODE_GAP_Y } from "../resources/constants";
import { Branch, Node } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class PositionVisitor implements BaseVisitor {
    private skipChildrenVisit = false;
    private topX = 500; // top node x position
    private lastY = 200; // last node y position
    private branchParentY = 0; // branch parent node y position

    constructor() {
        console.log("position visitor started");
    }

    beginVisitEventHttpApi(node: Node, parent?: Node): void {
        // consider this as a start node
        node.viewState.y = this.lastY;
        this.lastY += node.viewState.h + NODE_GAP_Y;

        node.viewState.x = this.topX - node.viewState.w / 2;
    }

    beginVisitIf(node: Node, parent?: Node): void {
        node.viewState.y = this.lastY;
        this.lastY += node.viewState.h + NODE_GAP_Y;

        const center = parent ? parent.viewState.x + (parent.viewState.cw / 2) : this.topX;
        node.viewState.x = center - node.viewState.w / 2;

        // const thenBranch = node.branches.find((branch) => branch.label === "Then");
        // thenBranch.viewState.y = this.lastY;
        // thenBranch.viewState.x = center - thenBranch.viewState.cw - NODE_GAP_X / 2;

        // const elseBranch = node.branches.find((branch) => branch.label === "Else");
        // elseBranch.viewState.y = this.lastY;
        // elseBranch.viewState.x = center + NODE_GAP_X / 2;

        const thenBranch = node.branches.find((branch) => branch.label === "Then");
        thenBranch.viewState.y = this.lastY;
        thenBranch.viewState.x = center - thenBranch.viewState.cw - NODE_GAP_X / 2;

        const elseBranch = node.branches.find((branch) => branch.label === "Else");
        elseBranch.viewState.y = this.lastY;
        elseBranch.viewState.x = center + NODE_GAP_X / 2;
    }

    endVisitIf(node: Node, parent?: Node): void {
        // if early return not present, add empty node end of the if block
        const thenBranchHasEarlyReturn = node.branches.find((branch) => branch.label === "Then")?.children.at(-1)?.kind == "RETURN";
        const elseBranchHasEarlyReturn = node.branches.find((branch) => branch.label === "Else")?.children.at(-1)?.kind == "RETURN";
        if (!(thenBranchHasEarlyReturn && elseBranchHasEarlyReturn)) {
            // add empty node
            this.lastY += NODE_GAP_Y;
        }
    }

    beginVisitBlock(node: Branch, parent?: Node): void {
        this.lastY = node.viewState.y;
    }

    beginVisitNode(node: Node, parent?: Node): void {
        if (!node.viewState.y) {
            node.viewState.y = this.lastY;
        }
        this.lastY += node.viewState.h + NODE_GAP_Y;

        if (!node.viewState.x) {
            const center = parent ? parent.viewState.x + (parent.viewState.w / 2) : this.topX;
            node.viewState.x = center - node.viewState.w / 2;
        }
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    getNodePosition(node: Node, parent: Node) {
        return { x: node.viewState.x, y: node.viewState.y };
    }

}
