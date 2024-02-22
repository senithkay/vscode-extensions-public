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
    private nextX = 0; // next node x position
    private lastY = 200; // last node y position
    private branchParentY = 0; // branch parent node y position

    constructor() {
        console.log("position visitor started");
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    beginVisitNode(node: Node): void {
        if (!node.id) {
            return;
        }
        if (node.viewState == undefined) {
            console.warn(">>> unvisited node", node);
        }
        node.viewState.y = this.lastY + node.viewState.h + NODE_GAP_Y;
        this.lastY = node.viewState.y;
    }

    endVisitNode(node: Node): void {
        if (!node.id) {
            return;
        }
        if (node.viewState == undefined) {
            console.warn(">>> unvisited node", node);
        }
        node.viewState.x = this.nextX;
        this.lastY = node.viewState.y;
    }

    beginVisitIf(node: Node): void {
        node.viewState.y = this.lastY + node.viewState.h + NODE_GAP_Y;
        this.lastY = node.viewState.y;

        this.branchParentY = node.viewState.y;
    }

    endVisitThenBranchBody(node: Node): void {
        // set x for next branch
        this.nextX = this.nextX + node.viewState.w + NODE_GAP_X;
        this.lastY = this.branchParentY;
    }

    endVisitElseBranchBody(node: Node): void {
        // set x for root branch
        this.nextX = this.nextX - (node.viewState.w + NODE_GAP_X) / 2;
    }
}
