/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DiagramElement, Flow, Node, NodeModel, Participant, ViewStateLabel } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";
import { NodeLinkModel } from "../components/NodeLink";
import { ParticipantNodeModel } from "../components/nodes/ParticipantNode";
import { EmptyNodeModel } from "../components/nodes/EmptyNode";
import { getNodeId } from "../utils/diagram";
import { EMPTY_NODE_WIDTH, PARTICIPANT_NODE_WIDTH } from "../resources/constants";
import { getViewStateLabel } from "../utils/diagram";

export class ElementFactoryVisitor implements BaseVisitor {
    private flow: Flow;
    participantNodes: NodeModel[] = [];
    interactionNodes: NodeModel[] = [];
    links: NodeLinkModel[] = [];

    constructor(flow: Flow) {
        console.log(">>>> Element factory visitor started");
        this.flow = flow;
    }

    getNodes(): NodeModel[] {
        // sending participant nodes first to render them first in canvas
        return [...this.participantNodes, ...this.interactionNodes];
    }

    getLinks(): NodeLinkModel[] {
        return this.links;
    }

    beginVisitParticipant(participant: Participant): void {
        if (!participant.viewState) {
            console.warn(">> View state not found for participant", participant);
            return;
        }
        const nodeModel = new ParticipantNodeModel(participant);
        nodeModel.setPosition(participant.viewState.bBox.x, participant.viewState.bBox.y);
        nodeModel.updateDimensions({ width: participant.viewState.bBox.w, height: participant.viewState.bBox.h });
        this.participantNodes.push(nodeModel);
    }

    beginVisitNode(node: Node, parent?: DiagramElement, callNode?: Node): void {
        if (!node.viewStates) {
            console.warn(">> View state not found for interaction", node);
            return;
        }
        // create source node
        const sourceNodeViewStateLabel = getViewStateLabel(ViewStateLabel.SOURCE_NODE, getNodeId(callNode));
        const sourceNodeViewState = node.viewStates.find((viewState) => viewState.label === sourceNodeViewStateLabel);
        if (!sourceNodeViewState) {
            console.warn(">> Source view state not found for node", node);
            return;
        }
        const sourceNodeModel = new EmptyNodeModel(getNodeId(node, sourceNodeViewStateLabel));
        sourceNodeModel.setPosition(
            sourceNodeViewState.bBox.x + (PARTICIPANT_NODE_WIDTH - EMPTY_NODE_WIDTH) / 2,
            sourceNodeViewState.bBox.y,
        );
        this.interactionNodes.push(sourceNodeModel);

        // create target node
        const targetNodeViewStateLabel = getViewStateLabel(ViewStateLabel.TARGET_NODE, getNodeId(callNode));
        const targetNodeViewState = node.viewStates.find((viewState) => viewState.label === targetNodeViewStateLabel);
        if (!targetNodeViewState) {
            console.warn(">> Target view state not found for node", node);
            return;
        }
        const targetNodeModel = new EmptyNodeModel(getNodeId(node, targetNodeViewStateLabel));
        targetNodeModel.setPosition(
            targetNodeViewState.bBox.x + (PARTICIPANT_NODE_WIDTH - EMPTY_NODE_WIDTH) / 2,
            targetNodeViewState.bBox.y,
        );
        this.interactionNodes.push(targetNodeModel);

        // create link between source and target
        const link = new NodeLinkModel();
        link.setSourcePort(sourceNodeModel.getRightPort());
        link.setTargetPort(targetNodeModel.getLeftPort());
        link.setSourceNode(sourceNodeModel);
        link.setTargetNode(targetNodeModel);
        this.links.push(link);
    }

