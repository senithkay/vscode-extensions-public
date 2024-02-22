/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Visitor, STNode, WithParam, Call, CallTemplate, Callout, Drop, Filter, Header, Log, Loopback, PayloadFactory, Property, PropertyGroup, Respond, Send, Sequence, Store, Throttle, Validate, traversNode, Endpoint, EndpointHttp, Position } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { NodeLinkModel } from "../components/NodeLink/NodeLinkModel";
import { MediatorNodeModel } from "../components/nodes/MediatorNode/MediatorNodeModel";
import { StartNodeModel } from "../components/nodes/StartNode/StartNodeModel";
import { NodeModel } from "@projectstorm/react-diagrams";
import { ConditionNodeModel } from "../components/nodes/ConditionNode/ConditionNodeModel";
import { EndNodeModel } from "../components/nodes/EndNode/EndNodeModel";
import { CallNodeModel } from "../components/nodes/CallNode/CallNodeModel";
import { ENDPOINTS, MEDIATORS, NODE_GAP, NodeTypes } from "../resources/constants";
import { SourceNodeModel, TargetNodeModel, createNodesLink } from "../utils/diagram";
import { EmptyNodeModel } from "../components/nodes/EmptyNode/EmptyNodeModel";

export class NodeFactoryVisitor implements Visitor {
    nodes: (MediatorNodeModel | StartNodeModel | ConditionNodeModel | EndNodeModel | CallNodeModel | EmptyNodeModel)[] = [];
    links: NodeLinkModel[] = [];
    private parents: STNode[] = [];
    private skipChildrenVisit = false;
    private previousSTNodes: STNode[] = [];
    private currentBranchName: string;
    private currentAddPosition: Position;
    private documentUri: string;

    constructor(documentUri: string) {
        this.documentUri = documentUri;
    }

    private createNodeAndLinks(node: STNode, name: string, type: NodeTypes = NodeTypes.MEDIATOR_NODE, data?: any): void {
        // create node
        let diagramNode: MediatorNodeModel | StartNodeModel | ConditionNodeModel | EndNodeModel | CallNodeModel | EmptyNodeModel;
        if (type === NodeTypes.MEDIATOR_NODE) {
            diagramNode = new MediatorNodeModel(node, name, this.documentUri, this.parents[this.parents.length - 1], this.previousSTNodes);
        } else if (type === NodeTypes.CONDITION_NODE) {
            diagramNode = new ConditionNodeModel(node, this.parents[this.parents.length - 1], this.previousSTNodes);
        } else if (type === NodeTypes.START_NODE) {
            diagramNode = new StartNodeModel(node, this.parents[this.parents.length - 1], this.previousSTNodes);
        } else if (type === NodeTypes.END_NODE) {
            diagramNode = new EndNodeModel(node, this.parents[this.parents.length - 1], this.previousSTNodes);
        } else if (type === NodeTypes.CALL_NODE) {
            diagramNode = new CallNodeModel(node, this.parents[this.parents.length - 1], this.previousSTNodes, data);
        } else if (type === NodeTypes.EMPTY_NODE) {
            diagramNode = new EmptyNodeModel(node);
        }
        diagramNode.setPosition(node.viewState.x, node.viewState.y);
        this.nodes.push(diagramNode);

        // create link
        if (this.previousSTNodes != undefined) {
            for (let i = 0; i < this.previousSTNodes.length; i++) {
                const previousStNode = this.previousSTNodes[i];
                const previousNodes = this.nodes.filter((node) => node.getStNode() == previousStNode && node.getType() !== NodeTypes.END_NODE);
                for (let j = 0; j < previousNodes.length; j++) {
                    const previousNode = previousNodes[j];
                    const link = createNodesLink(
                        previousNode as SourceNodeModel,
                        diagramNode as TargetNodeModel,
                        {
                            label: this.currentBranchName,
                            stRange: this.currentAddPosition ?? (previousStNode.range.endTagRange?.end ? previousStNode.range.endTagRange.end : previousStNode.range.startTagRange.end),
                            brokenLine: type === NodeTypes.EMPTY_NODE || previousNode instanceof EmptyNodeModel,
                            previousNode: previousStNode.tag,
                            parentNode: this.parents.length > 1 ? this.parents[this.parents.length - 1].tag : undefined,
                        }
                    );
                    this.links.push(link);
                    this.currentBranchName = undefined;
                    this.currentAddPosition = undefined;
                }
            }
        }

        this.previousSTNodes = [node];
    }

