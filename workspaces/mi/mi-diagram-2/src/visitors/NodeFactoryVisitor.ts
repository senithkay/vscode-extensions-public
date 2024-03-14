/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Visitor, STNode, Call, CallTemplate, Callout, Drop, Filter, Header, Log, Loopback, PayloadFactory, Property, PropertyGroup, Respond, Send, Sequence, Store, Throttle, Validate, traversNode, Endpoint, EndpointHttp, Position, Bean, Class, PojoCommand, Ejb, Script, Spring, Enqueue, Transaction, Event, DataServiceCall, Clone, Cache, Aggregate, Iterate } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { NodeLinkModel } from "../components/NodeLink/NodeLinkModel";
import { MediatorNodeModel } from "../components/nodes/MediatorNode/MediatorNodeModel";
import { GroupNodeModel } from "../components/nodes/GroupNode/GroupNodeModel";
import { StartNodeModel, StartNodeType } from "../components/nodes/StartNode/StartNodeModel";
import { NodeModel } from "@projectstorm/react-diagrams";
import { ConditionNodeModel } from "../components/nodes/ConditionNode/ConditionNodeModel";
import { EndNodeModel } from "../components/nodes/EndNode/EndNodeModel";
import { CallNodeModel } from "../components/nodes/CallNode/CallNodeModel";
import { ENDPOINTS, MEDIATORS, NODE_DIMENSIONS, NODE_GAP, NodeTypes } from "../resources/constants";
import { SourceNodeModel, TargetNodeModel, createNodesLink } from "../utils/diagram";
import { EmptyNodeModel } from "../components/nodes/EmptyNode/EmptyNodeModel";
import { Diagnostic } from "vscode-languageserver-types";
import { ReferenceNodeModel } from "../components/nodes/ReferenceNode/ReferenceNodeModel";
import { DiagramService } from "@wso2-enterprise/mi-syntax-tree/src";
import { PlusNodeModel } from "../components/nodes/PlusNode/PlusNodeModel";

interface BranchData {
    name: string;
    diagnostics: Diagnostic[];
}
enum DiagramType {
    DIAGRAM,
    SEQUENCE
}

export type AnyNode = MediatorNodeModel | StartNodeModel | ConditionNodeModel | EndNodeModel | CallNodeModel | EmptyNodeModel | GroupNodeModel | PlusNodeModel;

export class NodeFactoryVisitor implements Visitor {
    nodes: AnyNode[] = [];
    links: NodeLinkModel[] = [];
    private parents: STNode[] = [];
    private skipChildrenVisit = false;
    private previousSTNodes: STNode[] = [];
    private currentBranchData: BranchData;
    private currentAddPosition: Position;
    private documentUri: string;
    private diagramType: DiagramType;
    private resource: DiagramService;

    constructor(documentUri: string, model: DiagramService) {
        this.documentUri = documentUri;
        this.resource = model;
    }

