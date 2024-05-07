/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    STNode,
    Visitor,
    Log,
    Call,
    Callout,
    Drop,
    Endpoint,
    EndpointHttp,
    Filter,
    Header,
    Loopback,
    PayloadFactory,
    Property,
    PropertyGroup,
    Respond,
    Send,
    Sequence,
    Store,
    Throttle,
    Validate,
    CallTemplate,
    traversNode,
    ViewState,
    Class,
    Cache,
    Bean,
    PojoCommand,
    Ejb,
    Script,
    Spring,
    Enqueue,
    Transaction,
    Event,
    DataServiceCall,
    Clone,
    Aggregate,
    Iterate,
    Switch,
    Foreach,
    Resource,
    Bam,
    ConditionalRouter,
    OauthService,
    Builder,
    PublishEvent,
    EntitlementService,
    Rule,
    Ntlm,
    Datamapper,
    Enrich,
    FastXSLT,
    Makefault,
    Jsontransform,
    Smooks,
    Xquery,
    Xslt,
    Connector,
    Target,
    ProxyTarget,
    DbMediator,
} from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { ADD_NEW_SEQUENCE_TAG, NODE_DIMENSIONS, NODE_GAP, NodeTypes } from "../resources/constants";

export class PositionVisitor implements Visitor {
    private position = {
        x: 0,
        y: 40
    };
    private skipChildrenVisit = false;

