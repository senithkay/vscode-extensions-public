/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { STNode, Visitor, Log, WithParam, Call, Callout, Drop, Endpoint, EndpointHttp, Filter, Header, Loopback, PayloadFactory, Property, PropertyGroup, Respond, Send, Sequence, Store, Throttle, Validate, CallTemplate, traversNode, ViewState } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { NODE_DIMENSIONS, NODE_GAP } from "../resources/constants";

export class PositionVisitor implements Visitor {
    private position = {
        x: 0,
        y: 40
    };
    private skipChildrenVisit = false;

    constructor(sequenceWidth: number) {
        console.log("PositionVisitor");
        this.position.x += sequenceWidth / 2;
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    getSequenceHeight(): number {
        return this.position.y;
    }

    private setBasicMediatorPosition(node: STNode): void {
        const defaultViewState: ViewState = { x: 0, y: 0, w: 0, h: 0 };
        if (node.viewState == undefined) {
            node.viewState = defaultViewState;
        }
        node.viewState.x = this.position.x - (node.viewState.w / 2);
        node.viewState.y = this.position.y;
        this.position.y += NODE_GAP.Y + Math.max(node.viewState.h, node.viewState.fh || 0);
    }

    private setAdvancedMediatorPosition(node: STNode, subSequences: { [x: string]: any; }): void {
        this.setBasicMediatorPosition(node);

        const centerX = node.viewState.x + (node.viewState.w / 2);
        const subSequenceKeys = Object.keys(subSequences);

        // calculate sequence widths
        const sequenceWidths: number[] = [];
        const sequenceTypeOffsets: { l: number; r: number }[] = [];
        for (const i in subSequences) {
            const subSequence = subSequences[i];
            if (subSequence) {
                if (subSequence.mediatorList && subSequence.mediatorList.length > 0) {
                    const subSequenceMediatorList = subSequence.mediatorList as any as STNode[];
                    let subSequenceFullWidth = NODE_DIMENSIONS.DEFAULT.WIDTH;
                    let subSequenceOffsetL = NODE_DIMENSIONS.DEFAULT.WIDTH / 2;
                    let subSequenceOffsetR = NODE_DIMENSIONS.DEFAULT.WIDTH / 2;
                    subSequenceMediatorList.forEach((childNode: STNode) => {
                        if (childNode.viewState) {
                            subSequenceOffsetL = Math.max(subSequenceOffsetL, childNode.viewState.l ?? childNode.viewState.w / 2);
                            subSequenceOffsetR = Math.max(subSequenceOffsetR, childNode.viewState.r ?? childNode.viewState.w / 2);

                            subSequenceFullWidth = Math.max(subSequenceFullWidth, childNode.viewState.fw ?? childNode.viewState.w);
                        }
                    });
                    sequenceWidths.push(subSequenceFullWidth);
                    sequenceTypeOffsets.push({ l: subSequenceOffsetL, r: subSequenceOffsetR });
                } else {
                    sequenceWidths.push(NODE_DIMENSIONS.EMPTY.WIDTH);
                    sequenceTypeOffsets.push({ l: NODE_DIMENSIONS.EMPTY.WIDTH / 2, r: NODE_DIMENSIONS.EMPTY.WIDTH / 2 });
                }
            }
        }
        const sequenceOffsets = sequenceTypeOffsets.length > 0 ? sequenceTypeOffsets[0].l + sequenceTypeOffsets[sequenceTypeOffsets.length - 1].r : 0;
        const branchesWidth = node.viewState.fw - sequenceOffsets;

        this.position.x = centerX - (branchesWidth / 2);
        for (let i = 0; i < subSequenceKeys.length; i++) {
            this.position.y = node.viewState.y + node.viewState.h + NODE_GAP.BRANCH_TOP;
            const subSequence = subSequences[subSequenceKeys[i]];

            if (subSequence) {
                this.position.x += i > 0 ? sequenceTypeOffsets[i].l : 0;
                if (subSequence.mediatorList && subSequence.mediatorList.length > 0) {
                    traversNode(subSequence, this);
                } else {
                    this.setBasicMediatorPosition(subSequence);
                }
                this.position.x += sequenceTypeOffsets[i].r + NODE_GAP.BRANCH_X;
            }
        }

        // set filter node positions after traversing children
        this.position.x = node.viewState.x + node.viewState.w / 2;
        this.position.y = node.viewState.y + node.viewState.fh + NODE_GAP.Y;
        this.skipChildrenVisit = true;
    }

    private setSkipChildrenVisit(status: boolean): void {
        this.skipChildrenVisit = status;
    }

    beginVisitCall = (node: Call): void => {
        this.setBasicMediatorPosition(node);
        this.setSkipChildrenVisit(true);
    }
    endVisitCall = (node: Call): void => this.setSkipChildrenVisit(false);

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

    beginVisitInSequence = (node: Sequence): void => this.setBasicMediatorPosition(node);
    endVisitInSequence = (node: Sequence): void => {
        node.viewState.fh = this.position.y - node.viewState.y;
        this.position.y += NODE_GAP.SEQUENCE_Y + node.viewState.h;
    }

    beginVisitOutSequence = (node: Sequence): void => this.setBasicMediatorPosition(node);
    endVisitOutSequence = (node: Sequence): void => {
        this.position.y += NODE_GAP.Y + node.viewState.h;
    }

    beginVisitFaultSequence = (node: Sequence): void => {
        this.setBasicMediatorPosition(node);
    }
    endVisitFaultSequence = (node: Sequence): void => {
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
