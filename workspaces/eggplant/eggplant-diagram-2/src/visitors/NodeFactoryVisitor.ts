/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BaseNodeModel } from "../components/nodes/BaseNode/BaseNodeModel";
import { Node } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class NodeFactoryVisitor implements BaseVisitor {
    nodes: BaseNodeModel[] = [];
    private skipChildrenVisit = false;

    constructor() {
        console.log("node factory visitor started");
    }

    private createNode(node: Node): void {
        const diagramNode = new BaseNodeModel(node);
        diagramNode.setPosition(100, node.viewState.y);
        this.nodes.push(diagramNode);
    }

    getNodes(): BaseNodeModel[] {
        return this.nodes;
    }

    endVisitNode = (node: Node): void => this.createNode(node);

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
