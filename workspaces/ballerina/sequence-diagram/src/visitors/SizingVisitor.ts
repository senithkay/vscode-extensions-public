/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    INTERACTION_NODE_HEIGHT,
    INTERACTION_NODE_WIDTH,
    PARTICIPANT_NODE_HEIGHT,
    PARTICIPANT_NODE_WIDTH,
} from "../resources/constants";
import { getInitialViewState, getNodeId } from "../utils/diagram";
import { DiagramElement, Node, Participant, ViewStateLabel } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class SizingVisitor implements BaseVisitor {
    private height = 0;

    constructor() {
        console.log(">>>> Sizing factory visitor started");
    }

    endVisitParticipant(participant: Participant): void {
        if (!participant.viewState) {
            participant.viewState = getInitialViewState();
        }
        participant.viewState.bBox.w = PARTICIPANT_NODE_WIDTH;
        participant.viewState.bBox.h = Math.max(this.height, PARTICIPANT_NODE_HEIGHT);
    }

    endVisitNode(node: Node, parent?: DiagramElement, callNode?: Node): void {
        if (!node.viewStates) {
            node.viewStates = [];
        }

        node.viewStates.push(
            getInitialViewState(
                ViewStateLabel.SOURCE_NODE,
                INTERACTION_NODE_HEIGHT,
                INTERACTION_NODE_WIDTH,
                getNodeId(callNode),
            ),
        );
        node.viewStates.push(
            getInitialViewState(
                ViewStateLabel.TARGET_NODE,
                INTERACTION_NODE_HEIGHT,
                INTERACTION_NODE_WIDTH,
                getNodeId(callNode),
            ),
        );

        this.height = this.height + INTERACTION_NODE_HEIGHT;
    }

    endVisitEndpointCall(node: Node, parent?: DiagramElement): void {
        if (!node.viewStates) {
            node.viewStates = [
                getInitialViewState(ViewStateLabel.SOURCE_NODE, INTERACTION_NODE_HEIGHT, INTERACTION_NODE_WIDTH),
                getInitialViewState(ViewStateLabel.TARGET_NODE, INTERACTION_NODE_HEIGHT, INTERACTION_NODE_WIDTH),
                getInitialViewState(ViewStateLabel.RETURN_SOURCE_NODE, INTERACTION_NODE_HEIGHT, INTERACTION_NODE_WIDTH),
                getInitialViewState(ViewStateLabel.RETURN_TARGET_NODE, INTERACTION_NODE_HEIGHT, INTERACTION_NODE_WIDTH),
            ];
        }
        this.height = this.height + INTERACTION_NODE_HEIGHT * 2;
    }
}
