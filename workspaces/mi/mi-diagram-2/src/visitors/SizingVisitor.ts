/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */


import { Bean, Call, CallTemplate, Callout, Class, Drop, Ejb, Endpoint, EndpointHttp, Filter, Header, Log, Loopback, PayloadFactory, PojoCommand, Property, PropertyGroup, Respond, STNode, Script, Send, Sequence, Spring, Store, TagRange, Range, Throttle, Validate, Visitor, Enqueue, Transaction, Event, DataServiceCall, Clone, Cache, Aggregate, traversNode, Iterate, Resource, Switch, Foreach, Bam, ConditionalRouter, OauthService, Builder, PublishEvent, EntitlementService, Rule, Ntlm, Datamapper, Enrich, FastXSLT, Makefault, Jsontransform, Smooks, Xquery, Xslt, ViewState } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { ADD_NEW_SEQUENCE_TAG, NODE_DIMENSIONS, NODE_GAP, NodeTypes } from "../resources/constants";
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

    calculateAdvancedMediator = (node: STNode, subSequences: { [x: string]: any; }, type: NodeTypes, canAddSubSequences?: boolean, addNewSequenceBefore?: string): void => {
        if (node.viewState == undefined) {
            node.viewState = { x: 0, y: 0, w: 0, h: 0, fw: 0, fh: 0 }
        }

        let subSequencesWidth = 0;
        let subSequencesHeight = NODE_DIMENSIONS.EMPTY.BRANCH.HEIGHT;
        const subSequenceKeys = Object.keys(subSequences);
        for (let i = 0; i < subSequenceKeys.length; i++) {
            const sequenceKey = subSequenceKeys[i];
            const subSequence = subSequences[sequenceKey];
            if (subSequence) {
                let subSequenceWidth = NODE_DIMENSIONS.EMPTY.BRANCH.WIDTH;
                let subSequenceHeight = type === NodeTypes.GROUP_NODE ? NODE_DIMENSIONS.START.DISABLED.HEIGHT + NODE_GAP.Y : 0;
                let subSequenceL = 0;
                let subSequenceR = 0;
                if (subSequence.mediatorList && subSequence.mediatorList.length > 0) {
                    const subSequenceMediatorList = subSequence.mediatorList as any as STNode[];
                    subSequenceMediatorList.forEach((childNode: STNode) => {
                        if (childNode.viewState) {
                            subSequenceWidth = Math.max(subSequenceWidth, childNode.viewState.fw ?? childNode.viewState.w);
                            subSequenceHeight += (childNode.viewState.fh || childNode.viewState.h) + NODE_GAP.Y;

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
                } else if (subSequence.sequenceAttribute) {
                    subSequenceWidth = NODE_DIMENSIONS.REFERENCE.WIDTH;
                    subSequenceHeight += NODE_DIMENSIONS.REFERENCE.HEIGHT;
                    subSequenceL = NODE_DIMENSIONS.REFERENCE.WIDTH / 2;
                    subSequenceR = NODE_DIMENSIONS.REFERENCE.WIDTH / 2;
                } else {
                    subSequenceL = NODE_DIMENSIONS.EMPTY.BRANCH.WIDTH / 2;
                    subSequenceR = NODE_DIMENSIONS.EMPTY.BRANCH.WIDTH / 2;
                }
                subSequenceHeight += type === NodeTypes.GROUP_NODE ? NODE_DIMENSIONS.END.HEIGHT : NODE_GAP.Y;
                subSequencesHeight = Math.max(subSequencesHeight, subSequenceHeight);
                subSequencesWidth = Math.max(subSequencesWidth, subSequenceWidth);
                subSequence.viewState = { x: 0, y: 0, w: subSequenceWidth, h: subSequenceHeight, l: subSequenceL, r: subSequenceR, isBrokenLines: sequenceKey !== "default" };
                this.addDiagnostics(subSequence);
            }
        }

        let totalWidth = 0;
        // make widths and heights equal
        for (let i = 0; i < Object.keys(subSequences).length; i++) {
            const subSequence = subSequences[Object.keys(subSequences)[i]];
            const nodeGap = i === Object.keys(subSequences).length - 1 ? 0 : NODE_GAP.BRANCH_X;
            subSequence.viewState = { ...subSequence.viewState, w: subSequencesWidth, h: subSequencesHeight, l: subSequencesWidth / 2, r: subSequencesWidth / 2 };
            totalWidth += subSequencesWidth + nodeGap;
        }

        node.viewState.fw = Math.max(totalWidth, type === NodeTypes.CONDITION_NODE ? NODE_DIMENSIONS.CONDITION.WIDTH : NODE_DIMENSIONS.GROUP.WIDTH);

        if (canAddSubSequences) {
            const plusButton: ViewState = { x: 0, y: 0, w: 0, h: 0 };
            if (node.viewState.subPositions) {
                node.viewState.subPositions[ADD_NEW_SEQUENCE_TAG] = plusButton;
            } else {
                node.viewState.subPositions = {
                    addNewSequence: plusButton
                }
            }

            if (!addNewSequenceBefore) {
                node.viewState.fw += NODE_GAP.BRANCH_X;
            }
        }
        node.viewState.l = subSequenceKeys.length > 0 ? node.viewState.fw / 2 : 0;
        node.viewState.r = subSequenceKeys.length > 0 ? node.viewState.fw / 2 : 0;

        const topGap = type === NodeTypes.CONDITION_NODE ? (NODE_DIMENSIONS.CONDITION.HEIGHT + NODE_GAP.BRANCH_TOP) : (node.viewState.h / 2) + NODE_GAP.GROUP_NODE_START_Y;
        const bottomGap = type === NodeTypes.CONDITION_NODE ? NODE_GAP.BRANCH_BOTTOM : NODE_GAP.GROUP_NODE_END_Y;
        const sequenceFullHeight = subSequencesHeight;
        node.viewState.fh = topGap + sequenceFullHeight + bottomGap;

        let actualWidth = node.viewState.fw;
        if (type === NodeTypes.GROUP_NODE) {
            actualWidth += NODE_GAP.BRANCH_X + NODE_GAP.GROUP_NODE_HORIZONTAL_PADDING;
        }
        this.sequenceWidth = Math.max(this.sequenceWidth, actualWidth);

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

    beginVisitPropertyGroup = (node: PropertyGroup): void => {
        this.skipChildrenVisit = true;
    }
    endVisitPropertyGroup = (node: PropertyGroup): void => {
        this.calculateBasicMediator(node);
        this.skipChildrenVisit = false;
    }

    endVisitRespond = (node: Respond): void => this.calculateBasicMediator(node);

    endVisitResource = (node: Resource): void => {
        const namedSequenceHeight = NODE_DIMENSIONS.START.EDITABLE.HEIGHT + NODE_GAP.Y + NODE_DIMENSIONS.REFERENCE.HEIGHT + NODE_GAP.Y + NODE_DIMENSIONS.END.HEIGHT;
        if (node.inSequenceAttribute) {
            node.viewState = {
                x: 0,
                y: 0,
                w: NODE_DIMENSIONS.START.EDITABLE.WIDTH,
                h: 0,
                fh: namedSequenceHeight
            };
        }
        if (node.outSequenceAttribute) {
            node.viewState = {
                ...node.viewState,
                fh: node.viewState.fh + namedSequenceHeight
            };
        }
    }

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
            node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.REFERENCE.WIDTH, h: NODE_DIMENSIONS.REFERENCE.HEIGHT };
        }
    }

    endVisitStore = (node: Store): void => this.calculateBasicMediator(node);


    endVisitValidate = (node: Validate): void => {
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.GROUP.WIDTH, h: NODE_DIMENSIONS.GROUP.HEIGHT };
        this.calculateAdvancedMediator(node, {
            onFail: node.onFail
        }, NodeTypes.GROUP_NODE);
    }

    endVisitCallTemplate = (node: CallTemplate): void => this.calculateBasicMediator(node);

    //Advanced Mediators
    endVisitCache = (node: Cache): void => {
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.GROUP.WIDTH, h: NODE_DIMENSIONS.GROUP.HEIGHT };
        this.calculateAdvancedMediator(node, {
            OnCacheHit: node.onCacheHit
        }, NodeTypes.GROUP_NODE);
    }
    endVisitClone = (node: Clone): void => {
        let targets: { [key: string]: any } = {}
        node.target.map((target, index) => {
            targets[target.to || index] = target.endpoint || target.sequence || target
        });

        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.GROUP.WIDTH, h: NODE_DIMENSIONS.GROUP.HEIGHT };
        this.calculateAdvancedMediator(node, targets, NodeTypes.GROUP_NODE, true);
    }
    beginVisitDataServiceCall = (node: DataServiceCall): void => this.calculateBasicMediator(node);
    beginVisitEnqueue = (node: Enqueue): void => this.calculateBasicMediator(node);
    beginVisitTransaction = (node: Transaction): void => this.calculateBasicMediator(node);
    beginVisitEvent = (node: Event): void => this.calculateBasicMediator(node);

    //EIP Mediators
    endVisitAggregate = (node: Aggregate): void => {
        if (node?.correlateOnOrCompleteConditionOrOnComplete?.onComplete?.mediatorList) {
            traversNode(node.correlateOnOrCompleteConditionOrOnComplete.onComplete, this);
        }
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.GROUP.WIDTH, h: NODE_DIMENSIONS.GROUP.HEIGHT };
        this.calculateAdvancedMediator(node, {
            OnComplete: node.correlateOnOrCompleteConditionOrOnComplete.onComplete
        }, NodeTypes.GROUP_NODE);
    }
    endVisitIterate = (node: Iterate): void => {
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.GROUP.WIDTH, h: NODE_DIMENSIONS.GROUP.HEIGHT };
        this.calculateAdvancedMediator(node, {
            Target: node.target.sequence
        }, NodeTypes.GROUP_NODE);
    }
    endVisitForeach = (node: Foreach): void => {
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.GROUP.WIDTH, h: NODE_DIMENSIONS.GROUP.HEIGHT };
        this.calculateAdvancedMediator(node, {
            Sequence: node.sequence
        }, NodeTypes.GROUP_NODE);
    }
    //Filter Mediators
    endVisitFilter = (node: Filter): void => {
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.CONDITION.WIDTH, h: NODE_DIMENSIONS.CONDITION.HEIGHT };
        this.calculateAdvancedMediator(node, {
            then: node.then,
            else: node.else_
        }, NodeTypes.CONDITION_NODE);
    }
    endVisitSwitch = (node: Switch): void => {
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.CONDITION.WIDTH, h: NODE_DIMENSIONS.CONDITION.HEIGHT };
        let cases: { [key: string]: any } = {};
        node._case.map((_case, index) => {
            cases[_case.regex || index] = _case;
        });
        this.calculateAdvancedMediator(node, {
            ...cases, default: node._default
        }, NodeTypes.CONDITION_NODE, true, "default");
    }
    beginVisitConditionalRouter = (node: ConditionalRouter): void => this.calculateBasicMediator(node);
    endVisitThrottle = (node: Throttle): void => {
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.CONDITION.WIDTH, h: NODE_DIMENSIONS.CONDITION.HEIGHT };
        this.calculateAdvancedMediator(node, {
            OnAccept: node.onAccept,
            OnReject: node.onReject
        }, NodeTypes.CONDITION_NODE);
    }
    //Extesnion Mediators
    beginVisitBean = (node: Bean): void => this.calculateBasicMediator(node);
    beginVisitClass = (node: Class): void => this.calculateBasicMediator(node);
    beginVisitPojoCommand = (node: PojoCommand): void => this.calculateBasicMediator(node);
    beginVisitEjb = (node: Ejb): void => this.calculateBasicMediator(node);
    beginVisitScript = (node: Script): void => this.calculateBasicMediator(node);
    beginVisitSpring = (node: Spring): void => this.calculateBasicMediator(node);

    //Other Mediators
    beginVisitBam = (node: Bam): void => this.calculateBasicMediator(node);
    beginVisitOauthService = (node: OauthService): void => this.calculateBasicMediator(node);
    beginVisitBuild = (node: Builder): void => this.calculateBasicMediator(node);
    beginVisitPublishEvent = (node: PublishEvent): void => this.calculateBasicMediator(node);
    endVisitEntitlementService = (node: EntitlementService): void => {
        node.viewState = { x: 0, y: 0, w: NODE_DIMENSIONS.GROUP.WIDTH, h: NODE_DIMENSIONS.GROUP.HEIGHT };
        this.calculateAdvancedMediator(node, {
            OnAccept: node.onAccept,
            OnReject: node.onReject,
            Obligations: node.obligations,
            Advice: node.advice
        }, NodeTypes.GROUP_NODE);
    }
    beginVisitRule = (node: Rule): void => this.calculateBasicMediator(node);
    beginVisitNtlm = (node: Ntlm): void => this.calculateBasicMediator(node);

    //Transformation Mediators
    beginVisitDatamapper = (node: Datamapper): void => this.calculateBasicMediator(node);
    beginVisitEnrich = (node: Enrich): void => this.calculateBasicMediator(node);
    beginVisitFastXSLT = (node: FastXSLT): void => this.calculateBasicMediator(node);
    beginVisitMakefault = (node: Makefault): void => this.calculateBasicMediator(node);
    beginVisitJsontransform = (node: Jsontransform): void => this.calculateBasicMediator(node);
    beginVisitSmooks = (node: Smooks): void => this.calculateBasicMediator(node);
    beginVisitXquery = (node: Xquery): void => this.calculateBasicMediator(node);
    beginVisitXslt = (node: Xslt): void => this.calculateBasicMediator(node);

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
