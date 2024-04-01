/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import _ from "lodash";
import { BaseVisitor } from "../visitors/BaseVisitor";
import { DiagramElement, Flow, Node, NodeKind, Participant } from "./types";
import { DiagramElementKindChecker } from "./check-kind-utils";

export function traverseParticipant(participant: Participant, visitor: BaseVisitor, flow: Flow, callNode?: Node) {
    if (!participant.kind) {
        console.warn("Node kind is not defined", participant);
        return;
    }
    const name = _.chain(participant.kind).camelCase().upperFirst().value();

    let beginVisitFn: any = (visitor as any)[`beginVisit${name}`];
    if (!beginVisitFn) {
        beginVisitFn = visitor.beginVisitParticipant && visitor.beginVisitParticipant;
    }

    if (beginVisitFn) {
        beginVisitFn.bind(visitor)(participant, flow, callNode);
    }

    const keys = Object.keys(participant);
    keys.forEach((key) => {
        const childNode = (participant as any)[key] as any;
        if (Array.isArray(childNode)) {
            childNode.forEach((elementNode) => {
                if (!elementNode?.kind) {
                    return;
                }
                traverseNode(elementNode, visitor, participant, flow, callNode);
            });
            return;
        }

        if (!childNode.kind) {
            return;
        }
        traverseNode(childNode, visitor, participant, flow, callNode);
    });

    let endVisitFn: any = (visitor as any)[`endVisit${name}`];
    if (!endVisitFn) {
        endVisitFn = visitor.endVisitParticipant && visitor.endVisitParticipant;
    }
    if (endVisitFn) {
        endVisitFn.bind(visitor)(participant, flow, callNode);
    }
}

export function traverseNode(node: Node, visitor: BaseVisitor, parent: DiagramElement, flow: Flow, callNode?: Node) {
    if (!node.kind) {
        console.warn("Node kind is not defined", node);
        return;
    }
    let name = _.chain(node.kind).camelCase().upperFirst().value();
    if (node.kind === NodeKind.INTERACTION) {
        name = _.chain(node.interactionType).camelCase().upperFirst().value();
    }
    let beginVisitFn: any = (visitor as any)[`beginVisit${name}`];
    if (!beginVisitFn) {
        beginVisitFn = visitor.beginVisitNode && visitor.beginVisitNode;
    }

    if (beginVisitFn) {
        beginVisitFn.bind(visitor)(node, parent, callNode);
    }

    // navigate to another participant
    if (DiagramElementKindChecker.isInteraction(node) && node.targetId) {
        const targetParticipant = flow.participants.find((p) => p.id === node.targetId);
        if (targetParticipant) {
            traverseParticipant(targetParticipant, visitor, flow, node);
        }
    }

    const keys = Object.keys(node);
    keys.forEach((key) => {
        const childNode = (node as any)[key] as any;
        if (Array.isArray(childNode)) {
            childNode.forEach((elementNode) => {
                if (!elementNode?.kind) {
                    return;
                }

                traverseNode(elementNode, visitor, node, flow);
            });
            return;
        }

        if (!childNode.kind) {
            return;
        }

        traverseNode(childNode, visitor, node, flow);
    });

    let endVisitFn: any = (visitor as any)[`endVisit${name}`];
    if (!endVisitFn) {
        endVisitFn = visitor.endVisitNode && visitor.endVisitNode;
    }

    if (endVisitFn) {
        endVisitFn.bind(visitor)(node, parent, callNode);
    }
}
