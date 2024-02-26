/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NODE_GAP_X, NODE_GAP_Y } from "../resources/constants";
import { Node } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class PositionVisitor implements BaseVisitor {
    private skipChildrenVisit = false;
    private lastY = 200; // last node y position
    private branchParentY = 0; // branch parent node y position

    constructor() {
        console.log("position visitor started");
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    getNodePosition(node: Node, parent: Node) {
        return { x: node.viewState.x, y: node.viewState.y };
    }

    beginVisitNode(node: Node, parent: Node): void {
        if (!node.id && node.kind !== "FLOW") {
            return;
        }
        if (node.viewState == undefined) {
            console.warn(">>> unvisited node", node);
        }
        if (parent?.viewState) {
            node.viewState.x = parent.viewState.x + parent.viewState.w / 2 - node.viewState.w / 2;
        }

        node.viewState.y = this.lastY + NODE_GAP_Y;
        this.lastY = node.viewState.y + node.viewState.h;
    }

    beginVisitIf(node: Node, parent?: Node): void {
        if (node.viewState == undefined) {
            console.warn(">>> unvisited node", node);
        }
        if (parent?.viewState) {
            node.viewState.x = parent.viewState.x + parent.viewState.w / 2;
        }

        let middleX = node.viewState.x + node.viewState.w / 2;

        if (node.thenBranch.viewState) {
            node.thenBranch.viewState.x = middleX - node.thenBranch.viewState.w - NODE_GAP_X / 2;
        }
        if (node.elseBranch.viewState) {
            node.elseBranch.viewState.x = middleX + NODE_GAP_X / 2;
        }

        node.viewState.y = this.lastY + NODE_GAP_Y;
        this.lastY = node.viewState.y + node.viewState.h;

        this.branchParentY = this.lastY;
    }

    endVisitThenBranchBody(node: Node, parent?: Node): void {
        this.lastY = this.branchParentY;
    }
}
