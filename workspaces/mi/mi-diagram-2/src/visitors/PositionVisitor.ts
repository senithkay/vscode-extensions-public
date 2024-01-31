/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { STNode, Visitor, APIResource, ViewState } from "@wso2-enterprise/mi-syntax-tree/src";

export const NODE_GAP = 100;

export class PositionVisitor implements Visitor {
    private nodes: STNode[] = [];
    private skipChildrenVisit = false;

    constructor() {
        console.log("PositionVisitor");
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    beginVisitAPIResource(node: APIResource): void {
        console.log("beginVisitAPIResource", node);
        const defaultViewState: ViewState = { x: 0, y: 0, w: 0, h: 0 };
        if (node.viewState == undefined) {
            node.viewState = defaultViewState;
        }
        let y = node.viewState.y;
        node.inSequence.mediatorList.forEach((element) => {
            if (element.viewState == undefined) {
                element.viewState = defaultViewState;
            }
            element.viewState.x = 100;
            element.viewState.y = 100 + y;
            y = NODE_GAP + element.viewState.h;
        });
    }

    // beginVisitResource(node: Resource): void {
    //     console.log("beginVisitResource", node);
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