    private createNodeAndLinks(node: STNode, name: string, type: NodeTypes = NodeTypes.MEDIATOR_NODE, data?: any): void {
        // create node
        let diagramNode: AnyNode;
        if (type === NodeTypes.MEDIATOR_NODE) {
            diagramNode = new MediatorNodeModel(node, name, this.documentUri, this.parents[this.parents.length - 1], this.previousSTNodes);
        } else if (type === NodeTypes.REFERENCE_NODE) {
            diagramNode = new ReferenceNodeModel(node, name, data[0], this.documentUri, this.parents[this.parents.length - 1], this.previousSTNodes);
        } else if (type === NodeTypes.GROUP_NODE) {
            diagramNode = new GroupNodeModel(node, name, this.documentUri, this.parents[this.parents.length - 1], this.previousSTNodes);
        } else if (type === NodeTypes.CONDITION_NODE) {
            diagramNode = new ConditionNodeModel(node, name, this.documentUri, this.parents[this.parents.length - 1], this.previousSTNodes);
        } else if (type === NodeTypes.START_NODE) {
            diagramNode = new StartNodeModel(node, this.resource, data, this.documentUri, this.parents[this.parents.length - 1], this.previousSTNodes);
        } else if (type === NodeTypes.END_NODE) {
            diagramNode = new EndNodeModel(node, this.parents[this.parents.length - 1], this.previousSTNodes);
        } else if (type === NodeTypes.CALL_NODE) {
            diagramNode = new CallNodeModel(node, name, this.documentUri, this.parents[this.parents.length - 1], this.previousSTNodes, data);
        } else if (type === NodeTypes.EMPTY_NODE || type === NodeTypes.CONDITION_NODE_END) {
            diagramNode = new EmptyNodeModel(node, this.documentUri);
        } else if (type === NodeTypes.PLUS_NODE) {
            diagramNode = new PlusNodeModel(node, name, this.documentUri);
        }
        diagramNode.setPosition(node.viewState.x, node.viewState.y);

        // create link
        if (this.previousSTNodes && this.previousSTNodes.length > 0) {
            for (let i = 0; i < this.previousSTNodes.length; i++) {
                const previousStNode = this.previousSTNodes[i];
                const previousNodes = this.nodes.filter((node) => JSON.stringify(node.getStNode().range) === JSON.stringify(previousStNode.range) && !node.getStNode().viewState?.id?.endsWith("_add_subsequence"));
                const previousNode = previousNodes[previousNodes.length - 1];

                const isSequnceConnect = diagramNode instanceof StartNodeModel && previousNode instanceof EndNodeModel;
                const isEmptyNodeConnect = diagramNode instanceof EmptyNodeModel && previousNode instanceof EmptyNodeModel;

                const addPosition = this.currentAddPosition != undefined ? this.currentAddPosition :
                    (type === NodeTypes.CONDITION_NODE_END && previousNode instanceof EmptyNodeModel) ? previousStNode.range.endTagRange.start :
                        previousStNode.range.endTagRange?.end ? previousStNode.range.endTagRange.end : previousStNode.range.startTagRange.end;

                const link = createNodesLink(
                    previousNode as SourceNodeModel,
                    diagramNode as TargetNodeModel,
                    {
                        label: this.currentBranchData?.name,
                        stRange: addPosition,
                        brokenLine: type === NodeTypes.EMPTY_NODE || isSequnceConnect || isEmptyNodeConnect,
                        previousNode: previousStNode.tag,
                        parentNode: this.parents.length > 1 ? this.parents[this.parents.length - 1].tag : undefined,
                        showArrow: !isSequnceConnect,
                        showAddButton: !isSequnceConnect,
                        diagnostics: this.currentBranchData?.diagnostics || [],
                    }
                );
                this.links.push(link);
                this.currentBranchData = undefined;
                this.currentAddPosition = undefined;
            }
        }

        this.nodes.push(diagramNode);
        this.previousSTNodes = [node];
    }

