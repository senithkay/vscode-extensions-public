/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    Log,
    STNode,
    Visitor,
    Resource,
    APIResource,
    Sequence,
    Throttle,
    traversNode,
    Store,
    Property,
    PropertyGroup,
    Respond,
    Loopback,
    Call,
    CallTemplate,
    Send,
    Drop
} from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { BaseNodeModel } from '../../components/base/base-node/base-node';
import { SimpleMediatorNodeModel } from '../../components/nodes/mediators/simpleMediator/SimpleMediatorModel';
import { MEDIATORS } from '../../constants';
import { AdvancedMediatorNodeModel } from '../../components/nodes/mediators/advancedMediator/AdvancedMediatorModel';

export class NodeInitVisitor implements Visitor {
    private currentSequence: BaseNodeModel[];
    private inSequenceNodes: BaseNodeModel[] = [];
    private outSequenceNodes: BaseNodeModel[] = [];
    private parents: STNode[] = [];
    private documentUri: string;
    private isInOutSequence = false;
    private skipChildrenVisit = false;

    constructor(documentUri: string) {
        this.documentUri = documentUri;
    };

    beginVisitResource(node: Resource): void {
        this.parents.push(node);

        if ((node as any).inSequence || (node as any).outSequence) {
            this.beginVisitAPIResource(node as any);
        }
    }

    beginVisitAPIResource(node: APIResource): void {
        this.parents.push(node);
    }

    endVisitAPIResource(_node: APIResource): void {
        this.parents.pop();
    }

    beginVisitLog(node: Log) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.LOG,
                description: node.level.toString(),
                documentUri: this.documentUri,
                isInOutSequence: this.isInOutSequence,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitStore(node: Store) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.STORE,
                description: node.messageStore ? node.messageStore.toString() : "",
                documentUri: this.documentUri,
                isInOutSequence: this.isInOutSequence,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitProperty(node: Property) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.PROPERTY,
                description: node.type.toString(),
                documentUri: this.documentUri,
                isInOutSequence: this.isInOutSequence,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitPropertyGroup(node: PropertyGroup) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.PROPERTYGROUP,
                description: node.description ? node.description.toString() : "",
                documentUri: this.documentUri,
                isInOutSequence: this.isInOutSequence,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitRespond(node: Respond) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.RESPOND,
                description: node.description ? node.description.toString() : "",
                documentUri: this.documentUri,
                isInOutSequence: this.isInOutSequence,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitLoopback(node: Loopback) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.LOOPBACK,
                description: node.description ? node.description.toString() : "",
                documentUri: this.documentUri,
                isInOutSequence: this.isInOutSequence,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitCall(node: Call) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.CALL,
                description: node.description ? node.description.toString() : "",
                documentUri: this.documentUri,
                isInOutSequence: this.isInOutSequence,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitCallTemplate(node: CallTemplate) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.CALLTEMPLATE,
                description: node.target?.toString(),
                documentUri: this.documentUri,
                isInOutSequence: this.isInOutSequence,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitSend(node: Send) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.SEND,
                description: node.description ? node.description.toString() : "",
                documentUri: this.documentUri,
                isInOutSequence: this.isInOutSequence,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitSequence(node: Sequence) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.SEQUENCE,
                description: node.tag? node.tag.toString() : "",
                documentUri: this.documentUri,
                isInOutSequence: this.isInOutSequence,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitDrop(node: Drop) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.DROP,
                description: node.description? node.description.toString() : "",
                documentUri: this.documentUri,
                isInOutSequence: this.isInOutSequence,
                parentNode: this.parents[this.parents.length - 1],
                dropSequence: true
            }
            ));
    }

    beginVisitThrottle(node: Throttle): void {
        const currentSequence = this.currentSequence;
        const onAcceptSequenceNodes: [] = [];
        const onRejectSequenceNodes: [] = [];

        this.parents.push(node);
        if (node.onAccept) {
            this.currentSequence = onAcceptSequenceNodes;
            (node.onAccept.mediatorList as any).forEach((mediator: STNode) => {
                traversNode(mediator, this);
            });
        }

        if (node.onReject) {
            this.currentSequence = onRejectSequenceNodes;
            (node.onReject.mediatorList as any).forEach((mediator: STNode) => {
                traversNode(mediator, this);
            });
        }
        this.parents.pop();

        this.currentSequence = currentSequence;
        this.currentSequence.push(
            new AdvancedMediatorNodeModel({
                node: node,
                name: MEDIATORS.THROTTLE,
                description: node.id?.toString(),
                documentUri: this.documentUri,
                isInOutSequence: this.isInOutSequence,
                parentNode: this.parents[this.parents.length - 1],
                subSequences: [{
                    name: "OnAccept", nodes: onAcceptSequenceNodes
                }, {
                    name: "OnReject", nodes: onRejectSequenceNodes
                }]
            }
            ));
        this.skipChildrenVisit = true;
    }

    endVisitThrottle(): void {
        this.skipChildrenVisit = false;
    }

    beginVisitInSequence(node: Sequence): void {
        this.currentSequence = this.inSequenceNodes;
        this.parents.push(node);
    }

    endVisitInSequence(): void {
        this.parents.pop();
    }

    beginVisitOutSequence(node: Sequence): void {
        this.isInOutSequence = true;
        this.currentSequence = this.outSequenceNodes;
        this.parents.push(node);
    }

    endVisitOutSequence(): void {
        this.isInOutSequence = false;
        this.parents.pop();
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    getInSequenceNodes(): BaseNodeModel[] {
        return this.inSequenceNodes;
    }

    getOutSequenceNodes(): BaseNodeModel[] {
        return this.outSequenceNodes;
    }
}

