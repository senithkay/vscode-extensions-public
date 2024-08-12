/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Flow, FlowNode } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";
import { isEqual } from "lodash";

export class FindParentVisitor implements BaseVisitor {
    private skipChildrenVisit = false;
    private flow: Flow;
    private flowNode: FlowNode;
    private parentNode: FlowNode;

    constructor(model: Flow, flowNode: FlowNode) {
        console.log(">>> find parent visitor started", { flowNode });
        this.flow = model;
        this.flowNode = flowNode;
    }

    beginVisitNode(node: FlowNode, parent?: FlowNode): void {
        if (isEqual(node.codedata, this.flowNode.codedata)) {
            this.skipChildrenVisit = true;
            if (!parent) {
                console.log(">>> parent is undefined", { node, searchNode: this.flowNode });
                return;
            }
            this.parentNode = parent;
        }
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    getParentNode(): FlowNode {
        return this.parentNode;
    }
}
