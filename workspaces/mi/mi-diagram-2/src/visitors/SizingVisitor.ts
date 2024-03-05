/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Call, CallTemplate, Callout, Drop, Endpoint, EndpointHttp, Filter, Header, Log, Loopback, PayloadFactory, Property, PropertyGroup, Range, Respond, STNode, Send, Sequence, Store, TagRange, Throttle, Validate, Visitor, WithParam } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { NODE_DIMENSIONS, NODE_GAP } from "../resources/constants";
import { LINK_BOTTOM_OFFSET } from "../components/NodeLink/NodeLinkModel";
import { Diagnostic } from "vscode-languageserver-types";

export class SizingVisitor implements Visitor {
    private skipChildrenVisit = false;
    private sequenceWidth = 0;
    private diagnostic: Diagnostic[];

    constructor(diagnostic: Diagnostic[]) {
        this.diagnostic = diagnostic;
    }

    calculateBasicMediator = (node: STNode): void => {
        if (node.viewState == undefined) {
            node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.DEFAULT.WIDTH, h: NODE_DIMENSIONS.DEFAULT.HEIGHT }
        }
        this.sequenceWidth = Math.max(this.sequenceWidth, node.viewState.w);
        this.addDiagnostics(node);
    }

    calculateAdvancedMediator = (node: STNode, subSequences: { [x: string]: any; }): void => {
        if (node.viewState == undefined) {
            node.viewState = { x: 0, y: 0, w: 0, h: 0, fw: 0, fh: 0 }
        }

        let subSequencesWidth = 0;
        let subSequencesHeight = 10;
        for (let i = 0; i < Object.keys(subSequences).length; i++) {
            const subSequence = subSequences[Object.keys(subSequences)[i]];
            if (subSequence) {
                if (subSequence.mediatorList && subSequence.mediatorList.length > 0) {
                    const subSequenceMediatorList = subSequence.mediatorList as any as STNode[];
                    let subSequenceWidth = NODE_DIMENSIONS.DEFAULT.WIDTH;
                    let subSequenceHeight = 0;
                    subSequenceMediatorList.forEach((childNode: STNode) => {
                        if (childNode.viewState) {
                            subSequenceWidth = Math.max(subSequenceWidth, childNode.viewState.fw ?? childNode.viewState.w);
                            subSequenceHeight += (childNode.viewState.fh || childNode.viewState.h);
                        }
                    });
                    subSequencesWidth += subSequenceWidth + (i === Object.keys(subSequences).length - 1 ? 0 : NODE_GAP.BRANCH_X);
                    subSequencesHeight = Math.max(subSequencesHeight, subSequenceHeight);
                } else {
                    subSequence.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.EMPTY.WIDTH, h: NODE_DIMENSIONS.EMPTY.HEIGHT };
                    subSequencesWidth += NODE_DIMENSIONS.EMPTY.WIDTH + (i === Object.keys(subSequences).length - 1 ? 0 : NODE_GAP.BRANCH_X);
                }
                this.addDiagnostics(subSequence);
            }
        }

        node.viewState.fw = subSequencesWidth;
        node.viewState.fh = NODE_DIMENSIONS.CONDITION.HEIGHT + NODE_GAP.BRANCH_TOP + subSequencesHeight + NODE_GAP.BRANCH_BOTTOM;

        this.sequenceWidth = Math.max(this.sequenceWidth, node.viewState.fw);

        node.viewState.w = NODE_DIMENSIONS.CONDITION.WIDTH;
        node.viewState.h = NODE_DIMENSIONS.CONDITION.HEIGHT;

        this.addDiagnostics(node);
    }

    addDiagnostics(node: STNode) {
        for (const diagnostic of this.diagnostic) {
            // if diagnostic is in the range of the node
            if (this.isInRange(node.range, diagnostic.range)) {
                if (node.diagnostics == undefined) {
                    node.diagnostics = [];
                }
                node.diagnostics.push(diagnostic);
            }
        }
        // remove the diagnostics from the global list
        this.diagnostic = this.diagnostic.filter(d => !node.diagnostics?.includes(d));
    }

    isInRange(nodeRange: TagRange, diagnosticRange: Range) {
        if (!nodeRange?.startTagRange?.start || !nodeRange?.startTagRange?.end || !diagnosticRange?.start) {
            return false;
        }
        const isMatchStart = (diagnosticRange.start.line === nodeRange.startTagRange.start.line &&
            diagnosticRange.start.character >= nodeRange.startTagRange.start.character) ||
            diagnosticRange.start.line > nodeRange.startTagRange.start.line;

        let isMatchEnd;
        if (nodeRange.endTagRange && nodeRange.endTagRange.start && nodeRange.endTagRange.end) {
            isMatchEnd = (diagnosticRange.end.line === nodeRange.endTagRange.end.line &&
                diagnosticRange.end.character <= nodeRange.endTagRange.end.character) ||
                diagnosticRange.end.line < nodeRange.endTagRange.end.line;
        }
        else {
            isMatchEnd = (diagnosticRange.end.line === nodeRange.startTagRange.end.line &&
                diagnosticRange.end.character <= nodeRange.startTagRange.end.character) ||
                diagnosticRange.end.line < nodeRange.startTagRange.end.line;
        }
        return isMatchStart && isMatchEnd;
    }

    getSequenceWidth(): number {
        return this.sequenceWidth;
    }

    // visitors
    beginVisitCall = (node: Call): void => { this.skipChildrenVisit = true; }
    endVisitCall = (node: Call): void => {
        if (node.endpoint) {
            this.addDiagnostics(node.endpoint);
        }
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.CALL.WIDTH, fw: NODE_DIMENSIONS.CALL.FULL_WIDTH, h: NODE_DIMENSIONS.DEFAULT.HEIGHT, l: NODE_DIMENSIONS.CALL.WIDTH / 2, r: NODE_DIMENSIONS.CALL.FULL_WIDTH - NODE_DIMENSIONS.CALL.WIDTH / 2 };
        this.calculateBasicMediator(node);
        this.skipChildrenVisit = false;
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
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.START.WIDTH, h: NODE_DIMENSIONS.START.HEIGHT };
    }

    endVisitOutSequence = (node: Sequence): void => {
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.START.WIDTH, h: NODE_DIMENSIONS.START.HEIGHT };
    }

    endVisitFaultSequence = (node: Sequence): void => {
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.START.WIDTH, h: NODE_DIMENSIONS.START.HEIGHT };
    }

    beginVisitLog = (node: Log): void => {
        this.skipChildrenVisit = true;
    }
    endVisitLog = (node: Log): void => {
        this.calculateBasicMediator(node);
        this.skipChildrenVisit = false;
    }

    endVisitLoopback = (node: Loopback): void => this.calculateBasicMediator(node);
    endVisitPayloadFactory = (node: PayloadFactory): void => this.calculateBasicMediator(node);
    endVisitProperty = (node: Property): void => this.calculateBasicMediator(node);
    endVisitPropertyGroup = (node: PropertyGroup): void => this.calculateBasicMediator(node);
    endVisitRespond = (node: Respond): void => this.calculateBasicMediator(node);
    endVisitSend = (node: Send): void => this.calculateBasicMediator(node);

    endVisitSequence = (node: Sequence): void => {
        const isSequnce = node.mediatorList && node.mediatorList.length > 0;

        if (isSequnce) {
            node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.START.WIDTH, h: NODE_DIMENSIONS.START.HEIGHT };
        } else {
            this.calculateBasicMediator(node);
        }
    }

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