    visitSubSequences(node: STNode, subSequences: { [x: string]: any; }, type: NodeTypes, canAddSubSequences: boolean): void {
        const sequenceKeys = Object.keys(subSequences);
        // travers sub sequences
        for (let i = 0; i < sequenceKeys.length; i++) {
            const sequence = subSequences[sequenceKeys[i]];
            if (sequence) {
                this.currentAddPosition = sequence.range.startTagRange.end;

                // add the start node for each sub flow in group node
                const startNode = structuredClone(sequence);
                if (type === NodeTypes.GROUP_NODE) {
                    this.previousSTNodes = [];
                    startNode.viewState.x += (startNode.viewState.w / 2) - (NODE_DIMENSIONS.START.DISABLED.WIDTH / 2);
                    startNode.tag = "start";
                    this.createNodeAndLinks(startNode, "", NodeTypes.START_NODE, StartNodeType.SUB_SEQUENCE);
                } else {
                    this.currentBranchData = { name: sequenceKeys[i], diagnostics: sequence.diagnostics };
                    this.previousSTNodes = [node];
                }

                if (sequence.mediatorList && sequence.mediatorList.length > 0) {
                    (sequence.mediatorList as any).forEach((childNode: STNode) => {
                        traversNode(childNode, this);
                    });

                } else if (sequence.sequenceAttribute) {
                    sequence.viewState.y += NODE_DIMENSIONS.START.DISABLED.HEIGHT + NODE_GAP.Y;
                    this.createNodeAndLinks(sequence, "", NodeTypes.REFERENCE_NODE, [sequence.sequenceAttribute]);

                } else if (sequence.tag === "endpoint") {
                    sequence.viewState.y += NODE_DIMENSIONS.START.DISABLED.HEIGHT + NODE_GAP.Y;
                    this.createNodeAndLinks(sequence, "", NodeTypes.MEDIATOR_NODE);

                } else if (type !== NodeTypes.GROUP_NODE) {
                    this.createNodeAndLinks(sequence, "", NodeTypes.EMPTY_NODE);
                }

                // add the end node for each sub flow in group node
                if (type === NodeTypes.GROUP_NODE) {
                    sequence.viewState.y = startNode.viewState.y + sequence.viewState.h;
                    sequence.viewState.x += (sequence.viewState.w / 2) - (NODE_DIMENSIONS.END.WIDTH / 2);
                    this.createNodeAndLinks(sequence, "", NodeTypes.END_NODE);
                }
            }
        }
        this.previousSTNodes = [node];

        // add plus node to add more sub sequences
        if (canAddSubSequences) {
            const addPosition = {
                line: node.range.endTagRange.end.line,
                character: node.range.endTagRange.end.character
            }
            this.currentAddPosition = addPosition;
            const eNode = structuredClone(node);
            eNode.viewState.id = JSON.stringify(eNode.range.endTagRange) + "_add_subsequence";
            eNode.viewState.y = eNode.viewState.y + eNode.viewState.h;
            eNode.viewState.x = eNode.viewState.x + eNode.viewState.w / 2 - NODE_DIMENSIONS.START.DISABLED.WIDTH / 2;
            eNode.viewState.x += node.viewState.fw / 2;
            this.previousSTNodes = [];
            this.createNodeAndLinks(eNode, MEDIATORS.CLONE, NodeTypes.PLUS_NODE);
        }

        // add last nodes in sub sequences to the previous nodes list
        if (type !== NodeTypes.GROUP_NODE) {
            this.previousSTNodes = [];
            for (let i = 0; i < sequenceKeys.length; i++) {
                const sequence = subSequences[sequenceKeys[i]];
                if (sequence) {
                    if (sequence.mediatorList && sequence.mediatorList.length > 0) {
                        const lastNode = (sequence.mediatorList as any)[(sequence.mediatorList as any).length - 1];
                        this.previousSTNodes.push(lastNode);
                    } else {
                        this.previousSTNodes.push(subSequences[sequenceKeys[i]]);
                    }
                }
            }

            // add empty node
            this.currentBranchData = undefined;
            const eNode = structuredClone(node);
            eNode.viewState.id = JSON.stringify(eNode.range.endTagRange) + "_end";
            eNode.viewState.y = eNode.viewState.y + eNode.viewState.fh;
            eNode.viewState.x = eNode.viewState.x + eNode.viewState.w / 2 - NODE_DIMENSIONS.EMPTY.WIDTH / 2;
            this.createNodeAndLinks(eNode, "", NodeTypes.CONDITION_NODE_END);
        }
    }

    getNodes(): NodeModel[] {
        return this.nodes;
    }

    getLinks(): NodeLinkModel[] {
        return this.links;
    }