    constructor(sequenceWidth: number) {
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

    private setAdvancedMediatorPosition(node: STNode, subSequences: { [x: string]: any; }, type: NodeTypes, canAddSubSequences?: boolean, addNewSequenceBefore?: string): void {
        this.setBasicMediatorPosition(node);

        const centerX = node.viewState.x + (node.viewState.w / 2);
        const subSequenceKeys = Object.keys(subSequences);

        const sequenceOffsets = subSequenceKeys.length > 1 ? subSequences[subSequenceKeys[0]].viewState.l + subSequences[subSequenceKeys[subSequenceKeys.length - 1]].viewState.r : node.viewState.fw;
        const branchesWidth = node.viewState.fw - sequenceOffsets - ((canAddSubSequences && !addNewSequenceBefore) ? NODE_GAP.BRANCH_X : 0);

        this.position.x = centerX - (branchesWidth / 2);
        for (let i = 0; i < subSequenceKeys.length; i++) {
            const subSequence = subSequences[subSequenceKeys[i]];

            if (subSequence) {
                if (type === NodeTypes.GROUP_NODE) {
                    subSequence.viewState.y = node.viewState.y + node.viewState.h + NODE_GAP.GROUP_NODE_START_Y;
                    this.position.y = subSequence.viewState.y;
                } else {
                    this.position.y = node.viewState.y + node.viewState.h + NODE_GAP.BRANCH_TOP + NODE_GAP.Y;
                }

                this.position.x += i > 0 ? subSequence.viewState.l : 0;

                // add plus button
                if (subSequenceKeys[i] === addNewSequenceBefore) {
                    if (node.viewState?.subPositions?.[ADD_NEW_SEQUENCE_TAG]) {
                        node.viewState.subPositions[ADD_NEW_SEQUENCE_TAG].x = (this.position.x - subSequence.viewState.r - (NODE_GAP.BRANCH_X / 2)) - (NODE_DIMENSIONS.PLUS.WIDTH / 2)
                        if (type === NodeTypes.GROUP_NODE) {
                            node.viewState.subPositions[ADD_NEW_SEQUENCE_TAG].y = node.viewState.y + node.viewState.h + NODE_GAP.GROUP_NODE_START_Y;
                        } else {
                            node.viewState.subPositions[ADD_NEW_SEQUENCE_TAG].y = node.viewState.y + node.viewState.h + NODE_GAP.BRANCH_TOP;
                        }
                    }
                }

                if (subSequence.mediatorList && subSequence.mediatorList.length > 0) {
                    subSequence.tag = "subSequence";

                    if (type === NodeTypes.GROUP_NODE) {
                        subSequence.viewState.x = this.position.x - (subSequence.viewState.w / 2);
                        this.position.y = subSequence.viewState.y + NODE_DIMENSIONS.START.DISABLED.HEIGHT + NODE_GAP.Y;
                    }
                    traversNode(subSequence, this);
                } else if (subSequence.sequenceAttribute) {
                    this.setBasicMediatorPosition(subSequence);
                } else if (subSequence.tag === "endpoint") {
                    this.setBasicMediatorPosition(subSequence);
                } else {
                    subSequence.viewState.w = NODE_DIMENSIONS.EMPTY.WIDTH;
                    this.setBasicMediatorPosition(subSequence);
                }
                this.position.x += subSequence.viewState.r + NODE_GAP.BRANCH_X;
            }
        }

        // show plus node if there is no addNewSequenceBefore
        if (canAddSubSequences && !addNewSequenceBefore) {
            if (node.viewState?.subPositions?.[ADD_NEW_SEQUENCE_TAG]) {
                node.viewState.subPositions[ADD_NEW_SEQUENCE_TAG].x = node.viewState.x + (node.viewState.w / 2) + node.viewState.r - (NODE_DIMENSIONS.PLUS.WIDTH / 2);
                if (type === NodeTypes.GROUP_NODE) {
                    node.viewState.subPositions[ADD_NEW_SEQUENCE_TAG].y = node.viewState.y + node.viewState.h + NODE_GAP.GROUP_NODE_START_Y;
                } else {
                    node.viewState.subPositions[ADD_NEW_SEQUENCE_TAG].y = node.viewState.y + node.viewState.h + NODE_GAP.BRANCH_TOP;
                }
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

    beginVisitPropertyGroup = (node: PropertyGroup): void => {
        this.setBasicMediatorPosition(node);
        this.skipChildrenVisit = true;
    }
    endVisitPropertyGroup = (node: PropertyGroup): void => {
        this.skipChildrenVisit = false;
    }

    beginVisitRespond = (node: Respond): void => this.setBasicMediatorPosition(node);

    beginVisitResource = (node: Resource): void => {
        const namedSequenceHeight = NODE_DIMENSIONS.START.EDITABLE.HEIGHT + NODE_GAP.Y + NODE_DIMENSIONS.REFERENCE.HEIGHT + NODE_GAP.Y + NODE_DIMENSIONS.END.HEIGHT;
        if (node.inSequenceAttribute || node.outSequenceAttribute) {
            this.setBasicMediatorPosition(node);
        }
    }

    beginVisitTarget = (node: Target | ProxyTarget): void => {
        if (node.tag === "target") {
            const proxyTargetNode = node as ProxyTarget;
            if (proxyTargetNode.inSequenceAttribute || proxyTargetNode.outSequenceAttribute) {
                this.setBasicMediatorPosition(proxyTargetNode);
            }
        }
    }

    beginVisitSend = (node: Send): void => {
        this.setBasicMediatorPosition(node);
        this.setSkipChildrenVisit(true);
    }
    endVisitSend = (node: Send): void => this.setSkipChildrenVisit(false);

    beginVisitSequence = (node: Sequence): void => this.setBasicMediatorPosition(node);

    beginVisitStore = (node: Store): void => this.setBasicMediatorPosition(node);

    beginVisitValidate = (node: Validate): void => {
        this.setAdvancedMediatorPosition(node, {
            onFail: node.onFail
        }, NodeTypes.GROUP_NODE);
    }
    endVisitValidate = (node: Validate): void => this.setSkipChildrenVisit(false);

    beginVisitCallTemplate = (node: CallTemplate): void => this.setBasicMediatorPosition(node);

    //Advanced Medaitors
    beginVisitCache = (node: Cache): void => {
        this.setAdvancedMediatorPosition(node, {
            OnCacheHit: node.onCacheHit
        }, NodeTypes.GROUP_NODE);
    }
    endVisitCache = (node: Cache): void => this.setSkipChildrenVisit(false);
    beginVisitClone = (node: Clone): void => {
        let targets: { [key: string]: any } = {}
        node.target.map((target, index) => {
            targets[target.to || index] = target.endpoint || target.sequence || target
        });
        this.setAdvancedMediatorPosition(node, targets, NodeTypes.GROUP_NODE, true);
    }
    endVisitClone = (node: Clone): void => this.setSkipChildrenVisit(false);
    beginVisitDataServiceCall = (node: DataServiceCall): void => this.setBasicMediatorPosition(node);
    beginVisitEnqueue = (node: Enqueue): void => this.setBasicMediatorPosition(node);
    beginVisitTransaction = (node: Transaction): void => this.setBasicMediatorPosition(node);
    beginVisitEvent = (node: Event): void => this.setBasicMediatorPosition(node);

    //EIP Mediators
    beginVisitAggregate = (node: Aggregate): void => {
        this.setAdvancedMediatorPosition(node, {
            // OnComplete: node.correlateOnOrCompleteConditionOrOnComplete.onComplete?.mediators
            OnComplete: node.correlateOnOrCompleteConditionOrOnComplete.onComplete
        }, NodeTypes.GROUP_NODE);
    }
    endVisitAggregate = (node: Aggregate): void => this.setSkipChildrenVisit(false);
    beginVisitIterate = (node: Iterate): void => {
        this.setAdvancedMediatorPosition(node, {
            Target: node.target.sequence
        }, NodeTypes.GROUP_NODE);
    }
    endVisitIterate = (node: Iterate): void => this.setSkipChildrenVisit(false);
    beginVisitForeach = (node: Foreach): void => {
        this.setAdvancedMediatorPosition(node, {
            Sequence: node.sequence
        }, NodeTypes.GROUP_NODE);
    }
    endVisitForeach = (node: Foreach): void => this.setSkipChildrenVisit(false);
    //Filter Mediators
    beginVisitFilter = (node: Filter): void => {
        this.setAdvancedMediatorPosition(node, {
            then: node.then,
            else: node.else_
        }, NodeTypes.CONDITION_NODE);
    }
    endVisitFilter = (node: Filter): void => this.setSkipChildrenVisit(false);
    beginVisitSwitch = (node: Switch): void => {
        let cases: { [key: string]: any } = {};
        node._case.map((_case, index) => {
            cases[_case.regex || index] = _case;
        });
        this.setAdvancedMediatorPosition(node, {
            ...cases, default: node._default
        }, NodeTypes.CONDITION_NODE, true, "default");
    }
    endVisitSwitch = (node: Switch): void => this.setSkipChildrenVisit(false);
    beginVisitConditionalRouter = (node: ConditionalRouter): void => this.setBasicMediatorPosition(node);
    beginVisitThrottle = (node: Throttle): void => {
        this.setAdvancedMediatorPosition(node, {
            OnAccept: node.onAccept,
            OnReject: node.onReject
        }, NodeTypes.CONDITION_NODE);
    }
    endVisitThrottle = (node: Throttle): void => this.setSkipChildrenVisit(false);
    //Extension Mediators
    beginVisitClass = (node: Class): void => {
        this.skipChildrenVisit = true;
        this.setBasicMediatorPosition(node);
    }
    endVisitClass = (node: Class): void => {
        this.skipChildrenVisit = false;
    }

    beginVisitBean = (node: Bean): void => this.setBasicMediatorPosition(node);
    beginVisitPojoCommand = (node: PojoCommand): void => this.setBasicMediatorPosition(node);
    beginVisitEjb = (node: Ejb): void => this.setBasicMediatorPosition(node);
    beginVisitScript = (node: Script): void => this.setBasicMediatorPosition(node);
    beginVisitSpring = (node: Spring): void => this.setBasicMediatorPosition(node);

    //Other Mediators
    beginVisitBam = (node: Bam): void => this.setBasicMediatorPosition(node);
    beginVisitOauthService = (node: OauthService): void => this.setBasicMediatorPosition(node);
    beginVisitBuilder = (node: Builder): void => this.setBasicMediatorPosition(node);
    beginVisitPublishEvent = (node: PublishEvent): void => this.setBasicMediatorPosition(node);
    beginVisitEntitlementService = (node: EntitlementService): void => {
        this.setAdvancedMediatorPosition(node, {
            OnAccept: node.onAccept,
            OnReject: node.onReject,
            Obligations: node.obligations,
            Advice: node.advice
        }, NodeTypes.GROUP_NODE);
    }
    endVisitEntitlementService = (node: EntitlementService): void => this.setSkipChildrenVisit(false);
    beginVisitRule = (node: Rule): void => this.setBasicMediatorPosition(node);
    beginVisitNTLM = (node: Ntlm): void => this.setBasicMediatorPosition(node);
    //Transformation Mediators
    beginVisitDatamapper = (node: Datamapper): void => this.setBasicMediatorPosition(node);
    beginVisitEnrich = (node: Enrich): void => this.setBasicMediatorPosition(node);
    beginVisitFastXSLT = (node: FastXSLT): void => this.setBasicMediatorPosition(node);
    beginVisitMakefault = (node: Makefault): void => this.setBasicMediatorPosition(node);
    beginVisitJsontransform = (node: Jsontransform): void => this.setBasicMediatorPosition(node);
    beginVisitSmooks = (node: Smooks): void => this.setBasicMediatorPosition(node);
    beginVisitXquery = (node: Xquery): void => this.setBasicMediatorPosition(node);
    beginVisitXslt = (node: Xslt): void => this.setBasicMediatorPosition(node);

    beginVisitDblookup = (node: DbMediator): void => {
        this.setSkipChildrenVisit(true);
        this.setBasicMediatorPosition(node);
    }
    endVisitDblookup = (node: DbMediator): void => this.setSkipChildrenVisit(false);

    beginVisitDbreport = (node: DbMediator): void => {
        this.setSkipChildrenVisit(true);
        this.setBasicMediatorPosition(node);
    }
    endVisitDbreport = (node: DbMediator): void => this.setSkipChildrenVisit(false);

    // Connectors
    beginVisitConnector = (node: Connector): void => {
        this.skipChildrenVisit = true;
        this.setBasicMediatorPosition(node);
    }
    endVisitConnector(node: Connector): void {
        this.skipChildrenVisit = false;
    }
}
