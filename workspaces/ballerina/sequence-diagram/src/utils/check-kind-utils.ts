/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    DiagramElement,
    ParticipantType,
    Participant,
    NodeKind,
    InteractionType,
} from "./types";

export class DiagramElementKindChecker {
    static isParticipant(element: DiagramElement): element is Participant {
        return (
            element.kind === ParticipantType.ENDPOINT ||
            element.kind === ParticipantType.FUNCTION
        );
    }

    static isEndpoint(element: DiagramElement): element is Participant {
        return element.kind === ParticipantType.ENDPOINT;
    }

    static isFunction(element: DiagramElement): element is Participant {
        return element.kind === ParticipantType.FUNCTION;
    }

    static isInteraction(element: DiagramElement): boolean {
        return element.kind === NodeKind.INTERACTION;
    }

    static isEndpointCall(element: DiagramElement): boolean {
        return (
            element.kind === NodeKind.INTERACTION &&
            element.interactionType === InteractionType.ENDPOINT_CALL
        );
    }

    static isFunctionCall(element: DiagramElement): boolean {
        return (
            element.kind === NodeKind.INTERACTION &&
            element.interactionType === InteractionType.FUNCTION_CALL
        );
    }

    static isReturnCall(element: DiagramElement): boolean {
        return (
            element.kind === NodeKind.INTERACTION &&
            element.interactionType === InteractionType.RETURN_CALL
        );
    }

    static isIf(element: DiagramElement): boolean {
        return element.kind === NodeKind.IF;
    }

    static isWhile(element: DiagramElement): boolean {
        return element.kind === NodeKind.WHILE;
    }
}
