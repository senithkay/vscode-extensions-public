/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { STNode, Visitor, Resource, Sequence } from "@wso2-enterprise/mi-syntax-tree/src";

export class NodeVisitor implements Visitor {
    private nodes: STNode[] = [];
    private skipChildrenVisit = false;

    constructor() {
        console.log("NodeVisitor");
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    beginVisitResource(node: Resource): void {
        console.log("beginVisitResource", node);
    }

    beginVisitInSequence(node: Sequence): void {
        console.log("beginVisitInSequence", node);
    }

    endVisitInSequence(): void {
        console.log("endVisitInSequence");
    }

    beginVisitOutSequence(node: Sequence): void {
        console.log("beginVisitOutSequence", node);
    }

    endVisitOutSequence(): void {
        console.log("endVisitOutSequence");
    }

    getNodes() {
        return this.nodes;
    }
}
