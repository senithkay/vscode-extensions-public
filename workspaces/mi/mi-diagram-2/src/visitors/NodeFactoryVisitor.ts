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

export class NodeFactoryVisitor implements Visitor {
    nodes: MediatorNodeModel[] = [];
    links: NodeLinkModel[] = [];
    private parents: STNode[] = [];
    private skipChildrenVisit = false;
    private previousNodes: STNode[] = [];
    private currentBranchName: string;

    private createNodeAndLinks(node: STNode): void {
        // create node
        const diagramNode = new MediatorNodeModel(node, this.parents[this.parents.length - 1], this.previousNodes);
        diagramNode.setPosition(node.viewState.x, node.viewState.y);
        this.nodes.push(diagramNode);

        // create link
        if (this.previousNodes != undefined) {
            this.previousNodes.forEach((previousStNode) => {
                const previousNodes: MediatorNodeModel[] = this.nodes.filter((node) => node.getStNode() == previousStNode);
                previousNodes.forEach((previousNode) => {
                    const link = this.createLink(previousNode, diagramNode);
                    this.links.push(link);
                });
            });
        }

        this.previousNodes = [node];
    }

    getNodes(): MediatorNodeModel[] {
        return this.nodes;
    }

    getLinks(): NodeLinkModel[] {
        return this.links;
    }

    createLink(sourceNode: MediatorNodeModel, targetNode: MediatorNodeModel): NodeLinkModel {
        const link = new NodeLinkModel(this.currentBranchName);
        link.setSourcePort(sourceNode.getPort("out"));
        link.setTargetPort(targetNode.getPort("in"));
        sourceNode.getPort("out").addLink(link);
        this.currentBranchName = undefined;
        return link;
    }

    beginVisitCall = (node: Call): void => this.createNodeAndLinks(node);
    beginVisitCallout = (node: Callout): void => this.createNodeAndLinks(node);
    beginVisitDrop = (node: Drop): void => this.createNodeAndLinks(node);
    beginVisitEndpoint = (node: Endpoint): void => this.createNodeAndLinks(node);
    beginVisitEndpointHttp = (node: EndpointHttp): void => this.createNodeAndLinks(node);

    beginVisitFilter(node: Filter): void {
        this.createNodeAndLinks(node)
        this.parents.push(node);

        if (node.then && node.then.mediatorList && (node.then.mediatorList as any).length > 0) {
            this.previousNodes = [node];
            this.currentBranchName = "Then";
            (node.then.mediatorList as any).forEach((childNode: STNode) => {
                traversNode(childNode, this);
            });
        }
        if (node.else_ && node.else_.mediatorList && (node.else_.mediatorList as any).length > 0) {
            this.previousNodes = [node];
            this.currentBranchName = "Else";
            (node.else_.mediatorList as any).forEach((childNode: STNode) => {
                traversNode(childNode, this);
            });
        }
        this.skipChildrenVisit = true;
    }
    endVisitFilter(node: Filter): void {
        this.parents.pop();

        this.previousNodes = [];
        if (node.then && node.then.mediatorList && (node.then.mediatorList as any).length > 0) {
            this.previousNodes.push((node.then.mediatorList as any)[0]);
        }
        if (node.else_ && node.else_.mediatorList && (node.else_.mediatorList as any).length > 0) {
            this.previousNodes.push((node.else_.mediatorList as any)[0]);
        }
        this.skipChildrenVisit = false;
    }

    beginVisitHeader = (node: Header): void => this.createNodeAndLinks(node);

    beginVisitInSequence(node: Sequence): void {
        this.parents.push(node);
    }
    EndVisitInSequence(node: Sequence): void {
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
