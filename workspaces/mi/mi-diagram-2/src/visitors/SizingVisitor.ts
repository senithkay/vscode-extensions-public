/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */


import { Bean, Call, CallTemplate, Callout, Class, Drop, Ejb, Endpoint, EndpointHttp, Filter, Header, Log, Loopback, PayloadFactory, PojoCommand, Property, PropertyGroup, Respond, STNode, Script, Send, Sequence, Spring, Store, TagRange,Range, Throttle, Validate, Visitor, Enqueue, Transaction, Event, DataServiceCall, Clone, Cache } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { NODE_DIMENSIONS, NODE_GAP } from "../resources/constants";
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
        const subSequenceKeys = Object.keys(subSequences);
        for (let i = 0; i < subSequenceKeys.length; i++) {
            const subSequence = subSequences[subSequenceKeys[i]];
            if (subSequence) {
                let subSequenceWidth = NODE_DIMENSIONS.EMPTY.BRANCH.WIDTH;
                let subSequenceHeight = NODE_DIMENSIONS.EMPTY.HEIGHT;
                let subSequenceL = 0;
                let subSequenceR = 0;
                if (subSequence.mediatorList && subSequence.mediatorList.length > 0) {
                    const subSequenceMediatorList = subSequence.mediatorList as any as STNode[];
                    subSequenceMediatorList.forEach((childNode: STNode) => {
                        if (childNode.viewState) {
                            subSequenceWidth = Math.max(subSequenceWidth, childNode.viewState.fw ?? childNode.viewState.w);
                            subSequenceHeight += (childNode.viewState.fh || childNode.viewState.h);

                            if (childNode.viewState.l) {
                                subSequenceL = Math.max(subSequenceL, childNode.viewState.l);
                            }
                            if (childNode.viewState.r) {
                                subSequenceR = Math.max(subSequenceR, childNode.viewState.r);
                            }
                        }
                    });
                    subSequenceL = Math.max(subSequenceL, subSequenceWidth / 2);
                    subSequenceR = Math.max(subSequenceR, subSequenceWidth / 2);
                } else {
                    subSequenceL = NODE_DIMENSIONS.EMPTY.BRANCH.WIDTH / 2;
                    subSequenceR = NODE_DIMENSIONS.EMPTY.BRANCH.WIDTH / 2;

                }
                subSequencesHeight = Math.max(subSequencesHeight, subSequenceHeight);
                subSequencesWidth = Math.max(subSequencesWidth, subSequenceWidth);
                subSequence.viewState = { x: 0, y: 0, w: subSequenceWidth, h: subSequenceHeight, l: subSequenceL, r: subSequenceR };
                this.addDiagnostics(subSequence);
            }
        }

        let totalWidth = 0;
        // make widths equal
        for (let i = 0; i < Object.keys(subSequences).length; i++) {
            const subSequence = subSequences[Object.keys(subSequences)[i]];
            const nodeGap = i === Object.keys(subSequences).length - 1 ? 0 : NODE_GAP.BRANCH_X;
            subSequence.viewState = { ...subSequence.viewState, w: subSequencesWidth, l: subSequencesWidth / 2, r: subSequencesWidth / 2 };
            totalWidth += subSequencesWidth + nodeGap;
        }

        node.viewState.l = subSequenceKeys.length > 0 ? subSequences[Object.keys(subSequences)[0]].viewState.l : 0;
        node.viewState.r = subSequenceKeys.length > 0 ? subSequences[Object.keys(subSequences)[subSequenceKeys.length - 1]].viewState.r : 0;
        node.viewState.fw = totalWidth;
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
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.START.EDITABLE.WIDTH, h: NODE_DIMENSIONS.START.EDITABLE.HEIGHT };
    }

    endVisitOutSequence = (node: Sequence): void => {
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.START.DISABLED.WIDTH, h: NODE_DIMENSIONS.START.DISABLED.HEIGHT };
    }

    endVisitFaultSequence = (node: Sequence): void => {
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.START.DISABLED.WIDTH, h: NODE_DIMENSIONS.START.DISABLED.HEIGHT };
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

    beginVisitSend = (node: Send): void => { this.skipChildrenVisit = true; }
    endVisitSend = (node: Send): void => {
        if (node.endpoint) {
            this.addDiagnostics(node.endpoint);
        }
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.CALL.WIDTH, fw: NODE_DIMENSIONS.CALL.FULL_WIDTH, h: NODE_DIMENSIONS.DEFAULT.HEIGHT, l: NODE_DIMENSIONS.CALL.WIDTH / 2, r: NODE_DIMENSIONS.CALL.FULL_WIDTH - NODE_DIMENSIONS.CALL.WIDTH / 2 };
        this.calculateBasicMediator(node);
        this.skipChildrenVisit = false;
    }

    endVisitSequence = (node: Sequence): void => {
        const isSequnce = node.mediatorList && node.mediatorList.length > 0;

        if (isSequnce) {
            node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.START.EDITABLE.WIDTH, h: NODE_DIMENSIONS.START.EDITABLE.HEIGHT };
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

    endVisitCallTemplate = (node: CallTemplate): void => this.calculateBasicMediator(node);

    //Advanced Mediators
    endVisitCache = (node: Cache): void => {
        this.calculateAdvancedMediator(node, {
            OnCacheHit: node.onCacheHit
        });
    }
    endVisitClone = (node: Clone): void => {
        let targets: { [key: string]: any } = {}
        node.target.map((target) => {
            targets[target.to] = target
        });
        this.calculateAdvancedMediator(node, targets);
    }
    beginVisitDataServiceCall = (node: DataServiceCall): void => this.calculateBasicMediator(node);
    beginVisitEnqueue = (node: Enqueue): void => this.calculateBasicMediator(node);
    beginVisitTransaction = (node: Transaction): void => this.calculateBasicMediator(node);
    beginVisitEvent = (node: Event): void => this.calculateBasicMediator(node);

    //Extesnion Mediators
    beginVisitBean = (node: Bean): void => this.calculateBasicMediator(node);
    beginVisitClass = (node: Class): void => this.calculateBasicMediator(node);
    beginVisitPojoCommand = (node: PojoCommand): void => this.calculateBasicMediator(node);
    beginVisitEjb = (node: Ejb): void => this.calculateBasicMediator(node);
    beginVisitScript = (node: Script): void => this.calculateBasicMediator(node);
    beginVisitSpring = (node: Spring): void => this.calculateBasicMediator(node);

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