    beginVisitEndpointCall(node: Node, parent?: DiagramElement): void {
        if (!node.viewStates) {
            console.warn(">> View state not found for interaction", node);
            return;
        }
        // create source node
        const sourceNodeViewState = node.viewStates.find((viewState) => viewState.label === ViewStateLabel.SOURCE_NODE);
        if (!sourceNodeViewState) {
            console.warn(">> Source view state not found for node", node);
            return;
        }
        const sourceNodeModel = new EmptyNodeModel(getNodeId(node, ViewStateLabel.SOURCE_NODE));
        sourceNodeModel.setPosition(
            sourceNodeViewState.bBox.x + (PARTICIPANT_NODE_WIDTH - EMPTY_NODE_WIDTH) / 2,
            sourceNodeViewState.bBox.y,
        );
        this.interactionNodes.push(sourceNodeModel);

        // create target node
        const targetNodeViewState = node.viewStates.find((viewState) => viewState.label === ViewStateLabel.TARGET_NODE);
        if (!targetNodeViewState) {
            console.warn(">> Target view state not found for node", node);
            return;
        }
        const targetNodeModel = new EmptyNodeModel(getNodeId(node, ViewStateLabel.TARGET_NODE));
        targetNodeModel.setPosition(
            targetNodeViewState.bBox.x + (PARTICIPANT_NODE_WIDTH - EMPTY_NODE_WIDTH) / 2,
            targetNodeViewState.bBox.y,
        );
        this.interactionNodes.push(targetNodeModel);

        // create link between source and target
        const link = new NodeLinkModel();
        link.setSourcePort(sourceNodeModel.getRightPort());
        link.setTargetPort(targetNodeModel.getLeftPort());
        link.setSourceNode(sourceNodeModel);
        link.setTargetNode(targetNodeModel);
        this.links.push(link);

        // create return source node
        const returnSourceNodeViewState = node.viewStates.find(
            (viewState) => viewState.label === ViewStateLabel.RETURN_SOURCE_NODE,
        );
        if (!returnSourceNodeViewState) {
            console.warn(">> Return source view state not found for node", node);
            return;
        }
        const returnSourceNodeModel = new EmptyNodeModel(getNodeId(node, ViewStateLabel.RETURN_SOURCE_NODE));
        returnSourceNodeModel.setPosition(
            returnSourceNodeViewState.bBox.x + (PARTICIPANT_NODE_WIDTH - EMPTY_NODE_WIDTH) / 2,
            returnSourceNodeViewState.bBox.y,
        );
        this.interactionNodes.push(returnSourceNodeModel);

        // create return target node
        const returnTargetNodeViewState = node.viewStates.find(
            (viewState) => viewState.label === ViewStateLabel.RETURN_TARGET_NODE,
        );
        if (!returnTargetNodeViewState) {
            console.warn(">> Return target view state not found for node", node);
            return;
        }
        const returnTargetNodeModel = new EmptyNodeModel(getNodeId(node, ViewStateLabel.RETURN_TARGET_NODE));
        returnTargetNodeModel.setPosition(
            returnTargetNodeViewState.bBox.x + (PARTICIPANT_NODE_WIDTH - EMPTY_NODE_WIDTH) / 2,
            returnTargetNodeViewState.bBox.y,
        );
        this.interactionNodes.push(returnTargetNodeModel);

        // create link between return source and return target
        const returnLink = new NodeLinkModel({ brokenLine: true });
        returnLink.setSourcePort(returnSourceNodeModel.getLeftPort());
        returnLink.setTargetPort(returnTargetNodeModel.getRightPort());
        returnLink.setSourceNode(returnSourceNodeModel);
        returnLink.setTargetNode(returnTargetNodeModel);
        this.links.push(returnLink);
    }

    beginVisitReturn(node: Node, _parent?: DiagramElement, callNode?: Node): void {
        if (!node.viewStates) {
            console.warn(">> View state not found for interaction", node);
            return;
        }
        // create source node
        const sourceNodeViewStateLabel = getViewStateLabel(ViewStateLabel.SOURCE_NODE, getNodeId(callNode));
        const sourceNodeViewState = node.viewStates.find((viewState) => viewState.label === sourceNodeViewStateLabel);
        if (!sourceNodeViewState) {
            console.warn(">> Source view state not found for node", node);
            return;
        }
        const sourceNodeModel = new EmptyNodeModel(getNodeId(node, sourceNodeViewStateLabel));
        sourceNodeModel.setPosition(
            sourceNodeViewState.bBox.x + (PARTICIPANT_NODE_WIDTH - EMPTY_NODE_WIDTH) / 2,
            sourceNodeViewState.bBox.y,
        );
        this.interactionNodes.push(sourceNodeModel);

        // create target node
        const targetNodeViewStateLabel = getViewStateLabel(ViewStateLabel.TARGET_NODE, getNodeId(callNode));
        const targetNodeViewState = node.viewStates.find((viewState) => viewState.label === targetNodeViewStateLabel);
        if (!targetNodeViewState) {
            console.warn(">> Target view state not found for node", node);
            return;
        }
        const targetNodeModel = new EmptyNodeModel(getNodeId(node, targetNodeViewStateLabel));
        targetNodeModel.setPosition(
            targetNodeViewState.bBox.x + (PARTICIPANT_NODE_WIDTH - EMPTY_NODE_WIDTH) / 2,
            targetNodeViewState.bBox.y,
        );
        this.interactionNodes.push(targetNodeModel);

        // create link between source and target
        const link = new NodeLinkModel({ brokenLine: true });
        link.setSourcePort(sourceNodeModel.getLeftPort());
        link.setTargetPort(targetNodeModel.getRightPort());
        link.setSourceNode(sourceNodeModel);
        link.setTargetNode(targetNodeModel);
        this.links.push(link);
    }
}
