/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    IF_NODE_WIDTH,
    NODE_BORDER_WIDTH,
    NODE_GAP_X,
    NODE_GAP_Y,
    NODE_HEIGHT,
    NODE_PADDING,
    NODE_WIDTH,
} from "../resources/constants";
import { Branch, Node, ViewState } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class SizingVisitor implements BaseVisitor {
    private skipChildrenVisit = false;

    constructor() {
        console.log("sizing visitor started");
    }

    private getDefaultViewState(): ViewState {
        return { x: 0, y: 0, w: 0, h: 0 };
    }

    private setNodeSize(
        node: Node | Branch,
        width: number,
        height: number,
        containerWidth?: number,
        containerHeight?: number
    ): void {
        if (node.viewState == undefined) {
            node.viewState = this.getDefaultViewState();
        }
        node.viewState.w = width;
        node.viewState.h = height;

        node.viewState.cw = containerWidth || width;
        node.viewState.ch = containerHeight || height;
    }

    private createBaseNode(node: Node): void {
        const width = NODE_WIDTH + NODE_BORDER_WIDTH * 2 + NODE_PADDING * 2;
        const height = NODE_HEIGHT + NODE_BORDER_WIDTH * 2;
        this.setNodeSize(node, width, height);
    }

    endVisitNode = (node: Node): void => this.createBaseNode(node);

    endVisitEventHttpApi(node: Node, parent?: Node): void {
        // consider this as a start node
        const width = Math.round(NODE_WIDTH / 3) + NODE_BORDER_WIDTH * 2 + NODE_PADDING * 2;
        const height = Math.round(NODE_HEIGHT / 1.5) + NODE_BORDER_WIDTH * 2;
        this.setNodeSize(node, width, height);
    }

    endVisitIf(node: Node, parent?: Node): void {
        // sum of then and else branches width and max height
        let width = 0;
        let height = 0;
        if (node.branches) {
            node.branches.forEach((child: Branch) => {
                if (child.viewState) {
                    if (width > 0) {
                        width += NODE_GAP_X;
                    }
                    width += child.viewState.cw;
                    height = Math.max(height, Math.max(child.viewState.ch, NODE_GAP_Y));
                }
            });
        }
        // add if node width and height
        height += IF_NODE_WIDTH + NODE_GAP_Y;

        // if early return not present in both branches, add empty node end of the if block
        const thenBranchHasEarlyReturn =
            node.branches.find((branch) => branch.label === "Then")?.children.at(-1)?.kind == "RETURN";
        const elseBranchHasEarlyReturn =
            node.branches.find((branch) => branch.label === "Else")?.children.at(-1)?.kind == "RETURN";
        if (!(thenBranchHasEarlyReturn && elseBranchHasEarlyReturn)) {
            // add empty node
            height += NODE_GAP_Y;
        }

        // console.log(">>> if size", { node, width, height });
        this.setNodeSize(node, IF_NODE_WIDTH, IF_NODE_WIDTH, width, height);
    }

    endVisitBlock(node: Branch, parent?: Node): void {
        // get max width of children and sum of heights
        let width = 0;
        let height = 0;
        if (node.children) {
            node.children.forEach((child: Node) => {
                if (child.viewState) {
                    width = Math.max(width, child.viewState.cw);
                    if (height > 0) {
                        // add link heights
                        height += NODE_GAP_Y;
                    }
                    height += child.viewState.ch;
                }
            });
        }
        // console.log(">>> block size", { node, width, height });
        this.setNodeSize(node, width, height);
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
