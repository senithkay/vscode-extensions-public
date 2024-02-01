/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { STNode, Visitor, Log, WithParam, Call, Callout, Drop, Endpoint, EndpointHttp, Filter, Header, Loopback, PayloadFactory, Property, PropertyGroup, Respond, Send, Sequence, Store, Throttle, Validate, CallTemplate, traversNode, ViewState } from "@wso2-enterprise/mi-syntax-tree/src";
import { NODE_GAP } from "./Constants";

export class PositionVisitor implements Visitor {
    private position = {
        x: 0,
        y: 0
    };
    private nodes: STNode[] = [];
    private skipChildrenVisit = false;

    constructor(sequenceWidth: number) {
        console.log("PositionVisitor");
        this.position.x += sequenceWidth / 2;
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    private setBasicMediatorPosition(node: STNode): void {
        const defaultViewState: ViewState = { x: 0, y: 0, w: 0, h: 0 };
        if (node.viewState == undefined) {
            node.viewState = defaultViewState;
        }
        node.viewState.x = this.position.x - (node.viewState.w / 2);
        node.viewState.y = this.position.y;
        this.position.y += NODE_GAP.Y + node.viewState.h;
    }

    private setAdvancedMediatorPosition(node: STNode): void {
        // if (this.skipChildrenVisit) return;

        if (node.viewState == undefined) {
            node.viewState = { x: 0, y: 0, w: 0, h: 0 };
        }
        node.viewState.x = this.position.x - (node.viewState.w / 2);
        node.viewState.y = this.position.y;
        this.position.y += NODE_GAP.Y + node.viewState.h;
    }

    beginVisitCall = (node: Call): void => this.setBasicMediatorPosition(node);
    beginVisitCallout = (node: Callout): void => this.setBasicMediatorPosition(node);
    beginVisitDrop = (node: Drop): void => this.setBasicMediatorPosition(node);
    beginVisitEndpoint = (node: Endpoint): void => this.setBasicMediatorPosition(node);
    beginVisitEndpointHttp = (node: EndpointHttp): void => this.setBasicMediatorPosition(node);

    beginVisitFilter(node: Filter): void {
        this.setAdvancedMediatorPosition(node);
        let branchX = 0;
        let branchY = this.position.y;

        this.position.x = node.viewState.x - node.viewState.w/ 2;
        if (node.then) {
            const thenMediatorList = node.then.mediatorList as any as STNode[];
            let thenMediatorsWidth = 0;
            thenMediatorList.forEach((childNode: STNode) => {
                traversNode(childNode, this);
                if (childNode.viewState) {
                    thenMediatorsWidth = Math.max(thenMediatorsWidth, childNode.viewState.w);
                }
            });
            branchX = thenMediatorsWidth;
            branchY = Math.max(branchY, thenMediatorList[thenMediatorList.length - 1].viewState.y + thenMediatorList[thenMediatorList.length - 1].viewState.h);
        }
        this.position.x += NODE_GAP.BRANCH_X + branchX;
        this.position.y = node.viewState.y + node.viewState.h + NODE_GAP.Y;

        if (node.else_) {
            const elseMediatorList = node.else_.mediatorList as any as STNode[];
            elseMediatorList.forEach((childNode: STNode) => {
                traversNode(childNode, this);
            });
            branchY = Math.max(branchY, elseMediatorList[elseMediatorList.length - 1].viewState.y + elseMediatorList[elseMediatorList.length - 1].viewState.h);
        }

        // set filter node positions after traversing children
        this.position.x = node.viewState.x + node.viewState.w / 2;
        this.position.y = branchY + NODE_GAP.Y;
        this.skipChildrenVisit = true;
    }
    endVisitFilter(node: Filter): void {
        this.skipChildrenVisit = false;
    }

    beginVisitHeader = (node: Header): void => this.setBasicMediatorPosition(node);
    beginVisitLog = (node: Log): void => this.setBasicMediatorPosition(node);
    beginVisitLoopback = (node: Loopback): void => this.setBasicMediatorPosition(node);
    beginVisitPayloadFactory = (node: PayloadFactory): void => this.setBasicMediatorPosition(node);
    beginVisitProperty = (node: Property): void => this.setBasicMediatorPosition(node);
    beginVisitPropertyGroup = (node: PropertyGroup): void => this.setBasicMediatorPosition(node);
    beginVisitRespond = (node: Respond): void => this.setBasicMediatorPosition(node);
    beginVisitSend = (node: Send): void => this.setBasicMediatorPosition(node);
    beginVisitSequence = (node: Sequence): void => this.setBasicMediatorPosition(node);
    beginVisitStore = (node: Store): void => this.setBasicMediatorPosition(node);
    beginVisitThrottle = (node: Throttle): void => this.setAdvancedMediatorPosition(node);
    beginVisitValidate = (node: Validate): void => this.setAdvancedMediatorPosition(node);
    beginVisitWithParam = (node: WithParam): void => this.setBasicMediatorPosition(node);
    beginVisitCallTemplate = (node: CallTemplate): void => this.setBasicMediatorPosition(node);

}
