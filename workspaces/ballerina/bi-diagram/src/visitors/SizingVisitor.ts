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
    END_NODE_WIDTH,
    ERROR_HANDLER_NODE_WIDTH,
    IF_NODE_WIDTH,
    LABEL_HEIGHT,
    NODE_BORDER_WIDTH,
    NODE_GAP_X,
    NODE_GAP_Y,
    NODE_HEIGHT,
    NODE_WIDTH,
    WHILE_NODE_WIDTH,
} from "../resources/constants";
import { Branch, FlowNode, ViewState } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class SizingVisitor implements BaseVisitor {
    private skipChildrenVisit = false;

    constructor() {
        // console.log(">>> sizing visitor started");
    }

    private setNodeSize(
        node: FlowNode | Branch,
        leftWidth: number,
        rightWidth: number,
        height: number,
        containerLeftWidth?: number,
        containerRightWidth?: number,
        containerHeight?: number
    ): void {
        if (!node.viewState) {
            console.error("FlowNode view state is not initialized", { node });
            return;
        }

        // Set basic widths and height
        node.viewState.lw = leftWidth;
        node.viewState.rw = rightWidth;
        node.viewState.h = height;

        // Set container dimensions
        node.viewState.clw = containerLeftWidth || leftWidth;
        node.viewState.crw = containerRightWidth || rightWidth;
        node.viewState.ch = containerHeight || height;
    }

    private createBaseNode(node: FlowNode): void {
        const totalWidth = NODE_WIDTH;
        const halfWidth = totalWidth / 2;
        let height = NODE_HEIGHT + NODE_BORDER_WIDTH * 2;

        if (node.properties?.variable?.value || node.properties?.type?.value) {
            height += LABEL_HEIGHT;
        }

        this.setNodeSize(node, halfWidth, halfWidth, height);
    }

    private createApiCallNode(node: FlowNode): void {
        const nodeWidth = NODE_WIDTH;
        const halfNodeWidth = nodeWidth / 2;
        const containerLeftWidth = halfNodeWidth;
        const containerRightWidth = halfNodeWidth + NODE_GAP_X + NODE_HEIGHT + LABEL_HEIGHT;

        const nodeHeight = NODE_HEIGHT;
        let containerHeight = nodeHeight;
        if (node.properties?.variable?.value || node.properties?.type?.value) {
            containerHeight += LABEL_HEIGHT;
        }

        this.setNodeSize(node, containerLeftWidth, containerRightWidth, containerHeight);
    }

    private createBlockNode(node: Branch): void {
        // get max width of children and sum of heights
        let leftWidth = 0;
        let rightWidth = 0;
        let height = 0;
        if (node.children) {
            node.children.forEach((child: FlowNode) => {
                if (child.viewState) {
                    leftWidth = Math.max(leftWidth, child.viewState.clw);
                    rightWidth = Math.max(rightWidth, child.viewState.crw);
                    if (height > 0) {
                        // add link heights
                        height += NODE_GAP_Y;
                    }
                    height += child.viewState.ch;
                }
            });
        }
        height = Math.max(height, NODE_HEIGHT * 2);
        this.setNodeSize(node, leftWidth, rightWidth, height);
    }

    endVisitNode = (node: FlowNode): void => this.createBaseNode(node);

    endVisitEventStart(node: FlowNode, parent?: FlowNode): void {
        // consider this as a start node
        const width = Math.round(NODE_WIDTH / 3);
        const height = Math.round(NODE_HEIGHT / 1.5) + NODE_BORDER_WIDTH * 2;
        const halfWidth = width / 2;
        this.setNodeSize(node, halfWidth, halfWidth, height);
    }

    endVisitIf(node: FlowNode, parent?: FlowNode): void {
        // first branch
        const firstBranchWidthViewState = node.branches.at(0)?.viewState;
        // last branch
        const lastBranchWidthViewState = node.branches.at(-1)?.viewState;
        // middle branches width
        const middleBranchesWidth = node.branches.slice(1, -1).reduce((acc, branch) => {
            return acc + branch.viewState?.clw + branch.viewState?.crw;
        }, 0);
        // if bar width
        const ifBarWidth =
            firstBranchWidthViewState?.crw +
            middleBranchesWidth +
            lastBranchWidthViewState?.clw +
            NODE_GAP_X * (node.branches.length - 1);
        // if node container left width
        const ifNodeContainerLeftWidth = firstBranchWidthViewState?.clw + ifBarWidth / 2;
        // if node container right width
        const ifNodeContainerRightWidth = ifBarWidth / 2 + lastBranchWidthViewState?.crw;

        // if node container height
        let containerHeight = 0;
        if (node.branches) {
            node.branches.forEach((child: Branch) => {
                if (child.viewState) {
                    containerHeight = Math.max(containerHeight, Math.max(child.viewState.ch, NODE_GAP_Y));
                }
            });
        }
        // add if node width and height
        containerHeight += IF_NODE_WIDTH + (NODE_GAP_Y * 5) / 2;

        const halfNodeWidth = IF_NODE_WIDTH / 2;
        const nodeHeight = IF_NODE_WIDTH;

        this.setNodeSize(
            node,
            halfNodeWidth,
            halfNodeWidth,
            nodeHeight,
            ifNodeContainerLeftWidth,
            ifNodeContainerRightWidth,
            containerHeight
        );
    }

    // endVisitBlock(node: Branch, parent?: FlowNode): void {
    //     this.createBlockNode(node);
    // }
    endVisitConditional(node: Branch, parent?: FlowNode): void {
        this.createBlockNode(node);
    }

    // `Body` is inside `Foreach` node
    endVisitBody(node: Branch, parent?: FlowNode): void {
        this.createBlockNode(node);
    }

    endVisitElse(node: Branch, parent?: FlowNode): void {
        this.createBlockNode(node);
    }

    endVisitRemoteActionCall(node: FlowNode, parent?: FlowNode): void {
        this.createApiCallNode(node);
    }

    endVisitResourceActionCall(node: FlowNode, parent?: FlowNode): void {
        this.createApiCallNode(node);
    }

    endVisitEmpty(node: FlowNode, parent?: FlowNode): void {
        if (node.id.endsWith("-last")) {
            const halfWidth = END_NODE_WIDTH / 2;
            const containerHalfWidth = EMPTY_NODE_CONTAINER_WIDTH / 2;
            this.setNodeSize(
                node,
                halfWidth,
                halfWidth,
                END_NODE_WIDTH,
                containerHalfWidth,
                containerHalfWidth,
                NODE_HEIGHT
            );
            return;
        }
        const halfWidth = END_NODE_WIDTH / 2;
        const containerHalfWidth = EMPTY_NODE_CONTAINER_WIDTH / 2;
        this.setNodeSize(
            node,
            halfWidth,
            halfWidth,
            END_NODE_WIDTH,
            containerHalfWidth,
            containerHalfWidth,
            END_NODE_WIDTH
        );
    }

    endVisitComment(node: FlowNode, parent?: FlowNode): void {
        const width = COMMENT_NODE_WIDTH;
        const height = NODE_HEIGHT;
        const containerWidth = width + NODE_WIDTH / 2;
        this.setNodeSize(node, 0, width, height, 0, containerWidth);
    }

    private visitContainerNode(node: FlowNode, topElementWidth: number) {
        let containerLeftWidth = 0;
        let containerRightWidth = 0;
        let containerHeight = 0;
        if (node.branches && node.branches.length > 0) {
            const branch = node.branches.at(0);
            if (branch.viewState) {
                containerLeftWidth = Math.max(containerLeftWidth, Math.max(branch.viewState.clw, NODE_GAP_X));
                containerRightWidth = Math.max(containerRightWidth, Math.max(branch.viewState.crw, NODE_GAP_X));
                containerHeight = branch.viewState.ch;
            }
        }
        // add while node width and height
        containerHeight += topElementWidth + NODE_GAP_Y * 3;
        containerLeftWidth += NODE_GAP_X / 2;
        containerRightWidth += NODE_GAP_X / 2;

        const halfNodeWidth = topElementWidth / 2;
        const nodeHeight = topElementWidth;
        this.setNodeSize(
            node,
            halfNodeWidth,
            halfNodeWidth,
            nodeHeight,
            containerLeftWidth,
            containerRightWidth,
            containerHeight
        );
    }

    endVisitWhile(node: FlowNode, parent?: FlowNode): void {
        this.visitContainerNode(node, WHILE_NODE_WIDTH);
    }

    endVisitForeach(node: FlowNode, parent?: FlowNode): void {
        this.endVisitWhile(node, parent);
    }

    endVisitErrorHandler(node: FlowNode, parent?: FlowNode): void {
        this.visitContainerNode(node, ERROR_HANDLER_NODE_WIDTH);
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