    beginVisitCall = (node: Call): void => {
        this.createNodeAndLinks(node, MEDIATORS.CALL, NodeTypes.CALL_NODE, node.endpoint);
        this.skipChildrenVisit = true;
    }
    endVisitCall = (node: Call): void => {
        this.skipChildrenVisit = false;
    }

    beginVisitCallout = (node: Callout): void => this.createNodeAndLinks(node, MEDIATORS.CALLOUT);
    beginVisitDrop = (node: Drop): void => this.createNodeAndLinks(node, MEDIATORS.DROP);
    beginVisitEndpoint = (node: Endpoint): void => this.createNodeAndLinks(node, "");
    beginVisitEndpointHttp = (node: EndpointHttp): void => this.createNodeAndLinks(node, ENDPOINTS.HTTP);

    beginVisitFilter(node: Filter): void {
        this.createNodeAndLinks(node, MEDIATORS.FILTER, NodeTypes.CONDITION_NODE)
        this.parents.push(node);

        this.visitSubSequences(node, {
            Then: node.then,
            Else: node.else_,
        }, NodeTypes.CONDITION_NODE, false);
        this.skipChildrenVisit = true;
    }
    endVisitFilter(node: Filter): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitHeader = (node: Header): void => this.createNodeAndLinks(node, MEDIATORS.HEADER);

    beginVisitInSequence(node: Sequence): void {
        const addPosition = {
            line: node.range.startTagRange.start.line,
            character: node.range.startTagRange.end.character
        }
        this.currentAddPosition = addPosition;
        this.resource.viewState = node.viewState;
        this.createNodeAndLinks(this.resource, "", NodeTypes.START_NODE, StartNodeType.IN_SEQUENCE);
        this.parents.push(node);
    }
    endVisitInSequence(node: Sequence): void {
        node.viewState.x += NODE_DIMENSIONS.START.EDITABLE.WIDTH / 2 - NODE_DIMENSIONS.START.DISABLED.WIDTH / 2;
        node.viewState.y = node.viewState.fh + NODE_GAP.Y;
        this.createNodeAndLinks(node, MEDIATORS.SEQUENCE, NodeTypes.END_NODE, StartNodeType.IN_SEQUENCE);
        this.parents.pop();
        this.previousSTNodes = [node];
    }

    beginVisitOutSequence(node: Sequence): void {
        const addPosition = {
            line: node.range.startTagRange.start.line,
            character: node.range.startTagRange.end.character
        }
        this.currentAddPosition = addPosition;
        this.resource.viewState = node.viewState;
        this.createNodeAndLinks(node, "", NodeTypes.START_NODE, StartNodeType.OUT_SEQUENCE);
        this.currentAddPosition = addPosition;
        this.parents.push(node);
    }
    endVisitOutSequence(node: Sequence): void {
        const lastNode = this.nodes[this.nodes.length - 1].getStNode();
        node.viewState.y = lastNode.viewState.y + Math.max(lastNode.viewState.h, lastNode.viewState.fh || 0) + NODE_GAP.Y;
        this.createNodeAndLinks(node, MEDIATORS.SEQUENCE, NodeTypes.END_NODE, StartNodeType.OUT_SEQUENCE);
        this.parents.pop();
        this.previousSTNodes = undefined;
    }

    beginVisitFaultSequence(node: Sequence): void {
        const addPosition = {
            line: node.range.startTagRange.end.line,
            character: node.range.startTagRange.end.character
        }
        this.currentAddPosition = addPosition;
        this.createNodeAndLinks(node, "", NodeTypes.START_NODE, StartNodeType.FAULT_SEQUENCE);
        this.parents.push(node);
    }
    endVisitFaultSequence(node: Sequence): void {
        const lastNode = this.nodes[this.nodes.length - 1].getStNode();
        node.viewState.y = lastNode.viewState.y + Math.max(lastNode.viewState.h, lastNode.viewState.fh || 0) + NODE_GAP.Y;
        this.createNodeAndLinks(node, MEDIATORS.SEQUENCE, NodeTypes.END_NODE, StartNodeType.FAULT_SEQUENCE);
        this.parents.pop();
        this.previousSTNodes = undefined;
    }

