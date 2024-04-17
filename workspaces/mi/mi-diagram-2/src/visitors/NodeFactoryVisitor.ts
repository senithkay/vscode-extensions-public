/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    Visitor,
    STNode,
    Call,
    CallTemplate,
    Callout,
    Drop,
    Filter,
    Header,
    Log,
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
    traversNode,
    Endpoint,
    EndpointHttp,
    Position,
    Bean,
    Class,
    PojoCommand,
    Ejb,
    Script,
    Spring,
    Enqueue,
    Transaction,
    Event,
    DataServiceCall,
    Clone,
    Cache,
    Aggregate,
    Iterate,
    Resource,
    Switch,
    Foreach,
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
    Range,
    Connector,
    DiagramService,
    ProxyTarget,
    Target
} from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { NodeLinkModel } from "../components/NodeLink/NodeLinkModel";
import { MediatorNodeModel } from "../components/nodes/MediatorNode/MediatorNodeModel";
import { GroupNodeModel } from "../components/nodes/GroupNode/GroupNodeModel";
import { StartNodeModel, StartNodeType } from "../components/nodes/StartNode/StartNodeModel";
import { NodeModel } from "@projectstorm/react-diagrams";
import { ConditionNodeModel } from "../components/nodes/ConditionNode/ConditionNodeModel";
import { EndNodeModel } from "../components/nodes/EndNode/EndNodeModel";
import { CallNodeModel } from "../components/nodes/CallNode/CallNodeModel";
import { ADD_NEW_SEQUENCE_TAG, ENDPOINTS, MEDIATORS, NODE_DIMENSIONS, NODE_GAP, NodeTypes } from "../resources/constants";
import { SourceNodeModel, TargetNodeModel, createNodesLink } from "../utils/diagram";
import { EmptyNodeModel } from "../components/nodes/EmptyNode/EmptyNodeModel";
import { Diagnostic } from "vscode-languageserver-types";
import { ReferenceNodeModel } from "../components/nodes/ReferenceNode/ReferenceNodeModel";
import { PlusNodeModel } from "../components/nodes/PlusNode/PlusNodeModel";
import { ConnectorNodeModel } from "../components/nodes/ConnectorNode/ConnectorNodeModel";

interface BranchData {
    name: string;
    diagnostics: Diagnostic[];
}
interface createNodeAndLinks {
    node: STNode;
    name?: string;
    type?: NodeTypes;
    data?: any;
}

enum DiagramType {
    DIAGRAM,
    SEQUENCE
}

