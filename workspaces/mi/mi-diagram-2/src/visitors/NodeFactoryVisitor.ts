/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Visitor, STNode, WithParam } from "@wso2-enterprise/mi-syntax-tree/src";
import { CallNodeModel } from "../components/nodes/CallNode/CallNodeModel";

export class NodeFactoryVisitor implements Visitor {
    nodes: CallNodeModel[] = [];
    private skipChildrenVisit = false;

    private createNode(node: STNode): void {
        const diagramNode = new CallNodeModel(node);
        diagramNode.setPosition(100, node.viewState.y);
        this.nodes.push(diagramNode);
    }

    getNodes(): CallNodeModel[] {
        return this.nodes;
    }

    endVisitSend = (node: STNode): void => this.createNode(node);
    endVisitWithParam = (node: WithParam): void => this.createNode(node);

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
