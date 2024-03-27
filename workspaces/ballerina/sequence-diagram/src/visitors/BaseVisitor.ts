/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Flow, Node, Participant } from "../utils/types";

export interface BaseVisitor {
    skipChildren(): boolean;

    // participants
    beginVisitParticipant?(node: Participant, parent?: Flow): void;
    endVisitParticipant?(node: Participant, parent?: Flow): void;

    beginVisitEndpoint?(node: Participant, parent?: Flow): void;
    endVisitEndpoint?(node: Participant, parent?: Flow): void;

    beginVisitFunction?(node: Participant, parent?: Flow): void;
    endVisitFunction?(node: Participant, parent?: Flow): void;

    // interactions
    beginVisitNode?(node: Node, parent?: Node): void;
    endVisitNode?(node: Node, parent?: Node): void;

    beginVisitInteraction?(node: Node, parent?: Node): void;
    endVisitInteraction?(node: Node, parent?: Node): void;

    beginVisitEndpointCall?(node: Node, parent?: Node): void;
    endVisitEndpointCall?(node: Node, parent?: Node): void;

    beginVisitFunctionCall?(node: Node, parent?: Node): void;
    endVisitFunctionCall?(node: Node, parent?: Node): void;

    beginVisitReturnCall?(node: Node, parent?: Node): void;
    endVisitReturnCall?(node: Node, parent?: Node): void;

    // operations
    beginVisitWhile?(node: Node, parent?: Node): void;
    endVisitWhile?(node: Node, parent?: Node): void;

    beginVisitIf?(node: Node, parent?: Node): void;
    endVisitIf?(node: Node, parent?: Node): void;
}
