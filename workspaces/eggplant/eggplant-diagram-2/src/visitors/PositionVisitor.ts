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
    
}