    visitSubSequences(node: STNode, subSequences: { [x: string]: any; }): void {
        const sequenceKeys = Object.keys(subSequences);
        // travers sub sequences
        for (let i = 0; i < sequenceKeys.length; i++) {
            const sequence = subSequences[sequenceKeys[i]];
            if (sequence && sequence.mediatorList && sequence.mediatorList.length > 0) {
                this.previousSTNodes = [node];
                this.currentBranchName = sequenceKeys[i];

                this.currentAddPosition = sequence.range.startTagRange.end;
                (sequence.mediatorList as any).forEach((childNode: STNode) => {
                    traversNode(childNode, this);
                });
            } else {
                this.currentBranchName = sequenceKeys[i];
                this.previousSTNodes = [node];
                this.currentAddPosition = sequence.range.startTagRange.end;
                this.createNodeAndLinks(sequence, "", NodeTypes.EMPTY_NODE);
            }
        }

        // add last nodes in sub sequences to the previous nodes list
        this.previousSTNodes = [];
        for (let i = 0; i < sequenceKeys.length; i++) {
            const sequence = subSequences[sequenceKeys[i]];
            if (sequence && sequence.mediatorList && sequence.mediatorList.length > 0) {
                const lastNode = (sequence.mediatorList as any)[(sequence.mediatorList as any).length - 1];
                this.previousSTNodes.push(lastNode);
            } else {
                this.previousSTNodes.push(subSequences[sequenceKeys[i]]);
            }
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
        });
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
        this.createNodeAndLinks(node, "", NodeTypes.START_NODE);
        this.parents.push(node);
    }
    endVisitInSequence(node: Sequence): void {
        node.viewState.y = node.viewState.fh + NODE_GAP.Y;
        this.createNodeAndLinks(node, MEDIATORS.SEQUENCE, NodeTypes.END_NODE, node.range.endTagRange.end);
        this.parents.pop();
        this.previousSTNodes = undefined;
    }

    beginVisitOutSequence(node: Sequence): void {
        const addPosition = {
            line: node.range.startTagRange.end.line,
            character: node.range.startTagRange.end.character
        }
        this.currentAddPosition = addPosition;
        this.createNodeAndLinks(node, "", NodeTypes.START_NODE);
        this.parents.push(node);
    }
    endVisitOutSequence(node: Sequence): void {
        const lastNode = this.nodes[this.nodes.length - 1].getStNode();
        node.viewState.y = lastNode.viewState.y + Math.max(lastNode.viewState.h, lastNode.viewState.fh || 0) + NODE_GAP.Y;
        this.createNodeAndLinks(node, MEDIATORS.SEQUENCE, NodeTypes.END_NODE, node.range.endTagRange.end);
        this.parents.pop();
        this.previousSTNodes = undefined;
    }

    beginVisitFaultSequence(node: Sequence): void {
        const addPosition = {
            line: node.range.startTagRange.end.line,
            character: node.range.startTagRange.end.character
        }
        this.currentAddPosition = addPosition;
        this.createNodeAndLinks(node, "", NodeTypes.START_NODE);
        this.parents.push(node);
    }
    endVisitFaultSequence(node: Sequence): void {
        const lastNode = this.nodes[this.nodes.length - 1].getStNode();
        node.viewState.y = lastNode.viewState.y + Math.max(lastNode.viewState.h, lastNode.viewState.fh || 0) + NODE_GAP.Y;
        this.createNodeAndLinks(node, MEDIATORS.SEQUENCE, NodeTypes.END_NODE, node.range.endTagRange.end);
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
    beginVisitPropertyGroup = (node: PropertyGroup): void => this.createNodeAndLinks(node, MEDIATORS.PROPERTYGROUP);
    beginVisitRespond = (node: Respond): void => this.createNodeAndLinks(node, MEDIATORS.RESPOND);
    beginVisitSend = (node: Send): void => this.createNodeAndLinks(node, MEDIATORS.SEND);
    beginVisitSequence = (node: Sequence): void => this.createNodeAndLinks(node, MEDIATORS.SEQUENCE);
    beginVisitStore = (node: Store): void => this.createNodeAndLinks(node, MEDIATORS.STORE);
    beginVisitThrottle = (node: Throttle): void => this.createNodeAndLinks(node, MEDIATORS.THROTTLE);
    beginVisitValidate = (node: Validate): void => this.createNodeAndLinks(node, MEDIATORS.VALIDATE);
    beginVisitWithParam = (node: WithParam): void => this.createNodeAndLinks(node, "");
    beginVisitCallTemplate = (node: CallTemplate): void => this.createNodeAndLinks(node, MEDIATORS.CALLTEMPLATE);

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