    beginVisitLog = (node: Log): void => {
        this.createNodeAndLinks(node, MEDIATORS.LOG);
        this.skipChildrenVisit = true;
    }
    endVisitLog = (node: Log): void => {
        this.skipChildrenVisit = false;
    }

    beginVisitLoopback = (node: Loopback): void => this.createNodeAndLinks(node, MEDIATORS.LOOPBACK);
    beginVisitPayloadFactory = (node: PayloadFactory): void => this.createNodeAndLinks(node, MEDIATORS.PAYLOAD);
    beginVisitProperty = (node: Property): void => this.createNodeAndLinks(node, MEDIATORS.PROPERTY);

    beginVisitPropertyGroup = (node: PropertyGroup): void => {
        this.createNodeAndLinks(node, MEDIATORS.PROPERTYGROUP);
        this.skipChildrenVisit = true;
    }
    endVisitPropertyGroup(node: PropertyGroup): void {
        this.skipChildrenVisit = false;
    }

    beginVisitRespond = (node: Respond): void => this.createNodeAndLinks(node, MEDIATORS.RESPOND);

    beginVisitSend = (node: Send): void => {
        this.createNodeAndLinks(node, MEDIATORS.SEND, NodeTypes.CALL_NODE, node.endpoint);
        this.skipChildrenVisit = true;
    }
    endVisitSend = (node: Send): void => {
        this.skipChildrenVisit = false;
    }

    beginVisitSequence = (node: Sequence): void => {
        const addPosition = {
            line: node.range.startTagRange.start.line,
            character: node.range.startTagRange.end.character
        }
        this.currentAddPosition = addPosition;

        const isSequnce = this.parents.length == 0;
        if (!isSequnce) {
            this.createNodeAndLinks(node, MEDIATORS.SEQUENCE, NodeTypes.REFERENCE_NODE, [(node as any).key ?? node.tag]);
            this.skipChildrenVisit = true;
        } else {
            this.createNodeAndLinks(node, "", NodeTypes.START_NODE);
            this.diagramType = DiagramType.SEQUENCE;
        }
        this.parents.push(node);
    }
    endVisitSequence(node: Sequence): void {
        const isSequnce = node.mediatorList && node.mediatorList.length > 0;
        if (isSequnce) {
            const lastNode = this.nodes[this.nodes.length - 1].getStNode();
            node.viewState.y = lastNode.viewState.y + Math.max(lastNode.viewState.h, lastNode.viewState.fh || 0) + NODE_GAP.Y;
            node.viewState.x += NODE_DIMENSIONS.START.EDITABLE.WIDTH / 2 - NODE_DIMENSIONS.START.DISABLED.WIDTH / 2;
            this.createNodeAndLinks(node, MEDIATORS.SEQUENCE, NodeTypes.END_NODE, node.range.endTagRange.end);
            this.parents.pop();
            this.previousSTNodes = undefined;
        }
        this.skipChildrenVisit = false;
    }

    beginVisitStore = (node: Store): void => this.createNodeAndLinks(node, MEDIATORS.STORE);
    beginVisitThrottle = (node: Throttle): void => this.createNodeAndLinks(node, MEDIATORS.THROTTLE);

    // beginVisitValidate = (node: Validate): void => this.createNodeAndLinks(node, MEDIATORS.VALIDATE);
    beginVisitValidate(node: Validate): void {
        this.createNodeAndLinks(node, MEDIATORS.VALIDATE, NodeTypes.GROUP_NODE)
        this.parents.push(node);

        this.visitSubSequences(node, {
            OnFail: node.onFail,
        }, NodeTypes.GROUP_NODE, false);
        this.skipChildrenVisit = true;
    }
    endVisitValidate(node: Validate): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitCallTemplate = (node: CallTemplate): void => this.createNodeAndLinks(node, MEDIATORS.CALLTEMPLATE);

