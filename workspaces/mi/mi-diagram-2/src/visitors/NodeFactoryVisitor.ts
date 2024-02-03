/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Visitor, STNode, WithParam, Call, CallTemplate, Callout, Drop, Filter, Header, Log, Loopback, PayloadFactory, Property, PropertyGroup, Respond, Send, Sequence, Store, Throttle, Validate, traversNode, Endpoint, EndpointHttp } from "@wso2-enterprise/mi-syntax-tree/src";
import { NodeLinkModel } from "../components/NodeLink/NodeLinkModel";
import { MediatorNodeModel } from "../components/nodes/MediatorNode/MediatorNodeModel";
import { StartNodeModel } from "../components/nodes/StartNode/StartNodeModel";
import { NodeModel } from "@projectstorm/react-diagrams";
import { ConditionNodeModel } from "../components/nodes/ConditionNode/ConditionNodeModel";
import { EndNodeModel } from "../components/nodes/EndNode/EndNodeModel";
import { CallNodeModel } from "../components/nodes/CallNode/CallNodeModel";
import { NODE_GAP } from "../resources/constants";

enum NodeType {
    START,
    END,
    MEDIATOR,
    CONDITION,
    CALL
}

export class NodeFactoryVisitor implements Visitor {
    nodes: (MediatorNodeModel | StartNodeModel | ConditionNodeModel | EndNodeModel | CallNodeModel)[] = [];
    links: NodeLinkModel[] = [];
    private parents: STNode[] = [];
    private skipChildrenVisit = false;
    private previousSTNodes: STNode[] = [];
    private currentBranchName: string;

    private createNodeAndLinks(node: STNode, type: NodeType = NodeType.MEDIATOR, data?: any): void {
        // create node
        let diagramNode: MediatorNodeModel | StartNodeModel | ConditionNodeModel | EndNodeModel | CallNodeModel;
        if (type === NodeType.MEDIATOR) {
            diagramNode = new MediatorNodeModel(node, this.parents[this.parents.length - 1], this.previousSTNodes);
        } else if (type === NodeType.CONDITION) {
            diagramNode = new ConditionNodeModel(node, this.parents[this.parents.length - 1], this.previousSTNodes);
        } else if (type === NodeType.START) {
            diagramNode = new StartNodeModel(node, this.parents[this.parents.length - 1], this.previousSTNodes);
        } else if (type === NodeType.END) {
            diagramNode = new EndNodeModel(node, this.parents[this.parents.length - 1], this.previousSTNodes);
        } else if (type === NodeType.CALL) {
            diagramNode = new CallNodeModel(node, this.parents[this.parents.length - 1], this.previousSTNodes, data);
        }
        diagramNode.setPosition(node.viewState.x, node.viewState.y);
        this.nodes.push(diagramNode);

        // create link
        if (this.previousSTNodes != undefined) {
            for (let i = 0; i < this.previousSTNodes.length; i++) {
                const previousStNode = this.previousSTNodes[i];
                const previousNodes = this.nodes.filter((node) => node.getStNode() == previousStNode);
                for (let j = 0; j < previousNodes.length; j++) {
                    const previousNode = previousNodes[j];
                    const link = this.createLink(previousNode, diagramNode);
                    this.links.push(link);
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

                (sequence.mediatorList as any).forEach((childNode: STNode) => {
                    traversNode(childNode, this);
                });
            }
        }

        // add last nodes in sub sequences to the previous nodes list
        this.previousSTNodes = [];
        for (let i = 0; i < sequenceKeys.length; i++) {
            const sequence = subSequences[sequenceKeys[i]];
            if (sequence && sequence.mediatorList && sequence.mediatorList.length > 0) {
                const lastNode = (sequence.mediatorList as any)[(sequence.mediatorList as any).length - 1];
                this.previousSTNodes.push(lastNode);
            }
        }
    }

    getNodes(): NodeModel[] {
        return this.nodes;
    }

    getLinks(): NodeLinkModel[] {
        return this.links;
    }

    createLink(sourceNode: NodeModel, targetNode: NodeModel): NodeLinkModel {
        const link = new NodeLinkModel(this.currentBranchName);
        link.setSourcePort(sourceNode.getPort("out"));
        link.setTargetPort(targetNode.getPort("in"));
        sourceNode.getPort("out").addLink(link);
        this.currentBranchName = undefined;
        return link;
    }

    beginVisitCall = (node: Call): void => {
        this.createNodeAndLinks(node, NodeType.CALL, node.endpoint);
        this.skipChildrenVisit = true;
    }
    endVisitCall = (node: Call): void => {
        this.skipChildrenVisit = false;
    }

    beginVisitCallout = (node: Callout): void => this.createNodeAndLinks(node);
    beginVisitDrop = (node: Drop): void => this.createNodeAndLinks(node);
    beginVisitEndpoint = (node: Endpoint): void => this.createNodeAndLinks(node);
    beginVisitEndpointHttp = (node: EndpointHttp): void => this.createNodeAndLinks(node);

    beginVisitFilter(node: Filter): void {
        this.createNodeAndLinks(node, NodeType.CONDITION)
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

    beginVisitHeader = (node: Header): void => this.createNodeAndLinks(node);

    beginVisitInSequence(node: Sequence): void {
        this.createNodeAndLinks(node, NodeType.START);
        this.parents.push(node);
    }
    endVisitInSequence(node: Sequence): void {
        node.viewState.y = this.nodes[this.nodes.length - 1].getPosition().y + NODE_GAP.Y;
        this.createNodeAndLinks(node, NodeType.END);
        this.parents.pop();
    }

    beginVisitLog = (node: Log): void => this.createNodeAndLinks(node);
    beginVisitLoopback = (node: Loopback): void => this.createNodeAndLinks(node);
    beginVisitPayloadFactory = (node: PayloadFactory): void => this.createNodeAndLinks(node);
    beginVisitProperty = (node: Property): void => this.createNodeAndLinks(node);
    beginVisitPropertyGroup = (node: PropertyGroup): void => this.createNodeAndLinks(node);
    beginVisitRespond = (node: Respond): void => this.createNodeAndLinks(node);
    beginVisitSend = (node: Send): void => this.createNodeAndLinks(node);
    beginVisitSequence = (node: Sequence): void => this.createNodeAndLinks(node);
    beginVisitStore = (node: Store): void => this.createNodeAndLinks(node);
    beginVisitThrottle = (node: Throttle): void => this.createNodeAndLinks(node);
    beginVisitValidate = (node: Validate): void => this.createNodeAndLinks(node);
    beginVisitWithParam = (node: WithParam): void => this.createNodeAndLinks(node);
    beginVisitCallTemplate = (node: CallTemplate): void => this.createNodeAndLinks(node);

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
