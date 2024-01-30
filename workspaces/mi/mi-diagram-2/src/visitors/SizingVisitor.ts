/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { STNode, Visitor, WithParam } from "@wso2-enterprise/mi-syntax-tree/src";

export const NODE_WIDTH = 100;
export const NODE_HEIGHT = 50;

const calculateBasicMediator = (node: STNode): void => {
    if (node.viewState == undefined) {
        node.viewState = { x: 0, y: 0, w: 0, h: 0 }
    }
    node.viewState.w = NODE_WIDTH;
    node.viewState.h = NODE_HEIGHT;
}

export class SizingVisitor implements Visitor {
    private nodes: STNode[] = [];
    private skipChildrenVisit = false;

    constructor() {
        console.log("SizingVisitor");
    }

    endVisitSend = (node: STNode): void => calculateBasicMediator(node);
    endVisitWithParam = (node: WithParam): void => calculateBasicMediator(node);
    endVisitCall = (node: STNode): void => calculateBasicMediator(node);

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    // beginVisitResource(node: Resource): void {
    //     console.log("beginVisitResource", node);
    // }

    // endVisitResource(): void {
    //     console.log("endVisitResource");
    // }

    // beginVisitInSequence(node: Sequence): void {
    //     console.log("beginVisitInSequence", node);
    // }

    // endVisitInSequence(): void {
    //     console.log("endVisitInSequence");
    // }

    // beginVisitOutSequence(node: Sequence): void {
    //     console.log("beginVisitOutSequence", node);
    // }

    // endVisitOutSequence(): void {
    //     console.log("endVisitOutSequence");
    // }
}