    //Advanced Mediators
    beginVisitCache(node: Cache): void {
        this.createNodeAndLinks(node, MEDIATORS.CACHE, NodeTypes.GROUP_NODE)
        this.parents.push(node);

        this.visitSubSequences(node, {
            OnCacheHit: node.onCacheHit,
        }, NodeTypes.GROUP_NODE, false);
        this.skipChildrenVisit = true;
    }
    endVisitCache(node: Cache): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }
    beginVisitClone(node: Clone): void {
        this.createNodeAndLinks(node, MEDIATORS.CLONE, NodeTypes.GROUP_NODE)
        this.parents.push(node);
        let targets: { [key: string]: any } = {}
        node.target.map((target, index) => {
            targets[target.to || index] = target.endpoint || target.sequence || target
        })
        this.visitSubSequences(node, targets, NodeTypes.GROUP_NODE, true);
        this.skipChildrenVisit = true;
    }
    endVisitClone(node: Clone): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }
    beginVisitDataServiceCall = (node: DataServiceCall): void => this.createNodeAndLinks(node, MEDIATORS.DATASERVICECALL);
    beginVisitEnqueue = (node: Enqueue): void => this.createNodeAndLinks(node, MEDIATORS.ENQUEUE);
    beginVisitTransaction = (node: Transaction): void => this.createNodeAndLinks(node, MEDIATORS.TRANSACTION);
    beginVisitEvent = (node: Event): void => this.createNodeAndLinks(node, MEDIATORS.EVENT);

    //EIP Mediators
    beginVisitAggregate(node: Aggregate): void {
        this.createNodeAndLinks(node, MEDIATORS.AGGREGATE, NodeTypes.GROUP_NODE)
        this.parents.push(node);

        this.visitSubSequences(node, {
            // OnComplete: node.correlateOnOrCompleteConditionOrOnComplete.onComplete?.mediators
            OnComplete: node.correlateOnOrCompleteConditionOrOnComplete.onComplete,
        }, NodeTypes.GROUP_NODE, false)
        this.skipChildrenVisit = true;
    }
    endVisitAggregate(node: Aggregate): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }
    beginVisitIterate(node: Iterate): void {
        this.createNodeAndLinks(node, MEDIATORS.ITERATE, NodeTypes.GROUP_NODE)
        this.parents.push(node);

        this.visitSubSequences(node, {
            Target: node.target.sequence
        }, NodeTypes.GROUP_NODE, false)
        this.skipChildrenVisit = true;
    }
    endVisitIterate(node: Iterate): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }
    // Extension Mediators
    beginVisitBean(node: Bean): void {
        this.createNodeAndLinks(node, MEDIATORS.BEAN);
        this.skipChildrenVisit = true;
    }

    endVisitBean(node: Bean): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitClass(node: Class): void {
        this.createNodeAndLinks(node, MEDIATORS.CLASS);
        this.skipChildrenVisit = true;
    }

    endVisitClass(node: Class): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitPojoCommand(node: PojoCommand): void {
        this.createNodeAndLinks(node, MEDIATORS.COMMAND);
        this.skipChildrenVisit = true;
    }

    endVisitPojoCommand(node: PojoCommand): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitEjb(node: Ejb): void {
        this.createNodeAndLinks(node, MEDIATORS.EJB);
        this.skipChildrenVisit = true;
    }

    endVisitEjb(node: Ejb): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitScript(node: Script): void {
        this.createNodeAndLinks(node, MEDIATORS.SCRIPT);
        this.skipChildrenVisit = true;
    }

    endVisitScript(node: Script): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitSpring(node: Spring): void {
        this.createNodeAndLinks(node, MEDIATORS.SPRING);
        this.skipChildrenVisit = true;
    }

    endVisitSpring(node: Spring): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
