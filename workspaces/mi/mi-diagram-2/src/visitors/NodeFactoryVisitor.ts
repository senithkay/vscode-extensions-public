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

    private createNode(node: STNode): void {
        const diagramNode = new MediatorNodeModel(node, this.parents[this.parents.length - 1], this.previousNodes);
        diagramNode.setPosition(node.viewState.x, node.viewState.y);
        this.nodes.push(diagramNode);
        this.previousNodes = [node];
    }

    getNodes(): MediatorNodeModel[] {
        return this.nodes;
    }

    getLinks(): NodeLinkModel[] {
        this.createLinks();
        return this.links;
    }

    createLinks(): void {
        for (let i = 0; i < this.nodes.length; i++) {
            const previousStNodes= this.nodes[i].getPrevStNodes();
            if (previousStNodes != undefined) {
                previousStNodes.forEach((previousStNode) => {
                    const previousNodes = this.nodes.filter((node) => node.getStNode() == previousStNode);
                    previousNodes.forEach((previousNode) => {
                        const link = this.createLink(previousNode, this.nodes[i]);
                        this.links.push(link);
                    });
                });
            }

            // for (let j = i + 1; j < this.nodes.length; j++) {
            //     if (this.nodes[i].getStNode() == this.nodes[j].getPrevStNode()) {
            //         const link = this.createLink(this.nodes[i], this.nodes[j]);
            //         this.links.push(link);
            //         break;
            //     }
            // }
        }
    }

    createLink(sourceNode: MediatorNodeModel, targetNode: MediatorNodeModel): NodeLinkModel {
        let link = sourceNode.getPort("out").link<NodeLinkModel>(targetNode.getPort("in")!);
        // const link = new NodeLinkModel();
        // link.setSourcePort(sourceNode.getPort("out"));
        // link.setTargetPort(targetNode.getPort("in"));
        // sourceNode.getPort("out").addLink(link);
        // link.addLabel("test");
        return link;
    }

    beginVisitCall = (node: Call): void => this.createNode(node);
    beginVisitCallout = (node: Callout): void => this.createNode(node);
    beginVisitDrop = (node: Drop): void => this.createNode(node);
    beginVisitEndpoint = (node: Endpoint): void => this.createNode(node);
    beginVisitEndpointHttp = (node: EndpointHttp): void => this.createNode(node);

    beginVisitFilter(node: Filter): void {
        this.createNode(node)
        this.parents.push(node);

        if (node.then && node.then.mediatorList && (node.then.mediatorList as any).length > 0) {
            this.previousNodes = [node];
            (node.then.mediatorList as any).forEach((childNode: STNode) => {
                traversNode(childNode, this);
            }); 
        }
        if (node.else_ && node.else_.mediatorList && (node.else_.mediatorList as any).length > 0) {
            this.previousNodes = [node];
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

    beginVisitHeader = (node: Header): void => this.createNode(node);

    beginVisitInSequence(node: Sequence): void {
        this.parents.push(node);
    }
    EndVisitInSequence(node: Sequence): void {
        this.parents.pop();
    }

    beginVisitLog = (node: Log): void => this.createNode(node);
    beginVisitLoopback = (node: Loopback): void => this.createNode(node);
    beginVisitPayloadFactory = (node: PayloadFactory): void => this.createNode(node);
    beginVisitProperty = (node: Property): void => this.createNode(node);
    beginVisitPropertyGroup = (node: PropertyGroup): void => this.createNode(node);
    beginVisitRespond = (node: Respond): void => this.createNode(node);
    beginVisitSend = (node: Send): void => this.createNode(node);
    beginVisitSequence = (node: Sequence): void => this.createNode(node);
    beginVisitStore = (node: Store): void => this.createNode(node);
    beginVisitThrottle = (node: Throttle): void => this.createNode(node);
    beginVisitValidate = (node: Validate): void => this.createNode(node);
    beginVisitWithParam = (node: WithParam): void => this.createNode(node);
    beginVisitCallTemplate = (node: CallTemplate): void => this.createNode(node);

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
