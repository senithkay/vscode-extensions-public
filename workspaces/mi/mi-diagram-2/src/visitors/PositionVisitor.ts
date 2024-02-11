/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { STNode, Visitor, Log, WithParam, Call, Callout, Drop, Endpoint, EndpointHttp, Filter, Header, Loopback, PayloadFactory, Property, PropertyGroup, Respond, Send, Sequence, Store, Throttle, Validate, CallTemplate, traversNode, ViewState } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { MEDIATORS, NODE_DIMENSIONS, NODE_GAP } from "../resources/constants";

export class PositionVisitor implements Visitor {
    private position = {
        x: 0,
        y: 40
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

    private setAdvancedMediatorPosition(node: STNode, subSequences: { [x: string]: any; }): void {
        this.setBasicMediatorPosition(node);

        const centerX = node.viewState.x + (node.viewState.w / 2);
        const subSequenceKeys = Object.keys(subSequences);

        // calculate sequence widths
        const sequenceWidths: number[] = [];
        const sequenceTypeOffsets: number[] = [];
        for (const i in subSequences) {
            const subSequence = subSequences[i];
            if (subSequence && subSequence.mediatorList && subSequence.mediatorList.length > 0) {
                const subSequenceMediatorList = subSequence.mediatorList as any as STNode[];
                let subSequenceFullWidth = NODE_DIMENSIONS.DEFAULT.WIDTH;
                let subSequenceOffset = NODE_DIMENSIONS.DEFAULT.WIDTH;
                subSequenceMediatorList.forEach((childNode: STNode) => {
                    if (childNode.viewState) {
                        if (childNode.tag !== MEDIATORS.CALL.toLowerCase()) {
                            subSequenceOffset = Math.max(subSequenceOffset, childNode.viewState.w);
                        }
                        subSequenceFullWidth = Math.max(subSequenceFullWidth, childNode.viewState.fw ?? childNode.viewState.w);
                    }
                });
                sequenceWidths.push(subSequenceFullWidth);
                sequenceTypeOffsets.push(subSequenceOffset / 2);
            }
        }
        const branchesWidth = node.viewState.fw - sequenceTypeOffsets[0] - sequenceTypeOffsets[sequenceTypeOffsets.length - 1];

        this.position.x = centerX - (branchesWidth / 2);
        for (let i = 0; i < subSequenceKeys.length; i++) {
            this.position.y = node.viewState.y + node.viewState.h + NODE_GAP.Y + 40 + NODE_GAP.BRANCH_TOP;
            const subSequence = subSequences[subSequenceKeys[i]];
            if (subSequence && subSequence.mediatorList && subSequence.mediatorList.length > 0) {
                const subSequenceMediatorList = subSequence.mediatorList as any as STNode[];
                let subSequenceWidth = 0;
                subSequenceMediatorList.forEach((childNode: STNode) => {
                    traversNode(childNode, this);
                    if (childNode.viewState) {
                        subSequenceWidth = Math.max(subSequenceWidth, childNode.viewState.fw ?? childNode.viewState.w);
                    }
                });
                this.position.x += subSequenceWidth + NODE_GAP.BRANCH_X;
            }
        }

        // set filter node positions after traversing children
        this.position.x = node.viewState.x + node.viewState.w / 2;
        this.position.y += NODE_GAP.Y + node.viewState.fh;
        this.skipChildrenVisit = true;
    }

    private setSkipChildrenVisit(status: boolean): void {
        this.skipChildrenVisit = status;
    }

    beginVisitCall = (node: Call): void => this.setBasicMediatorPosition(node);
    beginVisitCallout = (node: Callout): void => this.setBasicMediatorPosition(node);
    beginVisitDrop = (node: Drop): void => this.setBasicMediatorPosition(node);
    beginVisitEndpoint = (node: Endpoint): void => this.setBasicMediatorPosition(node);
    beginVisitEndpointHttp = (node: EndpointHttp): void => this.setBasicMediatorPosition(node);

    beginVisitFilter = (node: Filter): void => {
        this.setAdvancedMediatorPosition(node, {
            then: node.then,
            else: node.else_
        });
    }
    endVisitFilter = (node: Filter): void => this.setSkipChildrenVisit(false);

    beginVisitHeader = (node: Header): void => this.setBasicMediatorPosition(node);

    beginVisitInSequence = (node: Sequence): void => {
        this.setBasicMediatorPosition(node);
    }
    endVisitInSequence = (node: Sequence): void => {
        this.position.y += NODE_GAP.Y + node.viewState.h;
    }

    beginVisitOutSequence = (node: Sequence): void => {
        this.setBasicMediatorPosition(node);
    }
    endVisitOutSequence = (node: Sequence): void => {
        this.position.y += NODE_GAP.Y + node.viewState.h;
    }

    beginVisitLog = (node: Log): void => {
        this.setBasicMediatorPosition(node);
        this.skipChildrenVisit = true;
    }
    endVisitLog = (node: Log): void => {
        this.skipChildrenVisit = false;
    }

    beginVisitLoopback = (node: Loopback): void => this.setBasicMediatorPosition(node);
    beginVisitPayloadFactory = (node: PayloadFactory): void => this.setBasicMediatorPosition(node);
    beginVisitProperty = (node: Property): void => this.setBasicMediatorPosition(node);
    beginVisitPropertyGroup = (node: PropertyGroup): void => this.setBasicMediatorPosition(node);
    beginVisitRespond = (node: Respond): void => this.setBasicMediatorPosition(node);
    beginVisitSend = (node: Send): void => this.setBasicMediatorPosition(node);
    beginVisitSequence = (node: Sequence): void => this.setBasicMediatorPosition(node);
    beginVisitStore = (node: Store): void => this.setBasicMediatorPosition(node);

    beginVisitThrottle = (node: Throttle): void => {
        this.setAdvancedMediatorPosition(node, {
            onAccept: node.onAccept,
            onReject: node.onReject
        });
    }
    endVisitThrottle = (node: Throttle): void => this.setSkipChildrenVisit(false);

    beginVisitValidate = (node: Validate): void => {
        this.setAdvancedMediatorPosition(node, {
            onFail: node.onFail
        });
    }
    endVisitValidate = (node: Validate): void => this.setSkipChildrenVisit(false);

    beginVisitWithParam = (node: WithParam): void => this.setBasicMediatorPosition(node);
    beginVisitCallTemplate = (node: CallTemplate): void => this.setBasicMediatorPosition(node);

}
