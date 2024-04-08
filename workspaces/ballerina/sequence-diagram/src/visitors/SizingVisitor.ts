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
    constructor() {
        console.log(">>>> Sizing factory visitor started");
    }

    endVisitParticipant(participant: Participant): void {
        if (!participant.viewState) {
            participant.viewState = getInitialViewState();
        }

        let childrenHeight = 0;
        let childrenWidth = 0;

        participant.nodes?.forEach((node) => {
            if ((node as Node).viewStates) {
                (node as Node).viewStates.forEach((viewState) => {
                    childrenHeight += viewState.bBox.h;
                    childrenWidth += viewState.bBox.w;
                });
            }
        });

        participant.viewState.bBox.w = Math.max(childrenWidth, PARTICIPANT_NODE_WIDTH);
        participant.viewState.bBox.h = Math.max(childrenHeight, PARTICIPANT_NODE_HEIGHT);
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

        let nodeHeight = 0;
        let nodeWidth = 0;

        node.viewStates.forEach((viewState) => {
            nodeHeight += viewState.bBox.h;
            nodeWidth += viewState.bBox.w;
        });
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
    }
}
