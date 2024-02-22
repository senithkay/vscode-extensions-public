/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NODE_HEIGHT, NODE_WIDTH } from "../resources/constants";
import { Node } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class SizingVisitor implements BaseVisitor {
    private nodes: Node[] = [];
    private skipChildrenVisit = false;

    constructor() {
        console.log("sizing visitor started");
    }

    createBaseNode(node: Node): void {
        if (node.viewState == undefined) {
            node.viewState = { x: 0, y: 0, w: 0, h: 0 };
        }
        node.viewState.w = NODE_WIDTH;
        node.viewState.h = NODE_HEIGHT;
        this.nodes.push(node);
    }

    endVisitNode = (node: Node): void => this.createBaseNode(node);

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
