/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    COMMENT_NODE_WIDTH,
    EMPTY_NODE_CONTAINER_WIDTH,
    EMPTY_NODE_WIDTH,
    IF_NODE_WIDTH,
    LABEL_HEIGHT,
    NODE_BORDER_WIDTH,
    NODE_GAP_X,
    NODE_GAP_Y,
    NODE_HEIGHT,
    NODE_PADDING,
    NODE_WIDTH,
    VSCODE_MARGIN,
    WHILE_NODE_WIDTH,
} from "../resources/constants";
import { Branch, FlowNode } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class SizingVisitor implements BaseVisitor {
    private skipChildrenVisit = false;

    constructor() {
        console.log(">>> sizing visitor started");
    }

    private setNodeSize(
        node: FlowNode | Branch,
        width: number,
        height: number,
        containerWidth?: number,
        containerHeight?: number
    ): void {
        if (node.viewState == undefined) {
            console.error("FlowNode view state is not initialized", { node });
            return;
        }
        node.viewState.w = width;
        node.viewState.h = height;

        node.viewState.cw = containerWidth || width;
        node.viewState.ch = containerHeight || height;
    }

    private createBaseNode(node: FlowNode): void {
        const width = NODE_WIDTH + NODE_BORDER_WIDTH * 2 + NODE_PADDING * 2;
        let height = NODE_HEIGHT + NODE_BORDER_WIDTH * 2;
        if (node.properties?.variable?.value || node.properties?.type?.value) {
            height += LABEL_HEIGHT;
        }
        this.setNodeSize(node, width, height);
    }

    private createApiCallNode(node: FlowNode): void {
        const width = NODE_WIDTH + NODE_BORDER_WIDTH * 2 + NODE_PADDING * 2;
        const containerWidth = width + NODE_GAP_X + NODE_HEIGHT + LABEL_HEIGHT;
        let height = NODE_HEIGHT + NODE_BORDER_WIDTH * 2;
        if (node.properties?.variable?.value || node.properties?.type?.value) {
            height += LABEL_HEIGHT;
        }
        this.setNodeSize(node, width, height, containerWidth);
    }

    private createBlockNode(node: Branch): void {
        // get max width of children and sum of heights
        let width = 0;
        let height = 0;
        if (node.children) {
            node.children.forEach((child: FlowNode) => {
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
        height = Math.max(height, NODE_HEIGHT * 2);
        this.setNodeSize(node, width, height);
    }

    endVisitNode = (node: FlowNode): void => this.createBaseNode(node);

    endVisitEventStart(node: FlowNode, parent?: FlowNode): void {
        // consider this as a start node
        const width = Math.round(NODE_WIDTH / 3) + NODE_BORDER_WIDTH * 2 + NODE_PADDING * 2;
        const height = Math.round(NODE_HEIGHT / 1.5) + NODE_BORDER_WIDTH * 2;
        this.setNodeSize(node, width, height);
    }

    endVisitIf(node: FlowNode, parent?: FlowNode): void {
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
        height += IF_NODE_WIDTH + NODE_GAP_Y + NODE_GAP_Y;

        const ifNodeWidth = IF_NODE_WIDTH + VSCODE_MARGIN;
        this.setNodeSize(node, ifNodeWidth, ifNodeWidth, width, height);
    }

    // endVisitBlock(node: Branch, parent?: FlowNode): void {
    //     this.createBlockNode(node);
    // }
    endVisitConditional(node: Branch, parent?: FlowNode): void {
        this.createBlockNode(node);
    }

    endVisitElse(node: Branch, parent?: FlowNode): void {
        this.createBlockNode(node);
    }

    endVisitActionCall(node: FlowNode, parent?: FlowNode): void {
        this.createApiCallNode(node);
    }

    endVisitEmpty(node: FlowNode, parent?: FlowNode): void {
        this.setNodeSize(node, EMPTY_NODE_WIDTH, EMPTY_NODE_WIDTH, EMPTY_NODE_CONTAINER_WIDTH, NODE_HEIGHT);
    }

    endVisitComment(node: FlowNode, parent?: FlowNode): void {
        const width = COMMENT_NODE_WIDTH;
        const height = NODE_HEIGHT;
        const containerWidth = width + NODE_WIDTH / 2;
        this.setNodeSize(node, width, height, containerWidth);
    }

    endVisitWhile(node: FlowNode, parent?: FlowNode): void {
        let width = 0;
        let height = 0;
        if (node.branches && node.branches.length == 1) {
            const mainBranch: Branch = node.branches.at(0);
            if (mainBranch.viewState) {
                width = Math.max(width, Math.max(mainBranch.viewState.cw, NODE_GAP_X));
                height = mainBranch.viewState.ch;
            }
        }
        // add while node width and height
        height += WHILE_NODE_WIDTH + NODE_GAP_Y + NODE_GAP_Y;

        const whileNodeWidth = WHILE_NODE_WIDTH + VSCODE_MARGIN;
        this.setNodeSize(node, whileNodeWidth, whileNodeWidth, width, height);
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
