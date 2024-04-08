/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    INTERACTION_GAP_Y,
    INTERACTION_NODE_HEIGHT,
    PARTICIPANT_GAP_X,
    PARTICIPANT_NODE_WIDTH,
} from "../resources/constants";
import { getNodeId } from "../utils/diagram";
import { getParentBBox, getViewStateLabel } from "../utils/diagram";
import { Participant, Node, ViewStateLabel, DiagramElement, Flow } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class PositionVisitor implements BaseVisitor {
    private flow: Flow;
    private lastParticipantIndex = 0;
    private lastInteractionIndex = 1;

    constructor(flow: Flow) {
        console.log(">>>> Position factory visitor started");
        this.flow = flow;
    }

    beginVisitParticipant(participant: Participant): void {
        if (!participant.viewState) {
            console.warn(">> View state not found for participant", participant);
            return;
        }
        // Update the horizontal position of the participant node if not already set
        if (participant.viewState.bBox.x === 0) {
            participant.viewState.bBox.x = this.lastParticipantIndex * (PARTICIPANT_GAP_X + PARTICIPANT_NODE_WIDTH);
            this.lastParticipantIndex++;
        }
    }

    endVisitEndpointCall(node: Node, parent?: DiagramElement): void {
        if (!node.viewStates) {
            console.warn(">> View state not found for node", node);
            return;
        }
        const parentBBox = getParentBBox(parent);
        // position source node
        const sourceNodeViewState = node.viewStates.find((viewState) => viewState.label === ViewStateLabel.SOURCE_NODE);
        if (!sourceNodeViewState) {
            console.warn(">> Source view state not found for node", node);
            return;
        }
        sourceNodeViewState.bBox.x = parentBBox.x;
        sourceNodeViewState.bBox.y = this.lastInteractionIndex * (INTERACTION_GAP_Y + INTERACTION_NODE_HEIGHT);

        // position target node
        if (!node.targetId) {
            console.warn(">> Target ID not found for node Endpoint", node);
            return;
        }
        const targetNodeViewState = node.viewStates.find((viewState) => viewState.label === ViewStateLabel.TARGET_NODE);
        if (!targetNodeViewState) {
            console.warn(">> Target view state not found for node", node);
            return;
        }
        const targetParticipant = this.flow.participants.find((participant) => participant.id === node.targetId) as Participant;
        targetNodeViewState.bBox.x = targetParticipant.viewState.bBox.x;
        targetNodeViewState.bBox.y = this.lastInteractionIndex * (INTERACTION_GAP_Y + INTERACTION_NODE_HEIGHT);
        this.lastInteractionIndex++;

        // position return source node
        const returnSourceNodeViewState = node.viewStates.find(
            (viewState) => viewState.label === ViewStateLabel.RETURN_SOURCE_NODE,
        );
        if (!returnSourceNodeViewState) {
            console.warn(">> Return source view state not found for node", node);
            return;
        }
        returnSourceNodeViewState.bBox.x = targetParticipant.viewState.bBox.x;
        returnSourceNodeViewState.bBox.y = this.lastInteractionIndex * (INTERACTION_GAP_Y + INTERACTION_NODE_HEIGHT);

        // position return target node
        const returnTargetNodeViewState = node.viewStates.find(
            (viewState) => viewState.label === ViewStateLabel.RETURN_TARGET_NODE,
        );
        if (!returnTargetNodeViewState) {
            console.warn(">> Return target view state not found for node", node);
            return;
        }
        returnTargetNodeViewState.bBox.x = parentBBox.x;
        returnTargetNodeViewState.bBox.y = this.lastInteractionIndex * (INTERACTION_GAP_Y + INTERACTION_NODE_HEIGHT);
        this.lastInteractionIndex++;
    }

    beginVisitNode(node: Node, parent?: DiagramElement, callNode?: Node): void {
        // console.log(">> End visit node", node);
        if (!node.viewStates) {
            console.warn(">> View state not found for node", node);
            return;
        }
        const parentBBox = getParentBBox(parent);
        // position source node
        const sourceNodeViewState = node.viewStates.find(
            (viewState) => viewState.label === getViewStateLabel(ViewStateLabel.SOURCE_NODE, getNodeId(callNode)),
        );
        if (!sourceNodeViewState) {
            console.warn(">> Source view state not found for node", node);
            return;
        }
        // sourceNodeViewState.bBox.x = parentBBox.x;
        sourceNodeViewState.bBox.y = this.lastInteractionIndex * (INTERACTION_GAP_Y + INTERACTION_NODE_HEIGHT);

        // position target node
        if (!node.targetId) {
            console.warn(">> Target ID not found for node", node);
            return;
        }
        const targetNodeViewState = node.viewStates.find(
            (viewState) => viewState.label === getViewStateLabel(ViewStateLabel.TARGET_NODE, getNodeId(callNode)),
        );
        if (!targetNodeViewState) {
            console.warn(">> Target view state not found for node", node);
            return;
        }
        const targetParticipant = this.flow.participants.find((participant) => participant.id === node.targetId);
        // targetNodeViewState.bBox.x = targetParticipant.viewState.bBox.x;
        targetNodeViewState.bBox.y = this.lastInteractionIndex * (INTERACTION_GAP_Y + INTERACTION_NODE_HEIGHT);
        this.lastInteractionIndex++;
    }

    endVisitNode(node: Node, parent?: DiagramElement, callNode?: Node): void {
        // console.log(">> End visit node", node);
        if (!node.viewStates) {
            console.warn(">> View state not found for node", node);
            return;
        }
        const parentBBox = getParentBBox(parent);
        // position source node
        const sourceNodeViewState = node.viewStates.find(
            (viewState) => viewState.label === getViewStateLabel(ViewStateLabel.SOURCE_NODE, getNodeId(callNode)),
        );
        if (!sourceNodeViewState) {
            console.warn(">> Source view state not found for node", node);
            return;
        }
        sourceNodeViewState.bBox.x = parentBBox.x;
        // sourceNodeViewState.bBox.y = this.lastInteractionIndex * (INTERACTION_GAP_Y + INTERACTION_NODE_HEIGHT);

        // position target node
        if (!node.targetId) {
            console.warn(">> Target ID not found for node", node);
            return;
        }
        const targetNodeViewState = node.viewStates.find(
            (viewState) => viewState.label === getViewStateLabel(ViewStateLabel.TARGET_NODE, getNodeId(callNode)),
        );
        if (!targetNodeViewState) {
            console.warn(">> Target view state not found for node", node);
            return;
        }
        const targetParticipant = this.flow.participants.find((participant) => participant.id === node.targetId) as Participant;
        targetNodeViewState.bBox.x = targetParticipant.viewState.bBox.x;
        // targetNodeViewState.bBox.y = this.lastInteractionIndex * (INTERACTION_GAP_Y + INTERACTION_NODE_HEIGHT);
        // this.lastInteractionIndex++;
    }

    beginVisitReturn(node: Node, parent?: DiagramElement, callNode?: Node): void {
        // console.log(">> End visit return node", node);
        if (!node.viewStates) {
            console.warn(">> View state not found for node", node);
            return;
        }
        const parentBBox = getParentBBox(parent);
        // position source node
        const sourceNodeViewState = node.viewStates.find(
            (viewState) => viewState.label === getViewStateLabel(ViewStateLabel.SOURCE_NODE, getNodeId(callNode)),
        );
        if (!sourceNodeViewState) {
            console.warn(">> Source view state not found for node", node);
            return;
        }
        // sourceNodeViewState.bBox.x = parentBBox.x;
        sourceNodeViewState.bBox.y = this.lastInteractionIndex * (INTERACTION_GAP_Y + INTERACTION_NODE_HEIGHT);

        // position target node
        const targetNodeViewState = node.viewStates.find(
            (viewState) => viewState.label === getViewStateLabel(ViewStateLabel.TARGET_NODE, getNodeId(callNode)),
        );
        if (!targetNodeViewState) {
            console.warn(">> Target view state not found for node", node);
            return;
        }
        // const targetParticipant = previousParticipant;
        // targetNodeViewState.bBox.x = targetParticipant.viewState.bBox.x;
        targetNodeViewState.bBox.y = this.lastInteractionIndex * (INTERACTION_GAP_Y + INTERACTION_NODE_HEIGHT);
        this.lastInteractionIndex++;
    }

    endVisitReturn(node: Node, parent?: DiagramElement, callNode?: Node): void {
        // console.log(">> End visit return node", node);
        if (!node.viewStates) {
            console.warn(">> View state not found for node", node);
            return;
        }
        const parentBBox = getParentBBox(parent);
        // position source node
        const sourceNodeViewState = node.viewStates.find(
            (viewState) => viewState.label === getViewStateLabel(ViewStateLabel.SOURCE_NODE, getNodeId(callNode)),
        );
        if (!sourceNodeViewState) {
            console.warn(">> Source view state not found for node", node);
            return;
        }
        sourceNodeViewState.bBox.x = parentBBox.x;
        // sourceNodeViewState.bBox.y = this.lastInteractionIndex * (INTERACTION_GAP_Y + INTERACTION_NODE_HEIGHT);

        // position target node
        const targetNodeViewState = node.viewStates.find(
            (viewState) => viewState.label === getViewStateLabel(ViewStateLabel.TARGET_NODE, getNodeId(callNode)),
        );
        if (!targetNodeViewState) {
            console.warn(">> Target view state not found for node", node);
            return;
        }
        targetNodeViewState.bBox.x = callNode.viewStates.at(0).bBox.x; // TODO: Fix this
        // targetNodeViewState.bBox.y = this.lastInteractionIndex * (INTERACTION_GAP_Y + INTERACTION_NODE_HEIGHT);
        // this.lastInteractionIndex++;
    }
}
