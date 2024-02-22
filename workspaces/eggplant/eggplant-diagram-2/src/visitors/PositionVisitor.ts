/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NODE_GAP } from "../resources/constants";
import { Node, ViewState } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class PositionVisitor implements BaseVisitor {
    private nodes: Node[] = [];
    private skipChildrenVisit = false;

    constructor() {
        console.log("position visitor started");
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    beginVisitNode(node: Node, parent: Node): void {
        const defaultViewState: ViewState = { x: 0, y: 0, w: 0, h: 0 };
        if (node.viewState == undefined) {
            node.viewState = defaultViewState;
        }
        if (parent && parent.viewState && parent.viewState.y > 0) {
            node.viewState.y = parent.viewState.y + NODE_GAP;
        }
        this.nodes.push(node);
    }
}
