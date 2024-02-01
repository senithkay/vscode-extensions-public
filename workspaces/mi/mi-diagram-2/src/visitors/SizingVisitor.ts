/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Call, CallTemplate, Callout, Drop, Endpoint, EndpointHttp, Filter, Header, Log, Loopback, PayloadFactory, Property, PropertyGroup, Respond, STNode, Send, Sequence, Store, Throttle, Validate, Visitor, WithParam } from "@wso2-enterprise/mi-syntax-tree/src";
import { NODE_GAP, NODE_HEIGHT, NODE_WIDTH, START_NODE_WIDTH } from "./Constants";

export class SizingVisitor implements Visitor {
    private skipChildrenVisit = false;
    private sequenceWidth = 0;

    constructor() {
        console.log("SizingVisitor");
    }

    calculateBasicMediator = (node: STNode): void => {
        if (node.viewState == undefined) {
            node.viewState = { x: 0, y: 0, w: 0, h: 0 }
        }
        node.viewState.w = NODE_WIDTH;
        node.viewState.h = NODE_HEIGHT;
        this.sequenceWidth = Math.max(this.sequenceWidth, node.viewState.w);
    }

    calculateAdvancedMediator = (node: STNode, subSequencesWidth: number = 0): void => {
        if (node.viewState == undefined) {
            node.viewState = { x: 0, y: 0, w: 0, h: 0 }
        }
        node.viewState.w = NODE_WIDTH;
        node.viewState.fw = Math.max(NODE_WIDTH, subSequencesWidth);
        node.viewState.h = NODE_HEIGHT;
        this.sequenceWidth = Math.max(this.sequenceWidth, node.viewState.fw);
    }

    getSequenceWidth(): number {
        return this.sequenceWidth;
    }

    // visitors
    endVisitCall = (node: Call): void => this.calculateBasicMediator(node);
    endVisitCallout = (node: Callout): void => this.calculateBasicMediator(node);
    endVisitDrop = (node: Drop): void => this.calculateBasicMediator(node);
    endVisitEndpoint = (node: Endpoint): void => this.calculateBasicMediator(node);
    endVisitEndpointHttp = (node: EndpointHttp): void => this.calculateBasicMediator(node);

    endVisitFilter(node: Filter): void {
        let thenMediatorsWidth = 0;
        let elseMediatorsWidth = 0;
        if (node.then) {
            const thenMediatorList = node.then.mediatorList as any as STNode[];
            thenMediatorList.forEach((mediator) => {
                if (mediator.viewState) {
                    thenMediatorsWidth = Math.max(thenMediatorsWidth, mediator.viewState.w);
                }
            }
            );
        }
        if (node.else_) {
            const elseMediatorList = node.else_.mediatorList as any as STNode[];
            elseMediatorList.forEach((mediator) => {
                if (mediator.viewState) {
                    elseMediatorsWidth = Math.max(elseMediatorsWidth, mediator.viewState.w);
                }
            }
            );
        }
        this.calculateAdvancedMediator(node, thenMediatorsWidth + NODE_GAP.BRANCH_X + elseMediatorsWidth);
    }

    endVisitHeader = (node: Header): void => this.calculateBasicMediator(node);
    endVisitInSequence = (node: Sequence): void => {
        node.viewState = { x: 0, y: 0, w: START_NODE_WIDTH, h: 0 };
    }
    endVisitLog = (node: Log): void => this.calculateBasicMediator(node);
    endVisitLoopback = (node: Loopback): void => this.calculateBasicMediator(node);
    endVisitPayloadFactory = (node: PayloadFactory): void => this.calculateBasicMediator(node);
    endVisitProperty = (node: Property): void => this.calculateBasicMediator(node);
    endVisitPropertyGroup = (node: PropertyGroup): void => this.calculateBasicMediator(node);
    endVisitRespond = (node: Respond): void => this.calculateBasicMediator(node);
    endVisitSend = (node: Send): void => this.calculateBasicMediator(node);
    endVisitSequence = (node: Sequence): void => this.calculateBasicMediator(node);
    endVisitStore = (node: Store): void => this.calculateBasicMediator(node);
    endVisitThrottle = (node: Throttle): void => this.calculateAdvancedMediator(node);
    endVisitValidate = (node: Validate): void => this.calculateAdvancedMediator(node);
    endVisitWithParam = (node: WithParam): void => this.calculateBasicMediator(node);
    endVisitCallTemplate = (node: CallTemplate): void => this.calculateBasicMediator(node);
    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