const RESTRICTED_NODE_TYPES = ["resource", "target"]

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

    private createNodeAndLinks(params: createNodeAndLinks): void {
        let { node, name, type, data } = params;

        // create node
        let diagramNode: AnyNode;
        switch (type) {
            case NodeTypes.REFERENCE_NODE:
                diagramNode = new ReferenceNodeModel(node, name, data[0], this.documentUri, this.parents[this.parents.length - 1], this.previousSTNodes);
                break;
            case NodeTypes.GROUP_NODE:
                diagramNode = new GroupNodeModel(node, name, this.documentUri, this.parents[this.parents.length - 1], this.previousSTNodes);
                break;
            case NodeTypes.CONDITION_NODE:
                diagramNode = new ConditionNodeModel(node, name, this.documentUri, this.parents[this.parents.length - 1], this.previousSTNodes);
                break;
            case NodeTypes.START_NODE:
                diagramNode = new StartNodeModel(node, data, this.parents[this.parents.length - 1], this.previousSTNodes);
                break;
            case NodeTypes.END_NODE:
                diagramNode = new EndNodeModel(node, this.parents[this.parents.length - 1], this.previousSTNodes);
                break;
            case NodeTypes.CALL_NODE:
                diagramNode = new CallNodeModel(node, name, this.documentUri, this.parents[this.parents.length - 1], this.previousSTNodes, data);
                break;
            case NodeTypes.EMPTY_NODE:
                diagramNode = new EmptyNodeModel(node, this.documentUri);
                break;
            case NodeTypes.CONDITION_NODE_END:
                diagramNode = new EmptyNodeModel(node, this.documentUri, true);
                break;
            case NodeTypes.PLUS_NODE:
                diagramNode = new PlusNodeModel(node, name, this.documentUri);
                break;
            case NodeTypes.CONNECTOR_NODE:
                diagramNode = new ConnectorNodeModel(node, name, this.documentUri);
                break;
            default:
                type = NodeTypes.MEDIATOR_NODE;
                diagramNode = new MediatorNodeModel(node, name, this.documentUri, this.parents[this.parents.length - 1], this.previousSTNodes);
                break;
        }
        diagramNode.setPosition(node.viewState.x, node.viewState.y);

        // create link
        if (this.previousSTNodes && this.previousSTNodes.length > 0) {
            for (let i = 0; i < this.previousSTNodes.length; i++) {
                const previousStNode = this.previousSTNodes[i];
                const previousNodes = this.nodes.filter((node) => JSON.stringify(node.getStNode().range) === JSON.stringify(previousStNode.range));
                const previousNode = previousNodes[previousNodes.length - 1];
                const currentNodeType = node.tag;
                const previousNodeType = previousStNode.tag;
                
                const isSequnceConnect = diagramNode instanceof StartNodeModel && previousNode instanceof EndNodeModel;
                const isEmptyNodeConnect = diagramNode instanceof EmptyNodeModel && previousNode instanceof EmptyNodeModel && type !== NodeTypes.CONDITION_NODE_END;
                const showAddButton = !isSequnceConnect &&
                 !(previousNode instanceof EmptyNodeModel 
                    && !previousNode.visible) 
                    && type !== NodeTypes.PLUS_NODE
                    && RESTRICTED_NODE_TYPES.indexOf(currentNodeType) < 0
                    && RESTRICTED_NODE_TYPES.indexOf(previousNodeType) < 0;

                const addPosition = this.currentAddPosition != undefined ? this.currentAddPosition :
                    (type === NodeTypes.CONDITION_NODE_END && previousNode instanceof EmptyNodeModel) ? previousStNode.range.endTagRange.start :
                        previousStNode.range.endTagRange?.end ? previousStNode.range.endTagRange.end : previousStNode.range.startTagRange.end;

                const isBrokenLine = previousStNode.viewState.isBrokenLines ?? node.viewState.isBrokenLines;

                const link = createNodesLink(
                    previousNode as SourceNodeModel,
                    diagramNode as TargetNodeModel,
                    {
                        label: this.currentBranchData?.name,
                        stRange: addPosition,
                        brokenLine: isBrokenLine ?? (type === NodeTypes.EMPTY_NODE || isSequnceConnect || isEmptyNodeConnect),
                        previousNode: previousStNode.tag,
                        parentNode: this.parents.length > 1 ? this.parents[this.parents.length - 1].tag : undefined,
                        showArrow: !isSequnceConnect,
                        showAddButton: showAddButton,
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

    visitSubSequences(node: STNode, name: string, subSequences: { [x: string]: any; }, type: NodeTypes, canAddSubSequences?: boolean, addNewSequenceRange?: Range): void {
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
                    this.createNodeAndLinks({ node: startNode, type: NodeTypes.START_NODE, data: StartNodeType.SUB_SEQUENCE });
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
                    sequence.viewState.x += (sequence.viewState.w / 2) - (NODE_DIMENSIONS.DEFAULT.WIDTH / 2);
                    this.createNodeAndLinks({ node: sequence, type: NodeTypes.REFERENCE_NODE, data: [sequence.sequenceAttribute] });

                } else if (sequence.tag === "endpoint") {
                    sequence.viewState.y += NODE_DIMENSIONS.START.DISABLED.HEIGHT + NODE_GAP.Y;
                    sequence.viewState.x += (sequence.viewState.w / 2) - (NODE_DIMENSIONS.DEFAULT.WIDTH / 2);
                    this.createNodeAndLinks({ node: sequence, type: NodeTypes.MEDIATOR_NODE });

                } else if (type !== NodeTypes.GROUP_NODE) {
                    this.createNodeAndLinks({ node: sequence, type: NodeTypes.EMPTY_NODE });
                }

                // add the end node for each sub flow in group node
                if (type === NodeTypes.GROUP_NODE) {
                    sequence.viewState.y = startNode.viewState.y + sequence.viewState.h - NODE_DIMENSIONS.END.HEIGHT;
                    sequence.viewState.x = startNode.viewState.x;
                    this.createNodeAndLinks({ node: sequence, type: NodeTypes.END_NODE });
                }
            }
        }
        this.previousSTNodes = [node];

        // add plus node to add more sub sequences
        if (canAddSubSequences && node.viewState?.subPositions?.[ADD_NEW_SEQUENCE_TAG]) {
            const plusNodeViewState = node.viewState.subPositions[ADD_NEW_SEQUENCE_TAG];
            const plusNode: STNode = {
                tag: ADD_NEW_SEQUENCE_TAG,
                viewState: plusNodeViewState,
                range: {
                    startTagRange: addNewSequenceRange,
                    endTagRange: addNewSequenceRange,
                },
                hasTextNode: false,
                selfClosed: true,
                textNode: ""
            };

            this.currentBranchData = { name: "", diagnostics: [] };
            if (type === NodeTypes.GROUP_NODE) {
                this.previousSTNodes = [];
            }
            this.createNodeAndLinks(({ node: plusNode, name, type: NodeTypes.PLUS_NODE }));
        }
        this.previousSTNodes = [node];

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
            this.createNodeAndLinks({ node: eNode, type: NodeTypes.CONDITION_NODE_END });
        }
    }

    getNodes(): NodeModel[] {
        return this.nodes;
    }

    getLinks(): NodeLinkModel[] {
        return this.links;
    }

    beginVisitCall = (node: Call): void => {
        this.createNodeAndLinks({ node, name: MEDIATORS.CALL, type: NodeTypes.CALL_NODE, data: node.endpoint });
        this.skipChildrenVisit = true;
    }
    endVisitCall = (node: Call): void => {
        this.skipChildrenVisit = false;
    }

    beginVisitCallout = (node: Callout): void => this.createNodeAndLinks({ node, name: MEDIATORS.CALLOUT });
    beginVisitDrop = (node: Drop): void => this.createNodeAndLinks({ node, name: MEDIATORS.DROP });
    beginVisitEndpoint = (node: Endpoint): void => this.createNodeAndLinks({ node });
    beginVisitEndpointHttp = (node: EndpointHttp): void => this.createNodeAndLinks({ node, name: ENDPOINTS.HTTP });

    beginVisitHeader = (node: Header): void => this.createNodeAndLinks({ node, name: MEDIATORS.HEADER });

    beginVisitInSequence(node: Sequence): void {
        const addPosition = {
            line: node.range.startTagRange.start.line,
            character: node.range.startTagRange.end.character
        }
        this.currentAddPosition = addPosition;
        this.resource.viewState = node.viewState;
        this.createNodeAndLinks({ node: this.resource, type: NodeTypes.START_NODE, data: StartNodeType.IN_SEQUENCE });
        this.parents.push(node);
    }
    endVisitInSequence(node: Sequence): void {
        node.viewState.x += NODE_DIMENSIONS.START.EDITABLE.WIDTH / 2 - NODE_DIMENSIONS.START.DISABLED.WIDTH / 2;
        node.viewState.y = node.viewState.fh + NODE_GAP.Y;
        this.createNodeAndLinks({ node, name: MEDIATORS.SEQUENCE, type: NodeTypes.END_NODE, data: StartNodeType.IN_SEQUENCE });
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
        this.createNodeAndLinks({ node, type: NodeTypes.START_NODE, data: StartNodeType.OUT_SEQUENCE });
        this.currentAddPosition = addPosition;
        this.parents.push(node);
    }
    endVisitOutSequence(node: Sequence): void {
        const lastNode = this.nodes[this.nodes.length - 1].getStNode();
        node.viewState.y = lastNode.viewState.y + Math.max(lastNode.viewState.h, lastNode.viewState.fh || 0) + NODE_GAP.Y;
        this.createNodeAndLinks({ node, name: MEDIATORS.SEQUENCE, type: NodeTypes.END_NODE, data: StartNodeType.OUT_SEQUENCE });
        this.parents.pop();
        this.previousSTNodes = undefined;
    }

    beginVisitFaultSequence(node: Sequence): void {
        const addPosition = {
            line: node.range.startTagRange.end.line,
            character: node.range.startTagRange.end.character
        }
        this.currentAddPosition = addPosition;
        this.createNodeAndLinks({ node, type: NodeTypes.START_NODE, data: StartNodeType.FAULT_SEQUENCE });
        this.parents.push(node);
    }
    endVisitFaultSequence(node: Sequence): void {
        const lastNode = this.nodes[this.nodes.length - 1].getStNode();
        node.viewState.y = lastNode.viewState.y + Math.max(lastNode.viewState.h, lastNode.viewState.fh || 0) + NODE_GAP.Y;
        this.createNodeAndLinks({ node, name: MEDIATORS.SEQUENCE, type: NodeTypes.END_NODE, data: StartNodeType.FAULT_SEQUENCE });
        this.parents.pop();
        this.previousSTNodes = undefined;
    }

    beginVisitLog = (node: Log): void => {
        this.createNodeAndLinks({ node, name: MEDIATORS.LOG });
        this.skipChildrenVisit = true;
    }
    endVisitLog = (node: Log): void => {
        this.skipChildrenVisit = false;
    }

    beginVisitLoopback = (node: Loopback): void => this.createNodeAndLinks({ node, name: MEDIATORS.LOOPBACK });
    beginVisitPayloadFactory = (node: PayloadFactory): void => this.createNodeAndLinks({ node, name: MEDIATORS.PAYLOAD });
    beginVisitProperty = (node: Property): void => this.createNodeAndLinks({ node, name: MEDIATORS.PROPERTY });

    beginVisitPropertyGroup = (node: PropertyGroup): void => {
        this.createNodeAndLinks({ node, name: MEDIATORS.PROPERTYGROUP });
        this.skipChildrenVisit = true;
    }
    endVisitPropertyGroup(node: PropertyGroup): void {
        this.skipChildrenVisit = false;
    }

    beginVisitRespond = (node: Respond): void => this.createNodeAndLinks({ node, name: MEDIATORS.RESPOND });

    beginVisitResource = (node: Resource): void => {
        if (node.inSequenceAttribute) {
            node.viewState.y = 40;
            const startNode = structuredClone(node);
            startNode.viewState.id = "inSequenceStart";
            this.createNodeAndLinks({ node: startNode, type: NodeTypes.START_NODE, data: StartNodeType.IN_SEQUENCE });

            const sequneceReferenceNode = structuredClone(node);
            sequneceReferenceNode.viewState.id = "inSequenceNode";
            sequneceReferenceNode.viewState.y += NODE_DIMENSIONS.START.EDITABLE.HEIGHT + NODE_GAP.Y;
            sequneceReferenceNode.viewState.x += (NODE_DIMENSIONS.START.EDITABLE.WIDTH - NODE_DIMENSIONS.REFERENCE.WIDTH) / 2;
            this.createNodeAndLinks({ node: sequneceReferenceNode, name: MEDIATORS.SEQUENCE, type: NodeTypes.REFERENCE_NODE, data: [node.inSequenceAttribute] });

            const endNode = structuredClone(node);
            endNode.viewState.id = "inSequenceEnd";
            endNode.viewState.y = sequneceReferenceNode.viewState.y + NODE_DIMENSIONS.REFERENCE.HEIGHT + NODE_GAP.Y;
            endNode.viewState.x += (NODE_DIMENSIONS.START.EDITABLE.WIDTH - NODE_DIMENSIONS.END.WIDTH) / 2;
            this.createNodeAndLinks({ node: endNode, name: MEDIATORS.SEQUENCE, type: NodeTypes.END_NODE });

            node.viewState.y += endNode.viewState.y + NODE_DIMENSIONS.END.HEIGHT;
        }
        if (node.outSequenceAttribute) {
            const startNode = structuredClone(node);
            startNode.viewState.id = "outSequence";
            startNode.viewState.x += (NODE_DIMENSIONS.START.EDITABLE.WIDTH - NODE_DIMENSIONS.START.DISABLED.WIDTH) / 2;
            this.createNodeAndLinks({ node: startNode, type: NodeTypes.START_NODE, data: StartNodeType.OUT_SEQUENCE });

            const sequneceReferenceNode = structuredClone(node);
            sequneceReferenceNode.viewState.y += NODE_DIMENSIONS.START.EDITABLE.HEIGHT + NODE_GAP.Y;
            sequneceReferenceNode.viewState.x += (NODE_DIMENSIONS.START.EDITABLE.WIDTH - NODE_DIMENSIONS.REFERENCE.WIDTH) / 2;
            this.createNodeAndLinks({ node: sequneceReferenceNode, name: MEDIATORS.SEQUENCE, type: NodeTypes.REFERENCE_NODE, data: [node.inSequenceAttribute] });

            const endNode = structuredClone(node);
            endNode.viewState.y = sequneceReferenceNode.viewState.y + NODE_DIMENSIONS.REFERENCE.HEIGHT + NODE_GAP.Y;
            endNode.viewState.x += (NODE_DIMENSIONS.START.EDITABLE.WIDTH - NODE_DIMENSIONS.END.WIDTH) / 2;
            this.createNodeAndLinks({ node: endNode, name: MEDIATORS.SEQUENCE, type: NodeTypes.END_NODE });
        }
    }
    
    beginVisitTarget = (node: Target | ProxyTarget): void => {
        if (node.tag === "target") {
            const proxyTargetNode = node as ProxyTarget;
            if (proxyTargetNode.inSequenceAttribute) {
                proxyTargetNode.viewState.y = 40;
                const startNode = structuredClone(proxyTargetNode);
                startNode.viewState.id = "inSequenceStart";
                this.createNodeAndLinks({ node: startNode, type: NodeTypes.START_NODE, data: StartNodeType.IN_SEQUENCE });
        
                const sequneceReferenceNode = structuredClone(proxyTargetNode);
                sequneceReferenceNode.viewState.id = "inSequenceNode";
                sequneceReferenceNode.viewState.y += NODE_DIMENSIONS.START.EDITABLE.HEIGHT + NODE_GAP.Y;
                sequneceReferenceNode.viewState.x += (NODE_DIMENSIONS.START.EDITABLE.WIDTH - NODE_DIMENSIONS.REFERENCE.WIDTH) / 2;
                this.createNodeAndLinks({ node: sequneceReferenceNode, name: MEDIATORS.SEQUENCE, type: NodeTypes.REFERENCE_NODE, data: [proxyTargetNode.inSequenceAttribute] });
        
                const endNode = structuredClone(proxyTargetNode);
                endNode.viewState.id = "inSequenceEnd";
                endNode.viewState.y = sequneceReferenceNode.viewState.y + NODE_DIMENSIONS.REFERENCE.HEIGHT + NODE_GAP.Y;
                endNode.viewState.x += (NODE_DIMENSIONS.START.EDITABLE.WIDTH - NODE_DIMENSIONS.END.WIDTH) / 2;
                this.createNodeAndLinks({ node: endNode, name: MEDIATORS.SEQUENCE, type: NodeTypes.END_NODE });
        
                proxyTargetNode.viewState.y += endNode.viewState.y + NODE_DIMENSIONS.END.HEIGHT;
            }
            if (proxyTargetNode.outSequenceAttribute) {
                const startNode = structuredClone(proxyTargetNode);
                startNode.viewState.id = "outSequence";
                startNode.viewState.x += (NODE_DIMENSIONS.START.EDITABLE.WIDTH - NODE_DIMENSIONS.START.DISABLED.WIDTH) / 2;
                this.createNodeAndLinks({ node: startNode, type: NodeTypes.START_NODE, data: StartNodeType.OUT_SEQUENCE });
        
                const sequneceReferenceNode = structuredClone(proxyTargetNode);
                sequneceReferenceNode.viewState.y += NODE_DIMENSIONS.START.EDITABLE.HEIGHT + NODE_GAP.Y;
                sequneceReferenceNode.viewState.x += (NODE_DIMENSIONS.START.EDITABLE.WIDTH - NODE_DIMENSIONS.REFERENCE.WIDTH) / 2;
                this.createNodeAndLinks({ node: sequneceReferenceNode, name: MEDIATORS.SEQUENCE, type: NodeTypes.REFERENCE_NODE, data: [proxyTargetNode.inSequenceAttribute] });
        
                const endNode = structuredClone(proxyTargetNode);
                endNode.viewState.y = sequneceReferenceNode.viewState.y + NODE_DIMENSIONS.REFERENCE.HEIGHT + NODE_GAP.Y;
                endNode.viewState.x += (NODE_DIMENSIONS.START.EDITABLE.WIDTH - NODE_DIMENSIONS.END.WIDTH) / 2;
                this.createNodeAndLinks({ node: endNode, name: MEDIATORS.SEQUENCE, type: NodeTypes.END_NODE });
            }
        }
    }

    beginVisitSend = (node: Send): void => {
        this.createNodeAndLinks({ node, name: MEDIATORS.SEND, type: NodeTypes.CALL_NODE, data: node.endpoint });
        this.skipChildrenVisit = true;
    }
    endVisitSend = (node: Send): void => {
        this.skipChildrenVisit = false;
    }

    beginVisitSequence = (node: Sequence): void => {
        const isSequnce = this.parents.length == 0;
        if (!isSequnce) {
            this.createNodeAndLinks({ node, name: MEDIATORS.SEQUENCE, type: NodeTypes.REFERENCE_NODE, data: [(node as any).key ?? node.tag] });
            this.skipChildrenVisit = true;
        } else {
            const addPosition = {
                line: node.range.startTagRange.start.line,
                character: node.range.startTagRange.end.character
            }
            this.currentAddPosition = addPosition;
            this.createNodeAndLinks({ node, type: NodeTypes.START_NODE, data: StartNodeType.IN_SEQUENCE });
            this.diagramType = DiagramType.SEQUENCE;
        }
        this.parents.push(node);
    }
    endVisitSequence(node: Sequence): void {
        if (node === this.parents[0]) {
            let lastNode = this.nodes[this.nodes.length - 1];
            const prevNodes = this.nodes.filter((prevNode) => prevNode.getParentStNode() === node);
            const lastStNode = lastNode instanceof StartNodeModel ? lastNode.getStNode() : prevNodes[prevNodes.length - 1].getStNode();
            node.viewState.y = lastStNode.viewState.y + Math.max(lastStNode.viewState.h, lastStNode.viewState.fh || 0) + NODE_GAP.Y;
            node.viewState.x += NODE_DIMENSIONS.START.EDITABLE.WIDTH / 2 - NODE_DIMENSIONS.START.DISABLED.WIDTH / 2;
            this.createNodeAndLinks({ node, name: MEDIATORS.SEQUENCE, type: NodeTypes.END_NODE, data: node.range.endTagRange.end });
            this.previousSTNodes = undefined;
        }
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitStore = (node: Store): void => this.createNodeAndLinks({ node, name: MEDIATORS.STORE });

    beginVisitValidate(node: Validate): void {
        this.createNodeAndLinks(({ node, name: MEDIATORS.VALIDATE, type: NodeTypes.GROUP_NODE }))
        this.parents.push(node);

        this.visitSubSequences(node, MEDIATORS.VALIDATE, {
            OnFail: node.onFail,
        }, NodeTypes.GROUP_NODE, false);
        this.skipChildrenVisit = true;
    }
    endVisitValidate(node: Validate): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitCallTemplate = (node: CallTemplate): void => this.createNodeAndLinks({ node, name: MEDIATORS.CALLTEMPLATE });

    //Advanced Mediators
    beginVisitCache(node: Cache): void {
        this.createNodeAndLinks(({ node, name: MEDIATORS.CACHE, type: NodeTypes.GROUP_NODE }))
        this.parents.push(node);

        this.visitSubSequences(node, MEDIATORS.CACHE, {
            OnCacheHit: node.onCacheHit,
        }, NodeTypes.GROUP_NODE, false);
        this.skipChildrenVisit = true;
    }
    endVisitCache(node: Cache): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }
    beginVisitClone(node: Clone): void {
        this.createNodeAndLinks(({ node, name: MEDIATORS.CLONE, type: NodeTypes.GROUP_NODE }))
        this.parents.push(node);
        let targets: { [key: string]: any } = {}
        node.target.map((target, index) => {
            targets[target.to || index] = target.endpoint || target.sequence || target
        })
        const newSequenceRange = {
            start: node.range.endTagRange.start,
            end: node.range.endTagRange.start,
        }
        this.visitSubSequences(node, MEDIATORS.CLONE, targets, NodeTypes.GROUP_NODE, true, newSequenceRange);
        this.skipChildrenVisit = true;
    }
    endVisitClone(node: Clone): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    // Connectors
    beginVisitConnector(node: Connector): void {
        this.createNodeAndLinks({ node, name: node.connectorName, type: NodeTypes.CONNECTOR_NODE });
    }

    beginVisitDataServiceCall = (node: DataServiceCall): void => this.createNodeAndLinks({ node, name: MEDIATORS.DATASERVICECALL });
    beginVisitEnqueue = (node: Enqueue): void => this.createNodeAndLinks({ node, name: MEDIATORS.ENQUEUE });
    beginVisitTransaction = (node: Transaction): void => this.createNodeAndLinks({ node, name: MEDIATORS.TRANSACTION });
    beginVisitEvent = (node: Event): void => this.createNodeAndLinks({ node, name: MEDIATORS.EVENT });

    //EIP Mediators
    beginVisitAggregate(node: Aggregate): void {
        this.createNodeAndLinks(({ node, name: MEDIATORS.AGGREGATE, type: NodeTypes.GROUP_NODE }))
        this.parents.push(node);

        this.visitSubSequences(node, MEDIATORS.AGGREGATE, {
            OnComplete: node.correlateOnOrCompleteConditionOrOnComplete.onComplete,
        }, NodeTypes.GROUP_NODE, false)
        this.skipChildrenVisit = true;
    }
    endVisitAggregate(node: Aggregate): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }
    beginVisitIterate(node: Iterate): void {
        this.createNodeAndLinks(({ node, name: MEDIATORS.ITERATE, type: NodeTypes.GROUP_NODE }))
        this.parents.push(node);

        this.visitSubSequences(node, MEDIATORS.ITERATE, {
            Target: node.target.sequence
        }, NodeTypes.GROUP_NODE, false)
        this.skipChildrenVisit = true;
    }
    endVisitIterate(node: Iterate): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }
    beginVisitForeach(node: Foreach): void {
        this.createNodeAndLinks(({ node, name: MEDIATORS.FOREACH, type: NodeTypes.GROUP_NODE }))
        this.parents.push(node);

        this.visitSubSequences(node, MEDIATORS.FOREACH, {
            Sequence: node.sequence
        }, NodeTypes.GROUP_NODE, false)
        this.skipChildrenVisit = true;
    }
    endVisitForeach(node: Foreach): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }
    //Filter Mediators
    beginVisitFilter(node: Filter): void {
        this.createNodeAndLinks(({ node, name: MEDIATORS.FILTER, type: NodeTypes.CONDITION_NODE }))
        this.parents.push(node);

        this.visitSubSequences(node, MEDIATORS.FILTER, {
            Then: node.then,
            Else: node.else_,
        }, NodeTypes.CONDITION_NODE, false);
        this.skipChildrenVisit = true;
    }
    endVisitFilter(node: Filter): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }
    beginVisitSwitch(node: Switch): void {
        this.createNodeAndLinks(({ node, name: MEDIATORS.SWITCH, type: NodeTypes.CONDITION_NODE }))
        this.parents.push(node);
        let cases: { [key: string]: any } = {};
        node._case.map((_case, index) => {
            cases[_case.regex || index] = _case;
        });

        const defaultNode = node._default;
        const newSequenceRange = {
            start: defaultNode ? defaultNode.range.startTagRange.start : node.range.startTagRange.end,
            end: defaultNode ? defaultNode.range.startTagRange.start : node.range.endTagRange.start,
        }
        this.visitSubSequences(node, MEDIATORS.SWITCH, {
            ...cases, default: defaultNode
        }, NodeTypes.CONDITION_NODE, true, newSequenceRange);
        this.skipChildrenVisit = true;
    }
    endVisitSwitch(node: Switch): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }
    beginVisitConditionalRouter = (node: ConditionalRouter): void => this.createNodeAndLinks({ node, name: MEDIATORS.CONDITIONALROUTER });

    beginVisitThrottle(node: Throttle): void {
        this.createNodeAndLinks(({ node, name: MEDIATORS.THROTTLE, type: NodeTypes.CONDITION_NODE }))
        this.parents.push(node);

        this.visitSubSequences(node, MEDIATORS.THROTTLE, {
            OnAccept: node.onAccept,
            OnReject: node.onReject,
        }, NodeTypes.CONDITION_NODE, false);
        this.skipChildrenVisit = true;
    }
    endVisitThrottle(node: Throttle): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    // Extension Mediators
    beginVisitBean(node: Bean): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.BEAN });
        this.skipChildrenVisit = true;
    }

    endVisitBean(node: Bean): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitClass(node: Class): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.CLASS });
        this.skipChildrenVisit = true;
    }

    endVisitClass(node: Class): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitPojoCommand(node: PojoCommand): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.COMMAND });
        this.skipChildrenVisit = true;
    }

    endVisitPojoCommand(node: PojoCommand): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitEjb(node: Ejb): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.EJB });
        this.skipChildrenVisit = true;
    }

    endVisitEjb(node: Ejb): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitScript(node: Script): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.SCRIPT });
        this.skipChildrenVisit = true;
    }

    endVisitScript(node: Script): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitSpring(node: Spring): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.SPRING });
        this.skipChildrenVisit = true;
    }

    endVisitSpring(node: Spring): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    //Other Mediators
    beginVisitBam(node: Bam): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.BAM });
        this.skipChildrenVisit = true;
    }

    endVisitBam(node: Bam): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitOauthService(node: OauthService): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.OAUTH });
        this.skipChildrenVisit = true;
    }

    endVisitOauthService(node: OauthService): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitBuilder(node: Builder): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.BUILDER });
        this.skipChildrenVisit = true;
    }

    endVisitBuilder(node: Builder): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitPublishEvent(node: PublishEvent): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.PUBLISHEVENT });
        this.skipChildrenVisit = true;
    }

    endVisitPublishEvent(node: PublishEvent): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitEntitlementService(node: EntitlementService): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.ENTITLEMENT, type: NodeTypes.GROUP_NODE })
        this.parents.push(node);

        this.visitSubSequences(node, MEDIATORS.ENTITLEMENT, {
            OnAccept: node.onAccept,
            OnReject: node.onReject,
            Obligations: node.obligations,
            Advice: node.advice
        }, NodeTypes.GROUP_NODE, false)
        this.skipChildrenVisit = true;
    }
    endVisitEntitlementService(node: EntitlementService): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitRule(node: Rule): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.RULE });
        this.skipChildrenVisit = true;
    }

    endVisitRule(node: Rule): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitNtlm(node: Ntlm): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.NTLM });
        this.skipChildrenVisit = true;
    }

    endVisitNtlm(node: Ntlm): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    //Transformation Mediators
    beginVisitDatamapper(node: Datamapper): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.DATAMAPPER });
        this.skipChildrenVisit = true;
    }

    endVisitDatamapper(node: Datamapper): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitEnrich(node: Enrich): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.ENRICH });
        this.skipChildrenVisit = true;
    }

    endVisitEnrich(node: Enrich): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitFastXSLT(node: FastXSLT): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.FASTXSLT });
        this.skipChildrenVisit = true;
    }

    endVisitFastXSLT(node: FastXSLT): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitMakefault(node: Makefault): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.FAULT });
        this.skipChildrenVisit = true;
    }

    endVisitMakefault(node: Makefault): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitJsontransform(node: Jsontransform): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.JSONTRANSFORM });
        this.skipChildrenVisit = true;
    }

    endVisitJsontransform(node: Jsontransform): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitSmooks(node: Smooks): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.SMOOKS });
        this.skipChildrenVisit = true;
    }

    endVisitSmooks(node: Smooks): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitXquery(node: Xquery): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.XQUERY });
        this.skipChildrenVisit = true;
    }

    endVisitXquery(node: Xquery): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    beginVisitXslt(node: Xslt): void {
        this.createNodeAndLinks({ node, name: MEDIATORS.XSLT });
        this.skipChildrenVisit = true;
    }

    endVisitXslt(node: Xslt): void {
        this.parents.pop();
        this.skipChildrenVisit = false;
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
