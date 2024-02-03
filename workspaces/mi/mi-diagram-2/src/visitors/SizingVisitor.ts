/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Call, CallTemplate, Callout, Drop, Endpoint, EndpointHttp, Filter, Header, Log, Loopback, PayloadFactory, Property, PropertyGroup, Respond, STNode, Send, Sequence, Store, Throttle, Validate, Visitor, WithParam } from "@wso2-enterprise/mi-syntax-tree/src";
import { NODE_WIDTH, NODE_HEIGHT, NODE_GAP, CONDITION_NODE_WIDTH, CALL_NODE_WIDTH, START_NODE_WIDTH } from "../resources/constants";

export class SizingVisitor implements Visitor {
    private skipChildrenVisit = false;
    private sequenceWidth = 0;

    constructor() {
        console.log("SizingVisitor");
    }

    calculateBasicMediator = (node: STNode): void => {
        if (node.viewState == undefined) {
            node.viewState = { x: 0, y: 0, w: NODE_WIDTH, h: NODE_HEIGHT }
        }
        this.sequenceWidth = Math.max(this.sequenceWidth, node.viewState.w);
    }

    calculateAdvancedMediator = (node: STNode, subSequences: { [x: string]: any; }): void => {
        let subSequencesWidth = 0;
        let subSequencesHeight = 0;
        for (let i = 0; i < Object.keys(subSequences).length; i++) {
            const subSequence = subSequences[Object.keys(subSequences)[i]];
            if (subSequence && subSequence.mediatorList && subSequence.mediatorList.length > 0) {
                const subSequenceMediatorList = subSequence.mediatorList as any as STNode[];
                let subSequenceWidth = NODE_WIDTH;
                subSequenceMediatorList.forEach((childNode: STNode) => {
                    if (childNode.viewState) {
                        subSequenceWidth = Math.max(subSequenceWidth, childNode.viewState.fw ?? childNode.viewState.w);
                    }
                });
                subSequencesWidth += subSequenceWidth + (i === Object.keys(subSequences).length - 1 ? 0 : NODE_GAP.BRANCH_X);
                subSequencesHeight = Math.max(subSequencesHeight,
                    (subSequenceMediatorList[subSequenceMediatorList.length - 1].viewState.y + subSequenceMediatorList[subSequenceMediatorList.length - 1].viewState.h) -
                    (subSequenceMediatorList[0].viewState.y + subSequenceMediatorList[0].viewState.h) + NODE_GAP.BRANCH_Y);
            }
        }

        node.viewState = { x: 0, y: 0, w: CONDITION_NODE_WIDTH, h: NODE_HEIGHT, fw: subSequencesWidth, fh: subSequencesHeight };

        this.sequenceWidth = Math.max(this.sequenceWidth, node.viewState.fw);
    }

    getSequenceWidth(): number {
        return this.sequenceWidth;
    }

    // visitors
    endVisitCall = (node: Call): void => {
        if (node.endpoint) {
            node.viewState = { x: 0, y: 0, w: NODE_WIDTH, fw: CALL_NODE_WIDTH, h: 0 };
        }
        this.calculateBasicMediator(node);
    }
    endVisitCallout = (node: Callout): void => this.calculateBasicMediator(node);
    endVisitDrop = (node: Drop): void => this.calculateBasicMediator(node);
    endVisitEndpoint = (node: Endpoint): void => this.calculateBasicMediator(node);
    endVisitEndpointHttp = (node: EndpointHttp): void => this.calculateBasicMediator(node);

    endVisitFilter = (node: Filter): void => {
        this.calculateAdvancedMediator(node, {
            then: node.then,
            else: node.else_
        });
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

    endVisitThrottle = (node: Throttle): void => this.calculateAdvancedMediator(node, {
        onAccept: node.onAccept,
        onReject: node.onReject
    });

    endVisitValidate = (node: Validate): void => this.calculateAdvancedMediator(node, {
        onFail: node.onFail
    });

    endVisitWithParam = (node: WithParam): void => this.calculateBasicMediator(node);
    endVisitCallTemplate = (node: CallTemplate): void => this.calculateBasicMediator(node);
    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
