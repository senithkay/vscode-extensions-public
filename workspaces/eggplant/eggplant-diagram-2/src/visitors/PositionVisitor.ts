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

    beginVisitNode(node: Node, parent: Node): void {
        if (!node.id && node.kind !== "FLOW") {
            return;
        }
        if (node.viewState == undefined) {
            console.warn(">>> unvisited node", node);
        }
        if (parent?.viewState) {
            node.viewState.x = parent.viewState.x + parent.viewState.w / 2;
            this.nextX = node.viewState.x;
        }

        node.viewState.y = this.lastY + NODE_GAP_Y;
        this.lastY = node.viewState.y + node.viewState.h;
        console.log(">>> >>> begin visit node", node);
    }

    // endVisitNode(node: Node): void {
    //     if (!node.id) {
    //         return;
    //     }
    //     console.log(">>> end visit node", node);
    //     if (node.viewState == undefined) {
    //         console.warn(">>> unvisited node", node);
    //     }
    //     node.viewState.x = this.nextX;
    //     this.lastY = node.viewState.y;
    // }

    beginVisitIf(node: Node, parent?: Node): void {
        if (node.viewState == undefined) {
            console.warn(">>> unvisited node", node);
        }
        if (parent?.viewState) {
            node.viewState.x = parent.viewState.x + parent.viewState.w / 2;
            this.nextX = node.viewState.x;
        }

        node.viewState.y = this.lastY + NODE_GAP_Y;
        this.lastY = node.viewState.y + node.viewState.h;

        this.branchParentY = this.lastY;
    }

    endVisitThenBranchBody(node: Node, parent?: Node): void {
        console.log(">>> end visit then branch body", node);
        // set x for next branch
        this.nextX = parent.viewState.x + parent.viewState.w + NODE_GAP_X;
        this.lastY = this.branchParentY;
    }

    // endVisitElseBranchBody(node: Node): void {
    //     console.log(">>> end visit else branch body", node);
    //     // set x for root branch
    //     this.nextX = this.nextX - (node.viewState.w + NODE_GAP_X) / 2;
    // }

    // endVisitIf(node: Node): void {
    //     console.log(">>> end visit if", node);
    //     node.viewState.x = this.nextX;
    //     this.lastY = node.viewState.y;
    // }
}
